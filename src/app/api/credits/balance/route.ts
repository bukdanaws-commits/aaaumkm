import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findOne } from '@/lib/supabase-queries';
import { UserCredit } from '@/types/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const adminSupabase = getSupabaseClient();

    // Get credits balance
    const { data: userCredits } = await findOne<UserCredit>(adminSupabase, 'user_credits', userId);

    if (!userCredits) {
      return NextResponse.json({
        success: true,
        credits: {
          balance: 0,
          totalBonus: 0,
          totalPurchased: 0,
          totalUsed: 0,
        },
      });
    }

    return NextResponse.json({
      success: true,
      credits: {
        balance: userCredits.balance || 0,
        totalBonus: userCredits.totalBonus || 0,
        totalPurchased: userCredits.totalPurchased || 0,
        totalUsed: userCredits.totalUsed || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching credits balance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credits balance' },
      { status: 500 }
    );
  }
}
