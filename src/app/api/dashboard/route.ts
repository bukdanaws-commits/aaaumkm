import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findOne, findMany, count } from '@/lib/supabase-queries';
import { Wallet, UserCredit, Listing, Order, Transaction, Conversation } from '@/types/supabase';

// Cache 30 detik untuk dashboard
export const revalidate = 30;

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    const adminSupabase = getSupabaseClient();

    // PARALLEL QUERIES - Jalankan semua query sekaligus
    const [
      walletResult,
      userCreditsResult,
      totalListingsResult,
      activeListingsResult,
      totalOrdersResult,
      pendingOrdersResult,
      conversationsResult,
      transactionsResult,
      ordersResult,
      userListingsResult
    ] = await Promise.all([
      findOne<Wallet>(adminSupabase, 'wallets', userId),
      findOne<UserCredit>(adminSupabase, 'user_credits', userId),
      count(adminSupabase, 'listings', { userId }),
      count(adminSupabase, 'listings', { userId, status: 'active' }),
      count(adminSupabase, 'orders', { sellerId: userId }),
      count(adminSupabase, 'orders', { sellerId: userId, status: 'pending' }),
      findMany<Conversation>(adminSupabase, 'conversations', {
        filters: { or: [{ buyerId: userId }, { sellerId: userId }] },
        select: 'id'
      }),
      findMany<Transaction>(adminSupabase, 'transactions', {
        filters: { userId },
        orderBy: [{ column: 'createdAt', ascending: false }],
        limit: 5,
        select: 'id, type, amount, description, createdAt'
      }),
      findMany<Order>(adminSupabase, 'orders', {
        filters: { sellerId: userId },
        orderBy: [{ column: 'createdAt', ascending: false }],
        limit: 5,
        select: 'id, status, totalAmount, createdAt, listingId'
      }),
      findMany<Listing>(adminSupabase, 'listings', {
        filters: { userId },
        orderBy: [{ column: 'createdAt', ascending: false }],
        limit: 6,
        select: 'id, title, price, status, viewCount'
      })
    ]);

    // Get unread messages count
    const conversations = conversationsResult.data || [];
    const conversationIds = conversations.map(c => c.id);
    let unreadMessages = 0;
    if (conversationIds.length > 0) {
      const unreadResult = await count(adminSupabase, 'messages', {
        conversationId: conversationIds,
        senderId: userId,
        isRead: false
      });
      unreadMessages = unreadResult.count || 0;
    }

    // Get listing info for orders
    const orders = ordersResult.data || [];
    const listingIds = orders.filter(o => o.listingId).map(o => o.listingId as string);
    const { data: listings } = listingIds.length > 0 ? await findMany<Listing>(adminSupabase, 'listings', {
      filters: { id: listingIds },
      select: 'id, title'
    }) : { data: [] };

    const listingMap = new Map((listings || []).map(l => [l.id, l.title]));

    const ordersWithListing = orders.map(order => ({
      id: order.id,
      listing: order.listingId ? { title: listingMap.get(order.listingId) || 'Produk' } : null,
      amount: order.totalAmount,
      status: order.status,
      created_at: order.createdAt,
    }));

    // Get images for listings (parallel dengan query lain)
    const userListings = userListingsResult.data || [];
    const listingIdsForImages = userListings.map(l => l.id);
    const { data: images } = listingIdsForImages.length > 0 ? await adminSupabase
      .from('listing_images')
      .select('listingId, imageUrl, isPrimary')
      .in('listingId', listingIdsForImages) : { data: null };

    const imageMap = new Map();
    (images || []).forEach(img => {
      if (!imageMap.has(img.listingId)) {
        imageMap.set(img.listingId, []);
      }
      imageMap.get(img.listingId).push({
        image_url: img.imageUrl,
        is_primary: img.isPrimary
      });
    });

    const formattedListings = userListings.map(listing => ({
      id: listing.id,
      title: listing.title,
      price: listing.price,
      status: listing.status,
      view_count: listing.viewCount,
      listing_images: imageMap.get(listing.id) || [],
    }));

    const stats = {
      walletBalance: walletResult.data?.balance || 0,
      creditsBalance: userCreditsResult.data?.balance || 0,
      activeListings: activeListingsResult.count || 0,
      totalListings: totalListingsResult.count || 0,
      totalOrders: totalOrdersResult.count || 0,
      pendingOrders: pendingOrdersResult.count || 0,
      unreadMessages,
    };

    const formattedTransactions = (transactionsResult.data || []).map(tx => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      description: tx.description,
      created_at: tx.createdAt,
    }));

    return NextResponse.json({
      stats,
      transactions: formattedTransactions,
      orders: ordersWithListing,
      listings: formattedListings,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
