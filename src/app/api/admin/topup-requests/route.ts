import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findMany } from '@/lib/supabase-queries';
import { checkUserRole } from '@/lib/auth/checkRole';
import { CreditTopupRequest } from '@/types/supabase';

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

    const { data: topupRequests } = await findMany<CreditTopupRequest>(adminSupabase, 'credit_topup_requests', {
      orderBy: [{ column: 'createdAt', ascending: false }]
    });

    return NextResponse.json({ topupRequests: topupRequests || [] });
  } catch (error) {
    console.error('Error fetching topup requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
