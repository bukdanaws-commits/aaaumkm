import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findOne, findMany, create, update } from '@/lib/supabase-queries';
import { UserCredit, CouponUse, Coupon } from '@/types/supabase';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    const adminSupabase = getSupabaseClient();

    // Get user credits
    const { data: userCredits } = await findOne<UserCredit>(adminSupabase, 'user_credits', userId);

    // Get user's redeemed coupons
    const { data: redeemedCoupons } = await findMany<CouponUse>(adminSupabase, 'coupon_uses', {
      filters: { userId },
      orderBy: [{ column: 'usedAt', ascending: false }],
      limit: 10
    });

    // Get coupon details
    const couponIds = (redeemedCoupons || []).map(c => c.couponId);
    const { data: coupons } = couponIds.length > 0 ? await adminSupabase
      .from('coupons')
      .select('id, code, credits_amount')
      .in('id', couponIds) : { data: null };

    const couponMap = new Map();
    (coupons || []).forEach(c => {
      couponMap.set(c.id, { code: c.code, creditsAmount: c.credits_amount });
    });

    const formattedCoupons = (redeemedCoupons || []).map(use => ({
      id: use.id,
      code: couponMap.get(use.couponId)?.code || '',
      credits_amount: couponMap.get(use.couponId)?.creditsAmount || 0,
      used_at: use.usedAt,
    }));

    return NextResponse.json({
      credits: userCredits || { balance: 0, total_purchased: 0, total_used: 0, total_bonus: 0 },
      redeemedCoupons: formattedCoupons,
    });
  } catch (error) {
    console.error('Error fetching coupons data:', error);
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

    const userId = user.id;
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
    }

    const adminSupabase = getSupabaseClient();

    // Find the coupon
    const { data: coupon, error: couponError } = await adminSupabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (couponError || !coupon) {
      return NextResponse.json({ error: 'Kupon tidak ditemukan' }, { status: 404 });
    }

    if (!coupon.is_active) {
      return NextResponse.json({ error: 'Kupon tidak aktif' }, { status: 400 });
    }

    if (coupon.expires_at && new Date() > coupon.expires_at) {
      return NextResponse.json({ error: 'Kupon sudah kedaluwarsa' }, { status: 400 });
    }

    if (coupon.used_count >= coupon.max_uses) {
      return NextResponse.json({ error: 'Kupon sudah mencapai batas penggunaan' }, { status: 400 });
    }

    // Check if user already used this coupon
    const { data: existingUse } = await adminSupabase
      .from('coupon_uses')
      .select('*')
      .eq('coupon_id', coupon.id)
      .eq('user_id', userId)
      .single();

    if (existingUse) {
      return NextResponse.json({ error: 'Anda sudah menggunakan kupon ini' }, { status: 400 });
    }

    // Get or create user credits
    const { data: userCredits } = await findOne<UserCredit>(adminSupabase, 'user_credits', userId);

    if (!userCredits) {
      // Create new user credits
      await create<UserCredit>(adminSupabase, 'user_credits', {
        userId,
        balance: coupon.credits_amount,
        totalBonus: coupon.credits_amount,
      });
    } else {
      // Update balance
      await update<UserCredit>(adminSupabase, 'user_credits', userId, {
        balance: (userCredits.balance || 0) + coupon.credits_amount,
        totalBonus: (userCredits.totalBonus || 0) + coupon.credits_amount,
      });
    }

    // Record coupon use
    await create<CouponUse>(adminSupabase, 'coupon_uses', {
      couponId: coupon.id,
      userId,
      usedAt: new Date().toISOString(),
    });

    // Update coupon used count
    await adminSupabase
      .from('coupons')
      .update({ used_count: coupon.used_count + 1 })
      .eq('id', coupon.id);

    // Create credit transaction
    await create(adminSupabase, 'credit_transactions', {
      userId,
      type: 'bonus',
      amount: coupon.credits_amount,
      balanceBefore: userCredits?.balance || 0,
      balanceAfter: (userCredits?.balance || 0) + coupon.credits_amount,
      description: `Redeemed coupon: ${coupon.code}`,
      referenceType: 'coupon',
      referenceId: coupon.id,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      creditsAdded: coupon.credits_amount,
      newBalance: (userCredits?.balance || 0) + coupon.credits_amount,
    });
  } catch (error) {
    console.error('Error redeeming coupon:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
