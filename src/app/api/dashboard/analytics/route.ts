import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findMany, count } from '@/lib/supabase-queries';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';
import { Listing, Order } from '@/types/supabase';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    const adminSupabase = getSupabaseClient();
    const days = 7;
    const dailyStats: Array<{ date: string; views: number; orders: number; revenue: number }> = [];

    // Get user's listings
    const { data: userListings } = await findMany<Listing>(adminSupabase, 'listings', {
      filters: { userId },
      select: 'id'
    });

    const listingIds = (userListings || []).map(l => l.id);

    // Calculate stats for each day
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date).toISOString();
      const dayEnd = endOfDay(date).toISOString();

      // Get views for this day
      const { data: listings } = await findMany<Listing>(adminSupabase, 'listings', {
        filters: { 
          userId,
          createdAt: dayEnd
        },
        select: 'viewCount'
      });

      const totalViews = (listings || []).reduce((sum, l) => sum + (l.viewCount || 0), 0);
      const avgDailyViews = listingIds.length > 0 ? Math.floor(totalViews / Math.max(days, 1)) : 0;

      // Get orders for this day
      const { data: dayOrders } = await findMany<Order>(adminSupabase, 'orders', {
        filters: { 
          sellerId: userId,
          createdAt: { gte: dayStart, lte: dayEnd },
          status: ['paid', 'shipped', 'completed']
        },
        select: 'totalAmount'
      });

      const ordersCount = (dayOrders || []).length;
      const revenue = (dayOrders || []).reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      dailyStats.push({
        date: format(date, 'dd MMM'),
        views: avgDailyViews,
        orders: ordersCount,
        revenue: revenue,
      });
    }

    // Calculate totals
    const totals = {
      views: dailyStats.reduce((sum, s) => sum + s.views, 0),
      orders: dailyStats.reduce((sum, s) => sum + s.orders, 0),
      revenue: dailyStats.reduce((sum, s) => sum + s.revenue, 0),
    };

    return NextResponse.json({
      dailyStats,
      totals,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
