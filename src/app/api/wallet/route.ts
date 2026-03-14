import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findOne, findMany } from '@/lib/supabase-queries';
import { Wallet, UserCredit, Transaction } from '@/types/supabase';

export async function GET(request: NextRequest) {
  try {
    // Try Supabase auth first
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    let userId: string | null = null;

    if (user && !authError) {
      // Supabase user
      userId = user.id;
    } else {
      // Fallback to mock auth from cookie/header
      const mockUserCookie = request.cookies.get('dev_user');
      
      if (mockUserCookie) {
        try {
          const mockUser = JSON.parse(mockUserCookie.value);
          userId = mockUser.id;
        } catch (e) {
          // Invalid cookie
        }
      }
      
      // If still no userId, return unauthorized
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const supabaseClient = getSupabaseClient();

    // Get wallet data
    const { data: wallet, error: walletError } = await findOne<Wallet>(supabaseClient, 'wallets', userId);

    // Get credits balance
    const { data: userCredits, error: creditsError } = await findOne<UserCredit>(supabaseClient, 'user_credits', userId);

    // Get transactions - need to get wallet ID first
    let transactions: Transaction[] = [];
    if (wallet) {
      const { data: txData, error: txError } = await findMany<Transaction>(supabaseClient, 'transactions', {
        filters: { walletId: wallet.id },
        orderBy: [{ column: 'createdAt', ascending: false }],
        limit: 50,
        select: 'id, type, amount, description, referenceType, createdAt',
      });
      
      if (!txError && txData) {
        transactions = txData;
      }
    }

    const formattedTransactions = transactions.map(tx => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      description: tx.description,
      reference_type: tx.referenceType,
      created_at: tx.createdAt,
    }));

    return NextResponse.json({
      wallet: wallet ? {
        id: wallet.id,
        balance: wallet.balance,
        status: wallet.status,
      } : null,
      credits: userCredits ? { balance: userCredits.balance } : { balance: 0 },
      transactions: formattedTransactions,
    });
  } catch (error) {
    console.error('Error fetching wallet data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}