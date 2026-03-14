import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findOne, create, update } from '@/lib/supabase-queries';
import { checkUserRole } from '@/lib/auth/checkRole';
import { logActivity } from '@/lib/activityLog';
import { Profile, UserCredit, CreditTransaction } from '@/types/supabase';

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
    const { userId, amount, note } = body;

    if (!userId || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const adminSupabase = getSupabaseClient();

    // Get target user profile
    const { data: targetProfile } = await findOne<Profile>(adminSupabase, 'profiles', userId);

    if (!targetProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get or create user credit record
    const { data: userCredit } = await findOne<UserCredit>(adminSupabase, 'user_credits', userId);

    const balanceBefore = userCredit?.balance || 0;
    const balanceAfter = balanceBefore + amount;

    if (userCredit) {
      await update<UserCredit>(adminSupabase, 'user_credits', userId, {
        balance: balanceAfter,
        totalBonus: (userCredit.totalBonus || 0) + amount,
      });
    } else {
      await create<UserCredit>(adminSupabase, 'user_credits', {
        userId,
        balance: amount,
        totalBonus: amount,
        totalPurchased: 0,
        totalUsed: 0,
        createdAt: new Date().toISOString(),
      });
    }

    // Create credit transaction record
    await create<CreditTransaction>(adminSupabase, 'credit_transactions', {
      userId,
      type: 'bonus',
      amount,
      balanceBefore,
      balanceAfter,
      description: note || 'Admin credit adjustment',
      referenceType: 'admin_adjustment',
      referenceId: user.id,
      createdAt: new Date().toISOString(),
    });

    // Log activity
    await logActivity({
      userId: user.id,
      userEmail: user.email || '',
      action: 'add_user_credit',
      description: `Menambahkan ${amount} kredit ke ${targetProfile.name || targetProfile.email}`,
      metadata: {
        targetUserId: userId,
        targetUserEmail: targetProfile.email,
        amount,
        note,
        balanceBefore,
        balanceAfter,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Credit added successfully',
      data: {
        amount,
        balanceBefore,
        balanceAfter,
      },
    });
  } catch (error) {
    console.error('Error adding credit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
