import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findOne, update } from '@/lib/supabase-queries';
import { checkUserRole } from '@/lib/auth/checkRole';
import { logActivity } from '@/lib/activityLog';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    const { action, notes } = body;

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const adminSupabase = getSupabaseClient();
    const { data: withdrawal, error: withdrawalError } = await findOne(adminSupabase, 'withdrawals', id);

    if (withdrawalError || !withdrawal) {
      return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
    }

    // Get user profile for email
    const { data: profile } = await findOne(adminSupabase, 'profiles', withdrawal.user_id);

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    
    const { data: updated, error: updateError } = await update(adminSupabase, 'withdrawals', id, {
      status: newStatus,
      processed_by: user.id,
      processed_at: new Date().toISOString(),
      ...(notes && { notes }),
    });

    if (updateError) throw updateError;

    // Log activity
    await logActivity({
      userId: user.id,
      userEmail: profile?.email || '',
      action: action === 'approve' ? 'WITHDRAWAL_APPROVED' : 'WITHDRAWAL_REJECTED',
      description: `Withdrawal ${action === 'approve' ? 'approved' : 'rejected'} for ${profile?.email || 'unknown'} - Amount: ${withdrawal.amount}`,
      metadata: {
        withdrawalId: id,
        amount: withdrawal.amount,
        bankName: withdrawal.bank_name,
      },
    });

    return NextResponse.json({ withdrawal: updated });
  } catch (error) {
    console.error('Error updating withdrawal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
