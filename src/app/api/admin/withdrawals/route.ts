import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findMany } from '@/lib/supabase-queries';
import { checkUserRole } from '@/lib/auth/checkRole';
import { Withdrawal } from '@/types/supabase';

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

    const { data: withdrawals } = await findMany<Withdrawal>(adminSupabase, 'withdrawals', {
      orderBy: [{ column: 'createdAt', ascending: false }]
    });

    // Get user profiles
    const userIds = (withdrawals || []).map(w => w.userId);
    const { data: profiles } = userIds.length > 0 ? await adminSupabase
      .from('profiles')
      .select('user_id, name, email')
      .in('user_id', userIds) : { data: null };

    const profileMap = new Map();
    (profiles || []).forEach(p => {
      profileMap.set(p.user_id, { name: p.name, email: p.email });
    });

    const withdrawalsWithProfile = (withdrawals || []).map(w => ({
      ...w,
      profile: profileMap.get(w.userId) || { name: '-', email: '-' },
    }));

    return NextResponse.json({ withdrawals: withdrawalsWithProfile });
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
