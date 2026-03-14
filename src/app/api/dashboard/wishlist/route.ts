import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findMany, remove } from '@/lib/supabase-queries';
import { SavedListing, Listing } from '@/types/supabase';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    const adminSupabase = getSupabaseClient();

    // Get saved listings
    const { data: savedListings } = await findMany<SavedListing>(adminSupabase, 'saved_listings', {
      filters: { userId },
      orderBy: [{ column: 'createdAt', ascending: false }]
    });

    const listingIds = (savedListings || []).map(s => s.listingId);

    // Get listings with images
    const { data: listings } = listingIds.length > 0 ? await adminSupabase
      .from('listings')
      .select(`
        id, title, price, price_type, condition, status, city, province,
        view_count, is_featured, created_at,
        listing_images(image_url, is_primary),
        categories(name)
      `)
      .in('id', listingIds) : { data: null };

    const listingMap = new Map();
    (listings || []).forEach(l => {
      listingMap.set(l.id, {
        id: l.id,
        title: l.title,
        price: l.price,
        price_type: l.price_type,
        condition: l.condition,
        status: l.status,
        city: l.city,
        province: l.province,
        view_count: l.view_count,
        is_featured: l.is_featured,
        created_at: l.created_at,
        listing_images: (l.listing_images || []).map(img => ({
          image_url: img.image_url,
          is_primary: img.is_primary
        })),
        categories: l.categories
      });
    });

    const formattedListings = (savedListings || []).map(saved => ({
      id: saved.id,
      created_at: saved.createdAt,
      listing: listingMap.get(saved.listingId) || null,
    }));

    return NextResponse.json({ savedListings: formattedListings });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { savedId } = await request.json();

    if (!savedId) {
      return NextResponse.json({ error: 'savedId is required' }, { status: 400 });
    }

    const adminSupabase = getSupabaseClient();

    // Verify ownership
    const { data: savedListing } = await adminSupabase
      .from('saved_listings')
      .select('user_id')
      .eq('id', savedId)
      .single();

    if (!savedListing || savedListing.user_id !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await remove(adminSupabase, 'saved_listings', savedId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
