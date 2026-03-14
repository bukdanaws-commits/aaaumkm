import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findMany } from '@/lib/supabase-queries';
import { checkUserRole } from '@/lib/auth/checkRole';

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

    const { data: transactions } = await findMany(adminSupabase, 'credit_transactions', {
      select: 'id, user_id, type, amount, description, created_at, profiles(name, email)',
      orderBy: [{ column: 'created_at', ascending: false }],
      limit: 100,
    });

    // Get approved topup requests for revenue calculation
    const { data: approvedTopups } = await findMany(adminSupabase, 'credit_topup_requests', {
      select: 'amount, credits_amount',
      filters: { status: 'approved' },
    });

    // Calculate total revenue from approved topups
    const totalRevenue = (approvedTopups || []).reduce((sum: number, topup: any) => sum + (topup.amount || 0), 0);

    return NextResponse.json({ 
      transactions: transactions || [],
      totalRevenue,
    });
  } catch (error) {
    console.error('Error fetching credit transactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
