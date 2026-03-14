import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findOne, findOneBy, create, update } from '@/lib/supabase-queries';
import { Profile, UserCredit, CreditTransaction } from '@/types/supabase';

const REGISTRATION_BONUS = 500;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, name } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const adminSupabase = getSupabaseClient();

    // Check if user already received registration bonus
    const { data: existingBonus } = await adminSupabase
      .from('credit_transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('type', 'bonus')
      .eq('description', 'Bonus registrasi user baru')
      .limit(1);

    if (existingBonus && existingBonus.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'User already received registration bonus',
        credits: null,
      });
    }

    // Ensure profile exists first
    const { data: profile } = await findOne<Profile>(adminSupabase, 'profiles', userId);

    if (!profile) {
      // Create profile if doesn't exist
      await create<Profile>(adminSupabase, 'profiles', {
        userId,
        email: email || `${userId}@example.com`,
        name: name || 'User',
        createdAt: new Date().toISOString(),
      });
    }

    // Get or create user credits
    const { data: userCredits } = await findOne<UserCredit>(adminSupabase, 'user_credits', userId);

    if (!userCredits) {
      // Create new user credits with bonus
      await create<UserCredit>(adminSupabase, 'user_credits', {
        userId,
        balance: REGISTRATION_BONUS,
        totalBonus: REGISTRATION_BONUS,
        createdAt: new Date().toISOString(),
      });

      // Create transaction record
      await create<CreditTransaction>(adminSupabase, 'credit_transactions', {
        userId,
        type: 'bonus',
        amount: REGISTRATION_BONUS,
        balanceBefore: 0,
        balanceAfter: REGISTRATION_BONUS,
        description: 'Bonus registrasi user baru',
        referenceType: 'registration',
        referenceId: userId,
        createdAt: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        message: `Selamat! Anda mendapatkan bonus ${REGISTRATION_BONUS} kredit`,
        credits: {
          balance: REGISTRATION_BONUS,
          bonus: REGISTRATION_BONUS,
        },
      });
    } else {
      // User credits already exist, add bonus
      const newBalance = (userCredits.balance || 0) + REGISTRATION_BONUS;
      const newTotalBonus = (userCredits.totalBonus || 0) + REGISTRATION_BONUS;

      await update<UserCredit>(adminSupabase, 'user_credits', userId, {
        balance: newBalance,
        totalBonus: newTotalBonus,
      });

      // Create transaction record
      await create<CreditTransaction>(adminSupabase, 'credit_transactions', {
        userId,
        type: 'bonus',
        amount: REGISTRATION_BONUS,
        balanceBefore: userCredits.balance || 0,
        balanceAfter: newBalance,
        description: 'Bonus registrasi user baru',
        referenceType: 'registration',
        referenceId: userId,
        createdAt: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        message: `Selamat! Anda mendapatkan bonus ${REGISTRATION_BONUS} kredit`,
        credits: {
          balance: newBalance,
          bonus: REGISTRATION_BONUS,
        },
      });
    }
  } catch (error) {
    console.error('Error giving registration bonus:', error);
    return NextResponse.json(
      { error: 'Failed to give registration bonus' },
      { status: 500 }
    );
  }
}
