import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findMany } from '@/lib/supabase-queries';
import { Listing } from '@/types/supabase';

export async function GET(request: NextRequest) {
  try {
    // Check for demo/mock authentication (development mode)
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      // Demo mode: extract userId from Bearer token
      userId = authHeader.substring(7);
    } else {
      // Try Supabase authentication
      const supabase = await createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = user.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = getSupabaseClient();

    // Get user's listings
    const { data: listings } = await findMany<Listing>(adminSupabase, 'listings', {
      filters: { userId },
      orderBy: [{ column: 'createdAt', ascending: false }],
      select: 'id, title, price, status, viewCount, createdAt'
    });

    const listingIds = (listings || []).map(l => l.id);

    // Get images for listings
    const { data: images } = listingIds.length > 0 ? await adminSupabase
      .from('listing_images')
      .select('listing_id, image_url, is_primary')
      .in('listing_id', listingIds) : { data: null };

    const imageMap = new Map();
    (images || []).forEach(img => {
      if (!imageMap.has(img.listing_id)) {
        imageMap.set(img.listing_id, []);
      }
      imageMap.get(img.listing_id).push({
        image_url: img.image_url,
        is_primary: img.is_primary
      });
    });

    // Format listings
    const formattedListings = (listings || []).map(listing => ({
      id: listing.id,
      title: listing.title,
      price: listing.price,
      status: listing.status,
      view_count: listing.viewCount,
      created_at: listing.createdAt,
      listing_images: imageMap.get(listing.id) || [],
    }));

    return NextResponse.json({ listings: formattedListings });
  } catch (error) {
    console.error('Error fetching user listings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
