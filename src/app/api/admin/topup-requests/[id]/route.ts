import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findOne, update, create } from '@/lib/supabase-queries';
import { checkUserRole } from '@/lib/auth/checkRole';
import { logActivity } from '@/lib/activityLog';
import { CreditTopupRequest, UserCredit, Profile } from '@/types/supabase';

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

    const { data: topupRequest, error: topupError } = await findOne<CreditTopupRequest>(adminSupabase, 'credit_topup_requests', id);

    if (topupError || !topupRequest) {
      return NextResponse.json({ error: 'Topup request not found' }, { status: 404 });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    
    await update<CreditTopupRequest>(adminSupabase, 'credit_topup_requests', id, {
      status: newStatus,
      reviewedBy: user.id,
      reviewedAt: new Date().toISOString(),
      ...(notes && { notes }),
    });

    // If approved, add credits to user
    if (action === 'approve') {
      const totalCredits = (topupRequest.creditsAmount || 0) + (topupRequest.bonusCredits || 0);

      // Get or create user credit record
      const { data: existingCredit } = await findOne<UserCredit>(adminSupabase, 'user_credits', topupRequest.userId);

      if (existingCredit) {
        await update<UserCredit>(adminSupabase, 'user_credits', topupRequest.userId, {
          balance: (existingCredit.balance || 0) + totalCredits,
          totalPurchased: (existingCredit.totalPurchased || 0) + (topupRequest.creditsAmount || 0),
          totalBonus: (existingCredit.totalBonus || 0) + (topupRequest.bonusCredits || 0),
        });
      } else {
        await create<UserCredit>(adminSupabase, 'user_credits', {
          userId: topupRequest.userId,
          balance: totalCredits,
          totalPurchased: topupRequest.creditsAmount || 0,
          totalBonus: topupRequest.bonusCredits || 0,
          createdAt: new Date().toISOString(),
        });
      }

      // Create credit transaction
      await create(adminSupabase, 'credit_transactions', {
        userId: topupRequest.userId,
        type: 'purchase',
        amount: totalCredits,
        balanceBefore: existingCredit?.balance || 0,
        balanceAfter: (existingCredit?.balance || 0) + totalCredits,
        description: `Topup kredit - ${topupRequest.creditsAmount} kredit + ${topupRequest.bonusCredits} bonus`,
        referenceType: 'topup_request',
        referenceId: id,
        createdAt: new Date().toISOString(),
      });
    }

    // Log activity
    const { data: profile } = await findOne<Profile>(adminSupabase, 'profiles', topupRequest.userId);

    await logActivity({
      userId: user.id,
      userEmail: profile?.email || 'unknown',
      action: action === 'approve' ? 'TOPUP_APPROVED' : 'TOPUP_REJECTED',
      description: `Topup request ${action === 'approve' ? 'approved' : 'rejected'} - Amount: ${topupRequest.amount}`,
      metadata: {
        topupRequestId: id,
        amount: topupRequest.amount,
        creditsAmount: topupRequest.creditsAmount,
      },
    });

    return NextResponse.json({ 
      topupRequest: { 
        ...topupRequest, 
        status: newStatus 
      } 
    });
  } catch (error) {
    console.error('Error updating topup request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
