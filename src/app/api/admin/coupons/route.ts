import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findMany, create } from '@/lib/supabase-queries';
import { checkUserRole } from '@/lib/auth/checkRole';
import { Coupon } from '@/types/supabase';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await checkUserRole(user.id, 'admin');
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const adminSupabase = getSupabaseClient();

    const { data: coupons } = await findMany<Coupon>(adminSupabase, 'coupons', {
      orderBy: [{ column: 'createdAt', ascending: false }]
    });

    return NextResponse.json({ coupons: coupons || [] });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await checkUserRole(user.id, 'admin');
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { code, creditsAmount, maxUses, minPurchase, expiresAt } = body;

    if (!code || !creditsAmount || !maxUses) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const adminSupabase = getSupabaseClient();

    const { data: coupon, error: couponError } = await create<Coupon>(adminSupabase, 'coupons', {
      code: code.toUpperCase(),
      credits_amount: creditsAmount,
      max_uses: maxUses,
      min_purchase: minPurchase || null,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      is_active: true,
      created_by_id: user.id,
      used_count: 0,
      created_at: new Date().toISOString(),
    });

    if (couponError) throw couponError;

    return NextResponse.json({ coupon });
  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
