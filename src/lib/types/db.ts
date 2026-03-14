/**
 * TypeScript interfaces for all database data models
 * These interfaces define the structure of data returned from direct SQL queries
 * and must match the Prisma response format exactly for frontend compatibility
 */

/**
 * Category interface representing a product category
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  color?: string | null;
  iconUrl: string | null;
  imageBannerUrl?: string | null; // Optional - only used in landing page
  listingCount: number;
}

/**
 * Listing interface representing a marketplace listing
 */
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
  };
  createdAt: Date;
}

/**
 * Auction interface representing an active auction
 */
export interface Auction {
  id: string;
  listingId: string;
  startingPrice: number;
  currentPrice: number;
  buyNowPrice: number | null;
  endsAt: Date;
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
    };
  };
  highestBid: number;
}

/**
 * LandingPageData interface representing all data needed for the landing page
 */
export interface LandingPageData {
  categories: Category[];
  featuredListings: Listing[];
  premiumBoostedListings: Listing[];
  highlightedListingIds: string[];
  latestListings: Listing[];
  popularListings: Listing[];
  activeAuctions: Auction[];
}

/**
 * ListingResult interface representing paginated listing results
 */
export interface ListingResult {
  listings: Array<{
    id: string;
    title: string;
    price: number;
    city: string | null;
    province: string | null;
    condition: string;
    viewCount: number;
    imageUrl: string | null;
    isFeatured: boolean;
    createdAt: string | Date;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * ListingFilters interface for filtering listings
 */
export interface ListingFilters {
  category?: string;
  search?: string;
  provinceId?: string;
  regencyId?: string;
  priceRange?: PriceRange;
  condition?: string;
  status?: string;
}

/**
 * PriceRange interface for price filtering
 */
export interface PriceRange {
  min: number;
  max: number;
}

/**
 * SortOption interface for sorting listings
 */
export interface SortOption {
  field?: 'newest' | 'price-low' | 'price-high' | 'popular';
  direction?: 'asc' | 'desc';
}

/**
 * Pagination interface for paginating results
 */
export interface Pagination {
  page: number;
  limit: number;
}

/**
 * QueryMetrics interface for tracking query performance
 */
export interface QueryMetrics {
  endpoint: string;
  implementation: 'sql' | 'prisma';
  duration: number; // milliseconds
  queryCount: number;
  resultCount: number;
  timestamp: Date;
  error?: string;
}

/**
 * CategoryResult interface representing category query results
 */
export interface CategoryResult {
  categories: Category[];
}

/**
 * ListingDetail interface representing detailed listing information
 */
export interface ListingDetail extends Listing {
  description?: string;
  seller?: {
    id: string;
    name: string;
    rating: number;
  };
  reviews?: Array<{
    id: string;
    rating: number;
    comment: string;
  }>;
}
