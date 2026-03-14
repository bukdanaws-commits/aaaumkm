import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findMany } from '@/lib/supabase-queries';
import { Banner } from '@/types/supabase';

// GET /api/banners/active - Get active banners for display
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position');

    if (!position) {
      return NextResponse.json(
        { error: 'Position parameter is required' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const supabase = getSupabaseClient();

    // Get active banners for the position using Supabase
    const { data: banners, error } = await findMany<Banner>(supabase, 'banners', {
      filters: {
        position,
        status: 'active',
        deletedAt: null,
      },
      select: 'id, title, imageUrl, targetUrl, position, startsAt, endsAt',
      orderBy: [{ column: 'createdAt', ascending: false }],
      limit: 10,
    });

    if (error) throw error;

    // Filter by date in application code (Supabase doesn't support complex OR with null checks easily)
    const activeBanners = (banners || []).filter(banner => {
      if (banner.startsAt && banner.startsAt > now) return false;
      if (banner.endsAt && banner.endsAt < now) return false;
      return true;
    });

    // If no banners found, return empty
    if (activeBanners.length === 0) {
      return NextResponse.json({ banner: null });
    }

    // Select a random banner from active ones
    const randomIndex = Math.floor(Math.random() * activeBanners.length);
    const selectedBanner = activeBanners[randomIndex];

    // Increment impression count (fire and forget)
    supabase
      .from('banners')
      .update({ impressions: (selectedBanner.impressions || 0) + 1 })
      .eq('id', selectedBanner.id)
      .then()
      .catch(err => console.error('Failed to increment impression:', err));

    // Create banner event (fire and forget)
    supabase
      .from('banner_events')
      .insert({
        bannerId: selectedBanner.id,
        eventType: 'impression',
        costAmount: 0,
      })
      .then()
      .catch(err => console.error('Failed to create banner event:', err));

    return NextResponse.json({
      banner: {
        id: selectedBanner.id,
        title: selectedBanner.title,
        imageUrl: selectedBanner.imageUrl,
        targetUrl: selectedBanner.targetUrl,
        position: selectedBanner.position,
      },
    });
  } catch (error) {
    console.error('Error fetching active banners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}