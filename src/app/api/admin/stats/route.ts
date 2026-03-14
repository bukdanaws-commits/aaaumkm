import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findMany, findOne, count } from '@/lib/supabase-queries';
import { UserRole, Profile, Listing, Order, ListingReport, KycVerification, Withdrawal } from '@/types/supabase';

// Helper function to check if user is admin
async function checkAdminRole(supabase: any, userId: string): Promise<boolean> {
  const { data, error } = await findMany<UserRole>(supabase, 'user_roles', {
    filters: { userId, role: 'admin' },
  });
  return (data && data.length > 0) || false;
}

export async function GET(request: NextRequest) {
  try {
    // Check for demo/mock authentication (development mode)
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;
    let supabase: any;

    if (authHeader?.startsWith('Bearer ')) {
      // Demo mode: extract userId from Bearer token
      userId = authHeader.substring(7);
      supabase = getSupabaseClient();
    } else {
      // Try Supabase authentication
      const supabaseAuth = await createClient();
      const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
      
      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = user.id;
      supabase = supabaseAuth;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = await checkAdminRole(supabase, userId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Get total users
    const { count: totalUsers } = await count(supabase, 'profiles');

    // Get total listings
    const { count: totalListings } = await count(supabase, 'listings');
    const { count: activeListings } = await count(supabase, 'listings', { status: 'active' });
    const { count: pendingListings } = await count(supabase, 'listings', { status: 'pending_review' });

    // Get total orders
    const { count: totalOrders } = await count(supabase, 'orders');

    // Get total revenue from completed orders
    const { data: completedOrders } = await findMany<Order>(supabase, 'orders', {
      filters: { status: 'completed' },
      select: 'totalAmount',
    });
    const totalRevenue = (completedOrders || []).reduce((sum, order) => sum + order.totalAmount, 0);

    // Get pending reports
    const { count: pendingReports } = await count(supabase, 'listing_reports', { status: 'pending' });

    // Get pending KYC verifications
    const { count: pendingKyc } = await count(supabase, 'kyc_verifications', { status: 'pending' });

    // Get pending withdrawals
    const { count: pendingWithdrawals } = await count(supabase, 'withdrawals', { status: 'pending' });

    // Get pending listings for review
    const { data: pendingListingsData } = await findMany<Listing>(supabase, 'listings', {
      filters: { status: 'pending_review' },
      orderBy: [{ column: 'createdAt', ascending: false }],
      limit: 5,
      select: 'id, title, price, status, createdAt, userId',
    });

    // Get seller names for pending listings
    const sellerIds = (pendingListingsData || []).map(l => l.userId);
    const { data: sellers } = await findMany<Profile>(supabase, 'profiles', {
      filters: { userId: sellerIds },
      select: 'userId, name',
    });
    const sellerMap = (sellers || []).reduce((acc, s) => {
      acc[s.userId] = s;
      return acc;
    }, {} as Record<string, Profile>);

    // Get recent reports
    const { data: recentReports } = await findMany<ListingReport>(supabase, 'listing_reports', {
      filters: { status: 'pending' },
      orderBy: [{ column: 'createdAt', ascending: false }],
      limit: 5,
      select: 'id, reason, status, listingId',
    });

    // Get listing titles for reports
    const reportListingIds = (recentReports || []).map(r => r.listingId);
    const { data: reportListings } = await findMany<Listing>(supabase, 'listings', {
      filters: { id: reportListingIds },
      select: 'id, title',
    });
    const listingMap = (reportListings || []).reduce((acc, l) => {
      acc[l.id] = l;
      return acc;
    }, {} as Record<string, Listing>);

    // Get new users today
    const today = new Date().toISOString();
    const { count: newUsersToday } = await count(supabase, 'profiles', {
      createdAt: today, // Note: This is a simplified check
    });

    // Get new listings today
    const { count: newListingsToday } = await count(supabase, 'listings', {
      createdAt: today,
    });

    // Get new orders today
    const { count: newOrdersToday } = await count(supabase, 'orders', {
      createdAt: today,
    });

    const stats = {
      totalUsers: totalUsers || 0,
      totalListings: totalListings || 0,
      activeListings: activeListings || 0,
      pendingListings: pendingListings || 0,
      totalOrders: totalOrders || 0,
      totalRevenue,
      pendingReports: pendingReports || 0,
      pendingKyc: pendingKyc || 0,
      pendingWithdrawals: pendingWithdrawals || 0,
      newUsersToday: newUsersToday || 0,
      newListingsToday: newListingsToday || 0,
      newOrdersToday: newOrdersToday || 0,
    };

    const formattedPendingListings = (pendingListingsData || []).map(listing => ({
      id: listing.id,
      title: listing.title,
      price: listing.price,
      status: listing.status,
      created_at: listing.createdAt,
      seller_name: sellerMap[listing.userId]?.name || 'Unknown',
    }));

    const formattedRecentReports = (recentReports || []).map(report => ({
      id: report.id,
      listing: { title: listingMap[report.listingId]?.title || 'Unknown' },
      reason: report.reason,
      status: report.status,
    }));

    return NextResponse.json({
      stats,
      pendingListings: formattedPendingListings,
      recentReports: formattedRecentReports,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}