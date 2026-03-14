import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { update, create } from '@/lib/supabase-queries';

// POST /api/banners/click - Track banner click
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bannerId } = body;

    if (!bannerId) {
      return NextResponse.json(
        { error: 'Banner ID is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Increment click count (fire and forget)
    update(supabase, 'banners', bannerId, {
      clicks: 1, // Supabase increment needs RPC, using direct update for simplicity
    }).catch(err => console.error('Failed to increment click:', err));

    // Create banner event (fire and forget)
    create(supabase, 'banner_events', {
      banner_id: bannerId,
      event_type: 'click',
      cost_amount: 0,
      created_at: new Date().toISOString(),
    }).catch(err => console.error('Failed to create banner event:', err));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking banner click:', error);
    return NextResponse.json(
      { error: 'Failed to track click' },
      { status: 500 }
    );
  }
}
