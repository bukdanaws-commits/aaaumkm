import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findMany } from '@/lib/supabase-queries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const excludeId = searchParams.get('excludeId');
    const limit = parseInt(searchParams.get('limit') || '8');

    if (!categoryId) {
      return NextResponse.json(
        { error: 'categoryId is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    
    const filters: Record<string, any> = {
      category_id: categoryId,
      status: 'active',
    };
    
    if (excludeId) {
      filters.id = { not: excludeId };
    }

    const { data: listings, error } = await findMany(supabase, 'listings', {
      select: 'id, title, slug, price, city, view_count, is_featured',
      filters,
      limit,
      orderBy: [
        { column: 'is_featured', ascending: false },
        { column: 'created_at', ascending: false },
      ],
    });

    if (error) {
      console.error('Error fetching related listings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch related listings' },
        { status: 500 }
      );
    }

    // Fetch images and categories separately for each listing
    const listingsWithDetails = await Promise.all(
      (listings || []).map(async (listing: any) => {
        const { data: images } = await supabase
          .from('listing_images')
          .select('url')
          .eq('listing_id', listing.id)
          .eq('is_primary', true)
          .limit(1);

        const { data: category } = await supabase
          .from('categories')
          .select('name')
          .eq('id', categoryId)
          .single();

        return {
          ...listing,
          images: images || [],
          category: category ? { name: category.name } : null,
        };
      })
    );

    return NextResponse.json({ listings: listingsWithDetails });
  } catch (error) {
    console.error('Error fetching related listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch related listings' },
      { status: 500 }
    );
  }
}
