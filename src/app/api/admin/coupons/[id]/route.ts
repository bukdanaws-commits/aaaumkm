import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findOne, remove } from '@/lib/supabase-queries';
import { checkUserRole } from '@/lib/auth/checkRole';
import { logActivity } from '@/lib/activityLog';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const { data: coupon, error: couponError } = await findOne(adminSupabase, 'coupons', id);

    if (couponError || !coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    await remove(adminSupabase, 'coupons', id);

    await logActivity({
      userId: user.id,
      userEmail: user.email || '',
      action: 'delete_coupon',
      description: `Menghapus kupon ${coupon.code}`,
      metadata: { couponId: id, code: coupon.code },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
