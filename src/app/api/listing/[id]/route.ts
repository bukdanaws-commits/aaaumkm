import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient, getSupabaseAdmin } from '@/lib/supabase-client';
import { findOne, findMany, update, create, remove } from '@/lib/supabase-queries';
import { Listing, ListingImage, ListingAuction, AuctionBid, ListingBoost, Profile, Category } from '@/types/supabase';

// PUT - Update listing
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      description,
      price,
      categoryId,
      condition,
      city,
      province,
      listingType,
      images,
      primaryImageIndex,
      status,
    } = body;

    const supabase = getSupabaseAdmin();

    // Check if listing exists
    const { data: existingListing, error: findError } = await findOne<Listing>(supabase, 'listings', id);

    if (findError || !existingListing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Create slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100);

    // Update listing
    const { data: listing, error: updateError } = await update<Listing>(supabase, 'listings', id, {
      title,
      slug,
      description,
      price: parseFloat(price) || 0,
      categoryId,
      condition: condition || 'new',
      city,
      province,
      listingType: listingType || 'sale',
      status: status || existingListing.status,
    });

    if (updateError) throw updateError;

    // Update images if provided
    if (images && images.length > 0) {
      // Delete existing images
      await supabase.from('listing_images').delete().eq('listingId', id);

      // Create new images
      const imageData = images.map((url: string, index: number) => ({
        listingId: id,
        imageUrl: url,
        isPrimary: index === (primaryImageIndex || 0),
        sortOrder: index,
      }));

      const { error: imagesError } = await supabase.from('listing_images').insert(imageData);
      if (imagesError) throw imagesError;
    }

    return NextResponse.json({ listing });
  } catch (error) {
    console.error('Error updating listing:', error);
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    );
  }
}

// DELETE - Delete listing
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();

    // Check if listing exists
    const { data: existingListing, error: findError } = await findOne<Listing>(supabase, 'listings', id);

    if (findError || !existingListing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Soft delete by setting status to deleted
    const { error: deleteError } = await update<Listing>(supabase, 'listings', id, {
      status: 'deleted',
      deletedAt: new Date().toISOString(),
    });

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting listing:', error);
    return NextResponse.json(
      { error: 'Failed to delete listing' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  const implementation = 'supabase';
  
  try {
    const { id } = await params;
    const supabase = getSupabaseClient();

    // Fetch listing with relations using join syntax
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select(`
        id, title, slug, description, price, priceType, listingType, condition,
        status, city, province, provinceId, regencyId, viewCount, clickCount,
        shareCount, favoriteCount, inquiryCount, isFeatured, keywords,
        publishedAt, expiresAt, soldTo, soldAt, createdAt, updatedAt,
        userId, categoryId,
        profile:profiles!inner (
          userId, name, phone, avatarUrl, city, province, isVerified,
          averageRating, totalReviews, totalListings, soldCount, createdAt
        ),
        category:categories!inner (id, name, slug),
        listing_images (id, imageUrl, isPrimary, sortOrder),
        listing_auctions (
          id, listingId, startingPrice, currentPrice, buyNowPrice,
          minIncrement, reservePrice, startsAt, endsAt, status,
          winnerId, totalBids, createdAt, updatedAt
        ),
        listing_boosts (id, listingId, boostType, status, creditsCost, startsAt, endsAt, createdAt),
        saved_listings (userId)
      `)
      .eq('id', id)
      .single();

    if (listingError || !listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await supabase
      .from('listings')
      .update({ viewCount: (listing.viewCount || 0) + 1 })
      .eq('id', id);

    // Get similar listings from same category
    const { data: similarListings, error: similarError } = await supabase
      .from('listings')
      .select(`
        id, title, slug, price, condition, city, province, viewCount,
        listing_images!inner (imageUrl),
        categories!inner (name, slug)
      `)
      .eq('categoryId', listing.categoryId)
      .eq('status', 'active')
      .neq('id', id)
      .order('createdAt', { ascending: false })
      .limit(8);

    if (similarError) throw similarError;

    // Format listing data
    const formatListing = (l: any) => ({
      ...l,
      images: l.listing_images || [],
      category: l.categories || { name: '', slug: '' },
    });

    const result = {
      listing: {
        ...formatListing(listing),
        isSaved: false,
        savedCount: (listing.saved_listings || []).length,
      },
      similarListings: (similarListings || []).map(formatListing),
    };

    // Log performance metrics
    const duration = Date.now() - startTime;
    console.log(
      `[METRICS] detail (${implementation}) - ${duration}ms - endpoint: /api/listing/[id]`
    );

    // Log slow queries
    const slowQueryThreshold = parseInt(
      process.env.LOG_SLOW_QUERIES_MS || '1000',
      10
    );
    if (duration > slowQueryThreshold) {
      console.warn(
        `[SLOW_QUERY] detail (${implementation}) - ${duration}ms - endpoint: /api/listing/[id]`
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    // Log error with metrics
    console.error(`[ERROR] detail (${implementation}) - ${duration}ms`, {
      error: error.message,
      endpoint: '/api/listing/[id]',
      timestamp: new Date().toISOString(),
    });

    // Handle 404 errors specifically
    if (error.message === 'Listing not found') {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch listing' },
      { status: 500 }
    );
  }
}