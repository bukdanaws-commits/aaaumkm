import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkUserRole } from '@/lib/auth/checkRole';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findMany, create } from '@/lib/supabase-queries';
import { Banner } from '@/types/supabase';

// GET /api/admin/banners - List all banners
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = await checkUserRole(user.id, 'admin');
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const adminSupabase = getSupabaseClient();

    const { data: banners } = await findMany<Banner>(adminSupabase, 'banners', {
      filters: { deletedAt: null },
      orderBy: [{ column: 'createdAt', ascending: false }]
    });

    return NextResponse.json({ banners: banners || [] });
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}

// POST /api/admin/banners - Create new banner
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = await checkUserRole(user.id, 'admin');
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, imageUrl, targetUrl, position, budgetTotal, startsAt, endsAt } = body;

    // Validation
    if (!title || !imageUrl || !targetUrl || !position || !budgetTotal || !startsAt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (budgetTotal <= 0) {
      return NextResponse.json(
        { error: 'Budget must be greater than 0' },
        { status: 400 }
      );
    }

    // Validate position
    const validPositions = [
      'marketplace-top',
      'marketplace-sidebar', 
      'marketplace-inline',
      'marketplace-inline-sidebar',
      'home-center',
      'home-center-sidebar',
      'home-inline',
      'home-inline-sidebar'
    ];
    if (!validPositions.includes(position)) {
      return NextResponse.json(
        { error: 'Invalid position' },
        { status: 400 }
      );
    }

    const adminSupabase = getSupabaseClient();

    const { data: banner, error: bannerError } = await create<Banner>(adminSupabase, 'banners', {
      userId: user.id,
      title,
      imageUrl,
      targetUrl,
      position,
      budgetTotal,
      budgetSpent: 0,
      impressions: 0,
      clicks: 0,
      status: 'pending',
      startsAt: new Date(startsAt).toISOString(),
      endsAt: endsAt ? new Date(endsAt).toISOString() : null,
      createdAt: new Date().toISOString(),
    });

    if (bannerError) throw bannerError;

    return NextResponse.json({ banner }, { status: 201 });
  } catch (error) {
    console.error('Error creating banner:', error);
    return NextResponse.json(
      { error: 'Failed to create banner' },
      { status: 500 }
    );
  }
}
