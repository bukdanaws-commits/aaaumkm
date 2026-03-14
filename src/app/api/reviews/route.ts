import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findMany, findOne, create } from '@/lib/supabase-queries';
import { SellerReview, Profile, Order } from '@/types/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');

    if (!sellerId) {
      return NextResponse.json(
        { error: 'sellerId is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Get reviews for seller with reviewer info
    const { data: reviews, error: reviewsError } = await findMany<SellerReview>(supabase, 'seller_reviews', {
      filters: { sellerId },
      orderBy: [{ column: 'createdAt', ascending: false }],
      limit: 10,
    });

    if (reviewsError) throw reviewsError;

    // Get all reviews for this seller to calculate stats
    const { data: allReviews, error: allReviewsError } = await findMany<SellerReview>(supabase, 'seller_reviews', {
      filters: { sellerId },
      select: 'rating',
    });

    if (allReviewsError) throw allReviewsError;

    // Get reviewer details
    const reviewerIds = (reviews || []).map(r => r.reviewerId);
    let reviewerMap: Record<string, Profile> = {};
    
    if (reviewerIds.length > 0) {
      const { data: reviewers, error: reviewersError } = await findMany<Profile>(supabase, 'profiles', {
        filters: { userId: reviewerIds },
        select: 'userId, name, avatarUrl',
      });
      
      if (!reviewersError && reviewers) {
        reviewerMap = reviewers.reduce((acc, p) => {
          acc[p.userId] = p;
          return acc;
        }, {} as Record<string, Profile>);
      }
    }

    const totalReviews = (allReviews || []).length;
    const averageRating = totalReviews > 0
      ? (allReviews || []).reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    return NextResponse.json({
      reviews: (reviews || []).map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        reviewer: {
          name: reviewerMap[r.reviewerId]?.name || 'Anonim',
          avatarUrl: reviewerMap[r.reviewerId]?.avatarUrl,
        },
      })),
      totalReviews,
      averageRating,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId, rating, comment } = body;

    if (!orderId || !rating || !comment) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabaseClient = getSupabaseClient();

    // Get the order to find seller
    const { data: order, error: orderError } = await findOne<Order>(supabaseClient, 'orders', orderId);

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const { data: review, error: reviewError } = await create<SellerReview>(supabaseClient, 'seller_reviews', {
      orderId,
      sellerId: order.sellerId,
      reviewerId: user.id,
      rating: parseInt(rating),
      comment,
    });

    if (reviewError) throw reviewError;

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}