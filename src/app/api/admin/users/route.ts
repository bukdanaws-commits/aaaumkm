import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseClient, getSupabaseAdmin } from '@/lib/supabase-client';
import { findMany, findOne, update, create, count } from '@/lib/supabase-queries';
import { Profile, UserRole, Wallet, UserCredit, KycVerification, AdminLog } from '@/types/supabase';

// Helper function to check if user is admin
async function checkAdminRole(supabase: any, userId: string): Promise<boolean> {
  const { data: userRole, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('userId', userId)
    .eq('role', 'admin')
    .single();
  
  return !error && !!userRole;
}

export async function GET(request: NextRequest) {
  try {
    // Check for demo/mock authentication (development mode)
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      // Demo mode: extract userId from Bearer token
      userId = authHeader.substring(7);
    } else {
      // Try Supabase authentication
      const supabase = await createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = user.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseClient = getSupabaseClient();

    // Check if user is admin
    const isAdmin = await checkAdminRole(supabaseClient, userId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build filters
    const filters: Record<string, any> = {};
    
    if (search) {
      filters.or = [
        { name: { ilike: `%${search}%` } },
        { email: { ilike: `%${search}%` } },
      ];
    }

    // Get users with pagination
    const { data: profiles, error: profilesError } = await findMany<Profile>(supabaseClient, 'profiles', {
      filters,
      orderBy: [{ column: 'createdAt', ascending: false }],
      limit,
      offset,
      select: 'id, userId, email, name, avatarUrl, isKycVerified, createdAt',
    });

    if (profilesError) throw profilesError;

    // Get user roles for all users
    const userIds = (profiles || []).map(p => p.userId);
    const { data: userRoles, error: rolesError } = await findMany<UserRole>(supabaseClient, 'user_roles', {
      filters: { userId: userIds },
      select: 'userId, role',
    });

    if (rolesError) throw rolesError;

    // Get KYC status for all users
    const { data: kycRecords, error: kycError } = await findMany<KycVerification>(supabaseClient, 'kyc_verifications', {
      filters: { userId: userIds },
      select: 'userId, status',
    });

    if (kycError) throw kycError;

    // Get wallet status for all users
    const { data: wallets, error: walletError } = await findMany<Wallet>(supabaseClient, 'wallets', {
      filters: { userId: userIds },
      select: 'userId, status, balance',
    });

    if (walletError) throw walletError;

    // Get credits for all users
    const { data: credits, error: creditsError } = await findMany<UserCredit>(supabaseClient, 'user_credits', {
      filters: { userId: userIds },
      select: 'userId, balance',
    });

    if (creditsError) throw creditsError;

    // Get listing counts for all users
    const { data: listingCounts, error: countError } = await supabaseClient
      .from('listings')
      .select('userId, count')
      .in('userId', userIds)
      .group('userId');

    if (countError) throw countError;

    // Get total count for pagination
    const { count: total, error: totalError } = await count(supabaseClient, 'profiles', filters);
    if (totalError) throw totalError;

    // Create lookup maps
    const rolesMap = new Map<string, string>();
    (userRoles || []).forEach(r => rolesMap.set(r.userId, r.role));

    const kycMap = new Map<string, string>();
    (kycRecords || []).forEach(k => kycMap.set(k.userId, k.status));

    const walletMap = new Map<string, { status: string; balance: number }>();
    (wallets || []).forEach(w => walletMap.set(w.userId, { status: w.status, balance: w.balance }));

    const creditsMap = new Map<string, number>();
    (credits || []).forEach(c => creditsMap.set(c.userId, c.balance));

    const listingsMap = new Map<string, number>();
    (listingCounts || []).forEach(l => listingsMap.set(l.userId, l.count as number));

    // Format users data
    const formattedUsers = (profiles || []).map(profile => {
      const userRole = rolesMap.get(profile.userId) || 'user';
      const wallet = walletMap.get(profile.userId);
      const walletStatus = wallet?.status || 'active';
      
      // Determine user status based on wallet status
      let userStatus = 'active';
      if (walletStatus === 'frozen') {
        userStatus = 'suspended';
      } else if (walletStatus === 'closed') {
        userStatus = 'inactive';
      }

      return {
        id: profile.userId,
        email: profile.email,
        name: profile.name || 'Unknown',
        avatar_url: profile.avatarUrl,
        role: userRole,
        status: userStatus,
        kyc_status: kycMap.get(profile.userId) || 'not_submitted',
        is_kyc_verified: profile.isKycVerified,
        total_listings: listingsMap.get(profile.userId) || 0,
        total_orders_as_buyer: 0,
        total_orders_as_seller: 0,
        wallet_balance: wallet?.balance || 0,
        credit_balance: creditsMap.get(profile.userId) || 0,
        created_at: profile.createdAt,
      };
    });

    // Filter by role if specified
    let filteredUsers = formattedUsers;
    if (role) {
      filteredUsers = filteredUsers.filter(u => u.role === role);
    }
    if (status) {
      filteredUsers = filteredUsers.filter(u => u.status === status);
    }

    return NextResponse.json({
      users: filteredUsers,
      pagination: {
        page,
        limit,
        total: total || 0,
        totalPages: Math.ceil((total || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check for demo/mock authentication (development mode)
    const authHeader = request.headers.get('authorization');
    let currentUserId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      // Demo mode: extract userId from Bearer token
      currentUserId = authHeader.substring(7);
    } else {
      // Try Supabase authentication
      const supabase = await createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      currentUserId = user.id;
    }

    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseClient = getSupabaseClient();
    const supabaseAdmin = getSupabaseAdmin();

    // Check if user is admin
    const isAdmin = await checkAdminRole(supabaseClient, currentUserId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, action, data } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the target user's profile
    const { data: profile, error: profileError } = await findOne<Profile>(supabaseClient, 'profiles', userId);

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's existing role
    const { data: existingRoles, error: rolesError } = await supabaseClient
      .from('user_roles')
      .select('id, role')
      .eq('userId', userId);

    if (rolesError) throw rolesError;

    // Get user's wallet
    const { data: wallet, error: walletError } = await findOne<Wallet>(supabaseClient, 'wallets', userId);

    switch (action) {
      case 'update_role': {
        const { role } = data;
        if (!['user', 'admin', 'bandar'].includes(role)) {
          return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        // Update or create user role
        if (existingRoles && existingRoles.length > 0) {
          await supabaseAdmin
            .from('user_roles')
            .update({ role })
            .eq('id', existingRoles[0].id);
        } else {
          await create<UserRole>(supabaseAdmin, 'user_roles', {
            userId: profile.userId,
            role,
            assignedBy: currentUserId,
          });
        }

        // Log admin action
        await create<AdminLog>(supabaseAdmin, 'admin_logs', {
          adminId: currentUserId,
          action: 'update_user_role',
          targetType: 'user',
          targetId: userId,
          details: JSON.stringify({ newRole: role }),
        });

        return NextResponse.json({ success: true, message: 'Role updated successfully' });
      }

      case 'toggle_status': {
        const { status } = data;
        
        // Update wallet status to control user account status
        if (wallet) {
          const walletStatus = status === 'active' ? 'active' : status === 'suspended' ? 'frozen' : 'closed';
          await update<Wallet>(supabaseAdmin, 'wallets', userId, { status: walletStatus });
        }

        // Log admin action
        await create<AdminLog>(supabaseAdmin, 'admin_logs', {
          adminId: currentUserId,
          action: 'toggle_user_status',
          targetType: 'user',
          targetId: userId,
          details: JSON.stringify({ newStatus: status }),
        });

        return NextResponse.json({ success: true, message: 'Status updated successfully' });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}