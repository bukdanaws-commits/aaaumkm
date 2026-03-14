import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';

// Cache 60 detik untuk landing page
export const revalidate = 60;

/**
 * Transform snake_case to camelCase for landing data
 */
function transformListing(listing: any): any {
  if (!listing) return null;
  return {
    id: listing.id,
    title: listing.title,
    slug: listing.slug,
    price: listing.price,
    priceType: listing.price_type,
    condition: listing.condition,
    city: listing.city,
    province: listing.province,
    viewCount: listing.view_count,
    favoriteCount: listing.favorite_count,
    isFeatured: listing.is_featured,
    imageUrl: listing.image_url,
    createdAt: listing.created_at,
    category: listing.category ? {
      name: listing.category.name,
      slug: listing.category.slug,
    } : null,
  };
}

function transformCategory(category: any): any {
  if (!category) return null;
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    iconUrl: category.icon_url,
    imageBannerUrl: category.image_banner_url,
    listingCount: category.listing_count,
  };
}

function transformAuction(auction: any): any {
  if (!auction) return null;
  return {
    id: auction.id,
    listingId: auction.listing_id,
    startingPrice: auction.starting_price,
    currentPrice: auction.current_price,
    buyNowPrice: auction.buy_now_price,
    endsAt: auction.ends_at,
    totalBids: auction.total_bids,
    listing: auction.listing ? {
      id: auction.listing.id,
      title: auction.listing.title,
      slug: auction.listing.slug,
      city: auction.listing.city,
      province: auction.listing.province,
      imageUrl: auction.listing.image_url,
      category: auction.listing.category ? {
        name: auction.listing.category.name,
        slug: auction.listing.category.slug,
      } : null,
    } : null,
    highestBid: auction.highest_bid,
  };
}

/**
 * Log performance metrics for landing page API
 */
function logPerformanceMetrics(
  implementation: 'supabase',
  duration: number,
  queryCount: number,
  resultCount: number
): void {
  const slowQueryThreshold = parseInt(
    process.env.LOG_SLOW_QUERIES_MS || '1000',
    10
  );

  const logMessage = `[LANDING_API] ${implementation.toUpperCase()} - ${duration}ms - ${queryCount} queries - ${resultCount} results`;

  if (duration > slowQueryThreshold) {
    console.warn(`[SLOW_QUERY] ${logMessage}`);
  } else if (process.env.NODE_ENV === 'development') {
    console.log(`[METRICS] ${logMessage}`);
  }
}

export async function GET() {
  const startTime = Date.now();
  const implementation = 'supabase';
  const queryCount = 1; // Using RPC - single query

  try {
    const supabase = getSupabaseClient();

    // Use optimized RPC function - single database call instead of 6 queries
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_landing_data');

    if (rpcError) {
      console.warn('[LANDING_API] RPC failed, falling back to individual queries:', rpcError.message);
      
      // Fallback to individual queries if RPC doesn't exist yet
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name, slug, icon_url, image_banner_url, listing_count')
        .eq('is_active', true)
        .is('parent_id', null)
        .order('sort_order', { ascending: true });

      const { data: featuredListings } = await supabase
        .from('listings')
        .select('id, title, slug, price, price_type, condition, city, province, view_count, favorite_count, is_featured, created_at')
        .eq('status', 'active')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(10);

      const { data: latestListings } = await supabase
        .from('listings')
        .select('id, title, slug, price, price_type, condition, city, province, view_count, favorite_count, is_featured, created_at')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(12);

      const { data: popularListings } = await supabase
        .from('listings')
        .select('id, title, slug, price, price_type, condition, city, province, view_count, favorite_count, is_featured, created_at')
        .eq('status', 'active')
        .order('view_count', { ascending: false })
        .limit(12);

      const { data: activeAuctions } = await supabase
        .from('listing_auctions')
        .select('id, listing_id, starting_price, current_price, buy_now_price, ends_at, total_bids')
        .eq('status', 'active')
        .gt('ends_at', new Date().toISOString())
        .order('ends_at', { ascending: true })
        .limit(6);

      const data = {
        categories: (categories || []).map(transformCategory),
        featuredListings: (featuredListings || []).map(transformListing),
        latestListings: (latestListings || []).map(transformListing),
        popularListings: (popularListings || []).map(transformListing),
        activeAuctions: (activeAuctions || []).map(transformAuction),
        premiumBoostedListings: [],
        highlightedListingIds: [],
      };

      const duration = Date.now() - startTime;
      logPerformanceMetrics(implementation, duration, 5, 0);

      return NextResponse.json(data, {
        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
      });
    }

    // RPC succeeded - use the data and transform it
    const data = {
      categories: (rpcData?.categories || []).map(transformCategory),
      featuredListings: (rpcData?.featured_listings || []).map(transformListing),
      latestListings: (rpcData?.latest_listings || []).map(transformListing),
      popularListings: (rpcData?.popular_listings || []).map(transformListing),
      activeAuctions: (rpcData?.active_auctions || []).map(transformAuction),
      premiumBoostedListings: (rpcData?.premium_boosted_listings || []).map(transformListing),
      highlightedListingIds: rpcData?.highlighted_listing_ids || [],
    };
    
    const duration = Date.now() - startTime;

    // Log performance metrics
    logPerformanceMetrics(implementation, duration, queryCount, 0);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('Error fetching landing data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);

    // Log error metrics
    console.error(`[LANDING_API] ${implementation.toUpperCase()} - ERROR - ${duration}ms - ${errorMessage}`);

    return NextResponse.json(
      {
        error: 'Failed to fetch landing data',
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
