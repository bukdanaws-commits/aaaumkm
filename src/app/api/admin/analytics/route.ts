import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { count, findMany } from '@/lib/supabase-queries';
import { checkUserRole } from '@/lib/auth/checkRole';
import { Listing, Order, Profile } from '@/types/supabase';

// GET /api/admin/analytics - Get analytics data
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check admin role
    const isAdmin = await checkUserRole(user.id, 'admin');
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const adminSupabase = getSupabaseClient();

    // Get stats
    const [
      totalUsers,
      totalListings,
      activeListings,
      totalOrders,
      completedOrders,
    ] = await Promise.all([
      // Total users
      count(adminSupabase, 'profiles'),
      
      // Total listings
      count(adminSupabase, 'listings'),
      
      // Active listings
      count(adminSupabase, 'listings', { status: 'active' }),
      
      // Total orders
      count(adminSupabase, 'orders'),
      
      // Completed orders
      count(adminSupabase, 'orders', { status: 'completed' }),
    ]);

    // Get total revenue and views (approximate)
    const { data: orders } = await findMany<Order>(adminSupabase, 'orders', {
      filters: { status: 'completed' },
      select: 'totalAmount'
    });

    const { data: listings } = await findMany<Listing>(adminSupabase, 'listings', {
      select: 'viewCount'
    });

    const totalRevenue = (orders || []).reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalViews = (listings || []).reduce((sum, l) => sum + (l.viewCount || 0), 0);

    // Calculate conversion rate
    const conversionRate = totalViews 
      ? ((completedOrders.count || 0) / totalViews * 100).toFixed(2)
      : '0.00';

    // Get daily data for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString();

    const { data: recentListings } = await findMany<Listing>(adminSupabase, 'listings', {
      filters: { createdAt: sevenDaysAgoStr },
      select: 'createdAt'
    });

    const { data: recentOrders } = await findMany<Order>(adminSupabase, 'orders', {
      filters: { createdAt: sevenDaysAgoStr },
      select: 'createdAt'
    });

    // Group by date
    const dailyViews: Record<string, number> = {};
    (recentListings || []).forEach(listing => {
      const date = listing.createdAt?.split('T')[0];
      if (date) dailyViews[date] = (dailyViews[date] || 0) + 1;
    });

    const dailyOrders: Record<string, number> = {};
    (recentOrders || []).forEach(order => {
      const date = order.createdAt?.split('T')[0];
      if (date) dailyOrders[date] = (dailyOrders[date] || 0) + 1;
    });

    // Format daily data
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split('T')[0],
        label: days[date.getDay()],
      };
    });

    const dailyViewsData = last7Days.map(day => ({
      label: day.label,
      value: dailyViews[day.date] || 0,
    }));

    const dailyOrdersData = last7Days.map(day => ({
      label: day.label,
      value: dailyOrders[day.date] || 0,
    }));

    return NextResponse.json({
      stats: {
        totalUsers: totalUsers.count || 0,
        totalListings: totalListings.count || 0,
        activeListings: activeListings.count || 0,
        totalOrders: totalOrders.count || 0,
        completedOrders: completedOrders.count || 0,
        totalRevenue,
        totalViews,
        conversionRate: parseFloat(conversionRate),
      },
      charts: {
        dailyViews: dailyViewsData,
        dailyOrders: dailyOrdersData,
      },
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
