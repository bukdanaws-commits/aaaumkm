import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findOne } from '@/lib/supabase-queries';
import { CreditScore } from '@/types/supabase';

// GET /api/credit-score - Get current user's credit score
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = getSupabaseClient();
    const { data: creditScore } = await findOne<CreditScore>(adminSupabase, 'credit_scores', user.id);

    if (!creditScore) {
      return NextResponse.json({
        exists: false,
        message: 'Credit score not calculated yet',
      });
    }

    return NextResponse.json({
      exists: true,
      creditScore,
    });
  } catch (error) {
    console.error('Error fetching credit score:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
