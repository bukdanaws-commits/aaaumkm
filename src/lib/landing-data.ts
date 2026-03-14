/**
 * Server-side landing data fetching
 * Use this for Server Components to avoid client-side fetch delay
 */

import { getSupabaseClient } from '@/lib/supabase-client';

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconUrl: string | null;
  imageBannerUrl: string | null;
  listingCount: number;
}

export interface Listing {
  id: string;
  title: string;
  slug: string;
  price: number;
  priceType: string;
  condition: string;
  city: string | null;
  province: string | null;
  viewCount: number;
  favoriteCount: number;
  isFeatured: boolean;
  imageUrl: string | null;
  category: {
    name: string;
    slug: string;
  } | null;
  createdAt: string;
}

export interface Auction {
  id: string;
  listingId: string;
  startingPrice: number;
  currentPrice: number;
  buyNowPrice: number | null;
  endsAt: string;
  totalBids: number;
  listing: {
    id: string;
    title: string;
    slug: string;
    city: string | null;
    province: string | null;
    imageUrl: string | null;
    category: {
      name: string;
      slug: string;
    } | null;
  } | null;
  highestBid: number;
}

interface LandingData {
  categories: Category[];
  featuredListings: Listing[];
  premiumBoostedListings: Listing[];
  highlightedListingIds: string[];
  latestListings: Listing[];
  popularListings: Listing[];
  activeAuctions: Auction[];
}

function transformListing(listing: any): Listing | null {
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

function transformCategory(category: any): Category | null {
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

function transformAuction(auction: any): Auction | null {
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

export async function getLandingData(): Promise<LandingData> {
  const supabase = getSupabaseClient();

  // Try RPC first (most efficient)
  const { data: rpcData, error: rpcError } = await supabase
    .rpc('get_landing_data');

  if (!rpcError && rpcData) {
    return {
      categories: (rpcData?.categories || []).map(transformCategory).filter(Boolean) as Category[],
      featuredListings: (rpcData?.featured_listings || []).map(transformListing).filter(Boolean) as Listing[],
      latestListings: (rpcData?.latest_listings || []).map(transformListing).filter(Boolean) as Listing[],
      popularListings: (rpcData?.popular_listings || []).map(transformListing).filter(Boolean) as Listing[],
      activeAuctions: (rpcData?.active_auctions || []).map(transformAuction).filter(Boolean) as Auction[],
      premiumBoostedListings: (rpcData?.premium_boosted_listings || []).map(transformListing).filter(Boolean) as Listing[],
      highlightedListingIds: rpcData?.highlighted_listing_ids || [],
    };
  }

  // Fallback to individual queries
  const [
    { data: categories },
    { data: featuredListings },
    { data: latestListings },
    { data: popularListings },
    { data: activeAuctions },
  ] = await Promise.all([
    supabase
      .from('categories')
      .select('id, name, slug, icon_url, image_banner_url, listing_count')
      .eq('is_active', true)
      .is('parent_id', null)
      .order('sort_order', { ascending: true })
      .limit(12),
    supabase
      .from('listings')
      .select('id, title, slug, price, price_type, condition, city, province, view_count, favorite_count, is_featured, created_at, image_url')
      .eq('status', 'active')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('listings')
      .select('id, title, slug, price, price_type, condition, city, province, view_count, favorite_count, is_featured, created_at, image_url')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(12),
    supabase
      .from('listings')
      .select('id, title, slug, price, price_type, condition, city, province, view_count, favorite_count, is_featured, created_at, image_url')
      .eq('status', 'active')
      .order('view_count', { ascending: false })
      .limit(12),
    supabase
      .from('listing_auctions')
      .select('id, listing_id, starting_price, current_price, buy_now_price, ends_at, total_bids')
      .eq('status', 'active')
      .gt('ends_at', new Date().toISOString())
      .order('ends_at', { ascending: true })
      .limit(6),
  ]);

  return {
    categories: (categories || []).map(transformCategory).filter(Boolean) as Category[],
    featuredListings: (featuredListings || []).map(transformListing).filter(Boolean) as Listing[],
    latestListings: (latestListings || []).map(transformListing).filter(Boolean) as Listing[],
    popularListings: (popularListings || []).map(transformListing).filter(Boolean) as Listing[],
    activeAuctions: (activeAuctions || []).map(transformAuction).filter(Boolean) as Auction[],
    premiumBoostedListings: [],
    highlightedListingIds: [],
  };
}