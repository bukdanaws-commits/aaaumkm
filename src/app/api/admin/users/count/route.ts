import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { count, findMany } from '@/lib/supabase-queries';
import { Profile, UserRole, UserCredit, CreditTransaction } from '@/types/supabase';

export async function GET() {
  try {
    const adminSupabase = getSupabaseClient();

    // Count total profiles
    const totalProfiles = (await count(adminSupabase, 'profiles')).count || 0;

    // Count by role
    const { data: roles } = await adminSupabase
      .from('user_roles')
      .select('role', { count: 'exact' });

    const roleCountMap: Record<string, number> = {};
    (roles || []).forEach(r => {
      roleCountMap[r.role] = (roleCountMap[r.role] || 0) + 1;
    });

    const roleDistribution = Object.entries(roleCountMap).map(([role, count]) => ({
      role,
      count,
    }));

    // Count user credits
    const totalCredits = (await count(adminSupabase, 'user_credits')).count || 0;

    // Get total credits balance (approximate - would need RPC for exact sum)
    const { data: creditsData } = await adminSupabase
      .from('user_credits')
      .select('balance, total_bonus');

    const creditsSum = (creditsData || []).reduce((acc, c) => ({
      balance: (acc.balance || 0) + (c.balance || 0),
      totalBonus: (acc.totalBonus || 0) + (c.total_bonus || 0),
    }), { balance: 0, totalBonus: 0 });

    // Count bonus transactions
    const bonusTransactions = (await count(adminSupabase, 'credit_transactions', {
      type: 'bonus',
      description: 'Bonus registrasi user baru'
    })).count || 0;

    // Get sample users
    const { data: sampleUsers } = await findMany<Profile>(adminSupabase, 'profiles', {
      orderBy: [{ column: 'createdAt', ascending: false }],
      limit: 10,
      select: 'userId, email, name, createdAt'
    });

    return NextResponse.json({
      success: true,
      data: {
        totalProfiles,
        roleDistribution,
        credits: {
          usersWithCredits: totalCredits,
          totalBalance: creditsSum.balance,
          totalBonus: creditsSum.totalBonus,
        },
        bonusStats: {
          usersReceivedBonus: bonusTransactions,
        },
        sampleUsers: (sampleUsers || []).map(u => ({
          userId: u.userId,
          email: u.email,
          name: u.name,
          createdAt: u.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('Error counting users:', error);
    return NextResponse.json(
      { error: 'Failed to count users' },
      { status: 500 }
    );
  }
}
