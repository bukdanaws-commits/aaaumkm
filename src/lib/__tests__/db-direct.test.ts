/**
 * Direct SQL Query Tests
 * Tests for SQL query functions including response format validation,
 * filter and sort application, and error handling
 */

import { getLandingPageData, getListings, getCategories, getListingDetail } from '../db-direct';
import { initializePool, closePool, query } from '../db-pool';

describe('Direct SQL Queries', () => {
  beforeAll(async () => {
    await initializePool();
  });

  afterAll(async () => {
    await closePool();
  });

  describe('Landing Page Queries', () => {
    it('should fetch landing page data with all required sections', async () => {
      const data = await getLandingPageData();

      // Verify response structure
      expect(data).toHaveProperty('categories');
      expect(data).toHaveProperty('featuredListings');
      expect(data).toHaveProperty('premiumBoostedListings');
      expect(data).toHaveProperty('highlightedListingIds');
      expect(data).toHaveProperty('latestListings');
      expect(data).toHaveProperty('popularListings');
      expect(data).toHaveProperty('activeAuctions');

      // Verify categories structure
      if (data.categories.length > 0) {
        const category = data.categories[0];
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('slug');
        expect(category).toHaveProperty('iconUrl');
        expect(category).toHaveProperty('imageBannerUrl');
        expect(category).toHaveProperty('listingCount');
      }
    });

    it('should return listings with correct structure', async () => {
      const data = await getLandingPageData();

      // Check featured listings structure
      if (data.featuredListings.length > 0) {
        const listing = data.featuredListings[0];
        expect(listing).toHaveProperty('id');
        expect(listing).toHaveProperty('title');
        expect(listing).toHaveProperty('slug');
        expect(listing).toHaveProperty('price');
        expect(listing).toHaveProperty('priceType');
        expect(listing).toHaveProperty('condition');
        expect(listing).toHaveProperty('city');
        expect(listing).toHaveProperty('province');
        expect(listing).toHaveProperty('viewCount');
        expect(listing).toHaveProperty('favoriteCount');
        expect(listing).toHaveProperty('isFeatured');
        expect(listing).toHaveProperty('imageUrl');
        expect(listing).toHaveProperty('category');
        expect(listing).toHaveProperty('createdAt');
        expect(listing.category).toHaveProperty('name');
        expect(listing.category).toHaveProperty('slug');
      }
    });

    it('should return auctions with correct structure', async () => {
      const data = await getLandingPageData();

      // Check auctions structure
      if (data.activeAuctions.length > 0) {
        const auction = data.activeAuctions[0];
        expect(auction).toHaveProperty('id');
        expect(auction).toHaveProperty('listingId');
        expect(auction).toHaveProperty('startingPrice');
        expect(auction).toHaveProperty('currentPrice');
        expect(auction).toHaveProperty('buyNowPrice');
        expect(auction).toHaveProperty('endsAt');
        expect(auction).toHaveProperty('totalBids');
        expect(auction).toHaveProperty('listing');
        expect(auction).toHaveProperty('highestBid');
        expect(auction.listing).toHaveProperty('id');
        expect(auction.listing).toHaveProperty('title');
        expect(auction.listing).toHaveProperty('slug');
        expect(auction.listing).toHaveProperty('city');
        expect(auction.listing).toHaveProperty('province');
        expect(auction.listing).toHaveProperty('imageUrl');
        expect(auction.listing).toHaveProperty('category');
      }
    });

    it('should return highlighted listing IDs as array', async () => {
      const data = await getLandingPageData();

      expect(Array.isArray(data.highlightedListingIds)).toBe(true);
      // All highlighted IDs should be strings
      data.highlightedListingIds.forEach(id => {
        expect(typeof id).toBe('string');
      });
    });

    it('should return arrays for all listing sections', async () => {
      const data = await getLandingPageData();

      expect(Array.isArray(data.categories)).toBe(true);
      expect(Array.isArray(data.featuredListings)).toBe(true);
      expect(Array.isArray(data.premiumBoostedListings)).toBe(true);
      expect(Array.isArray(data.latestListings)).toBe(true);
      expect(Array.isArray(data.popularListings)).toBe(true);
      expect(Array.isArray(data.activeAuctions)).toBe(true);
    });

    it('should return dates as Date objects', async () => {
      const data = await getLandingPageData();

      if (data.featuredListings.length > 0) {
        expect(data.featuredListings[0].createdAt).toBeInstanceOf(Date);
      }

      if (data.activeAuctions.length > 0) {
        expect(data.activeAuctions[0].endsAt).toBeInstanceOf(Date);
      }
    });

    it('should respect limit constraints', async () => {
      const data = await getLandingPageData();

      expect(data.featuredListings.length).toBeLessThanOrEqual(10);
      expect(data.premiumBoostedListings.length).toBeLessThanOrEqual(6);
      expect(data.latestListings.length).toBeLessThanOrEqual(12);
      expect(data.popularListings.length).toBeLessThanOrEqual(12);
      expect(data.activeAuctions.length).toBeLessThanOrEqual(6);
    });
  });

  describe('Listing Queries', () => {
    it('should fetch listings with images and categories in single query', async () => {
      const { getListings } = await import('../db-direct');
      
      const result = await getListings(
        { status: 'active' },
        { field: 'newest' },
        { page: 1, limit: 24 }
      );

      expect(result).toHaveProperty('listings');
      expect(result).toHaveProperty('pagination');
      expect(Array.isArray(result.listings)).toBe(true);
    });

    it('should return response matching Prisma format', async () => {
      const { getListings } = await import('../db-direct');
      
      const result = await getListings(
        { status: 'active' },
        { field: 'newest' },
        { page: 1, limit: 24 }
      );

      // Verify pagination structure
      expect(result.pagination).toHaveProperty('page');
      expect(result.pagination).toHaveProperty('limit');
      expect(result.pagination).toHaveProperty('total');
      expect(result.pagination).toHaveProperty('totalPages');

      // Verify listing structure
      if (result.listings.length > 0) {
        const listing = result.listings[0];
        expect(listing).toHaveProperty('id');
        expect(listing).toHaveProperty('title');
        expect(listing).toHaveProperty('price');
        expect(listing).toHaveProperty('city');
        expect(listing).toHaveProperty('province');
        expect(listing).toHaveProperty('condition');
        expect(listing).toHaveProperty('viewCount');
        expect(listing).toHaveProperty('imageUrl');
        expect(listing).toHaveProperty('isFeatured');
        expect(listing).toHaveProperty('createdAt');
      }
    });

    it('should apply category filter correctly', async () => {
      const { getListings } = await import('../db-direct');
      
      // First get a category ID from the database
      const allListings = await getListings(
        { status: 'active' },
        { field: 'newest' },
        { page: 1, limit: 1 }
      );

      if (allListings.listings.length === 0) {
        // Skip test if no listings exist
        return;
      }

      // Get the first listing's category (we need to query it separately)
      // For now, just test that the filter parameter is accepted
      const result = await getListings(
        { status: 'active', category: 'test-category-id' },
        { field: 'newest' },
        { page: 1, limit: 24 }
      );

      expect(result).toHaveProperty('listings');
      expect(Array.isArray(result.listings)).toBe(true);
    });

    it('should apply search filter correctly', async () => {
      const { getListings } = await import('../db-direct');
      
      const result = await getListings(
        { status: 'active', search: 'test' },
        { field: 'newest' },
        { page: 1, limit: 24 }
      );

      expect(result).toHaveProperty('listings');
      expect(Array.isArray(result.listings)).toBe(true);
    });

    it('should apply price range filter correctly', async () => {
      const { getListings } = await import('../db-direct');
      
      const result = await getListings(
        { 
          status: 'active',
          priceRange: { min: 1000000, max: 10000000 }
        },
        { field: 'newest' },
        { page: 1, limit: 24 }
      );

      expect(result).toHaveProperty('listings');
      
      // Verify all listings are within price range
      result.listings.forEach(listing => {
        expect(listing.price).toBeGreaterThanOrEqual(1000000);
        expect(listing.price).toBeLessThanOrEqual(10000000);
      });
    });

    it('should apply sort by price-low correctly', async () => {
      const { getListings } = await import('../db-direct');
      
      const result = await getListings(
        { status: 'active' },
        { field: 'price-low' },
        { page: 1, limit: 24 }
      );

      // Verify listings are sorted by price ascending
      for (let i = 1; i < result.listings.length; i++) {
        expect(result.listings[i].price).toBeGreaterThanOrEqual(
          result.listings[i - 1].price
        );
      }
    });

    it('should apply sort by price-high correctly', async () => {
      const { getListings } = await import('../db-direct');
      
      const result = await getListings(
        { status: 'active' },
        { field: 'price-high' },
        { page: 1, limit: 24 }
      );

      // Verify listings are sorted by price descending
      for (let i = 1; i < result.listings.length; i++) {
        expect(result.listings[i].price).toBeLessThanOrEqual(
          result.listings[i - 1].price
        );
      }
    });

    it('should apply sort by popular correctly', async () => {
      const { getListings } = await import('../db-direct');
      
      const result = await getListings(
        { status: 'active' },
        { field: 'popular' },
        { page: 1, limit: 24 }
      );

      // Verify listings are sorted by viewCount descending
      for (let i = 1; i < result.listings.length; i++) {
        expect(result.listings[i].viewCount).toBeLessThanOrEqual(
          result.listings[i - 1].viewCount
        );
      }
    });

    it('should handle pagination correctly', async () => {
      const { getListings } = await import('../db-direct');
      
      const page1 = await getListings(
        { status: 'active' },
        { field: 'newest' },
        { page: 1, limit: 5 }
      );

      const page2 = await getListings(
        { status: 'active' },
        { field: 'newest' },
        { page: 2, limit: 5 }
      );

      // Verify pagination metadata
      expect(page1.pagination.page).toBe(1);
      expect(page2.pagination.page).toBe(2);
      expect(page1.pagination.limit).toBe(5);
      expect(page2.pagination.limit).toBe(5);

      // Verify different results on different pages (if enough data exists)
      if (page1.listings.length > 0 && page2.listings.length > 0) {
        expect(page1.listings[0].id).not.toBe(page2.listings[0].id);
      }
    });

    it('should calculate totalPages correctly', async () => {
      const { getListings } = await import('../db-direct');
      
      const result = await getListings(
        { status: 'active' },
        { field: 'newest' },
        { page: 1, limit: 10 }
      );

      const expectedTotalPages = Math.ceil(result.pagination.total / result.pagination.limit);
      expect(result.pagination.totalPages).toBe(expectedTotalPages);
    });
  });

  describe('Categories Queries', () => {
    it('should fetch categories with listing counts in single query', async () => {
      const result = await getCategories();
      
      expect(result).toHaveProperty('categories');
      expect(Array.isArray(result.categories)).toBe(true);
    });

    it('should return response matching Prisma format', async () => {
      const result = await getCategories();
      
      if (result.categories.length > 0) {
        const category = result.categories[0];
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('slug');
        expect(category).toHaveProperty('listingCount');
        expect(typeof category.listingCount).toBe('number');
      }
    });

    it('should apply sort correctly', async () => {
      // Test default sort (name ASC)
      const defaultResult = await getCategories();
      expect(defaultResult).toHaveProperty('categories');
      
      // Test sort by popular (listing count DESC)
      const popularResult = await getCategories({ field: 'popular' });
      expect(popularResult).toHaveProperty('categories');
      
      // Test sort by newest
      const newestResult = await getCategories({ field: 'newest' });
      expect(newestResult).toHaveProperty('categories');
    });
  });

  describe('Listing Detail Queries', () => {
    it('should fetch listing detail with all related data', async () => {
      // First get a listing ID from the database
      const listings = await getListings(
        { status: 'active' },
        { field: 'newest' },
        { page: 1, limit: 1 }
      );

      if (listings.listings.length === 0) {
        // Skip test if no listings exist
        console.log('Skipping test: No active listings found');
        return;
      }

      const listingId = listings.listings[0].id;
      const result = await getListingDetail(listingId);

      // Verify response structure
      expect(result).toHaveProperty('listing');
      expect(result).toHaveProperty('similarListings');

      // Verify listing structure
      const listing = result.listing;
      expect(listing).toHaveProperty('id');
      expect(listing).toHaveProperty('title');
      expect(listing).toHaveProperty('price');
      expect(listing).toHaveProperty('profile');
      expect(listing).toHaveProperty('category');
      expect(listing).toHaveProperty('images');
      expect(listing).toHaveProperty('boosts');
      expect(listing).toHaveProperty('savedCount');
      expect(listing).toHaveProperty('isSaved');

      // Verify profile structure
      if (listing.profile) {
        expect(listing.profile).toHaveProperty('userId');
        expect(listing.profile).toHaveProperty('name');
      }

      // Verify category structure
      if (listing.category) {
        expect(listing.category).toHaveProperty('id');
        expect(listing.category).toHaveProperty('name');
        expect(listing.category).toHaveProperty('slug');
      }

      // Verify images is an array
      expect(Array.isArray(listing.images)).toBe(true);

      // Verify boosts is an array
      expect(Array.isArray(listing.boosts)).toBe(true);

      // Verify similar listings is an array
      expect(Array.isArray(result.similarListings)).toBe(true);
    });

    it('should increment view count atomically', async () => {
      // Get a listing ID
      const listings = await getListings(
        { status: 'active' },
        { field: 'newest' },
        { page: 1, limit: 1 }
      );

      if (listings.listings.length === 0) {
        console.log('Skipping test: No active listings found');
        return;
      }

      const listingId = listings.listings[0].id;

      // Get initial view count
      const initialResult = await query<any>(
        'SELECT "viewCount" FROM listings WHERE id = $1',
        [listingId]
      );
      const initialViewCount = initialResult.rows[0].viewCount;

      // Fetch listing detail (should increment view count)
      await getListingDetail(listingId);

      // Get updated view count
      const updatedResult = await query<any>(
        'SELECT "viewCount" FROM listings WHERE id = $1',
        [listingId]
      );
      const updatedViewCount = updatedResult.rows[0].viewCount;

      // Verify view count was incremented
      expect(updatedViewCount).toBe(initialViewCount + 1);
    });

    it('should return response matching Prisma format', async () => {
      // Get a listing ID
      const listings = await getListings(
        { status: 'active' },
        { field: 'newest' },
        { page: 1, limit: 1 }
      );

      if (listings.listings.length === 0) {
        console.log('Skipping test: No active listings found');
        return;
      }

      const listingId = listings.listings[0].id;
      const result = await getListingDetail(listingId);

      // Verify all required fields exist
      expect(result.listing).toHaveProperty('id');
      expect(result.listing).toHaveProperty('userId');
      expect(result.listing).toHaveProperty('categoryId');
      expect(result.listing).toHaveProperty('title');
      expect(result.listing).toHaveProperty('slug');
      expect(result.listing).toHaveProperty('price');
      expect(result.listing).toHaveProperty('priceType');
      expect(result.listing).toHaveProperty('condition');
      expect(result.listing).toHaveProperty('status');
      expect(result.listing).toHaveProperty('viewCount');
      expect(result.listing).toHaveProperty('favoriteCount');
      expect(result.listing).toHaveProperty('isFeatured');
      expect(result.listing).toHaveProperty('createdAt');
      expect(result.listing).toHaveProperty('updatedAt');

      // Verify dates are Date objects
      expect(result.listing.createdAt).toBeInstanceOf(Date);
      expect(result.listing.updatedAt).toBeInstanceOf(Date);

      // Verify savedCount is a number
      expect(typeof result.listing.savedCount).toBe('number');

      // Verify isSaved is a boolean
      expect(typeof result.listing.isSaved).toBe('boolean');
    });

    it('should fetch similar listings based on category', async () => {
      // Get a listing ID
      const listings = await getListings(
        { status: 'active' },
        { field: 'newest' },
        { page: 1, limit: 1 }
      );

      if (listings.listings.length === 0) {
        console.log('Skipping test: No active listings found');
        return;
      }

      const listingId = listings.listings[0].id;
      const result = await getListingDetail(listingId);

      // Verify similar listings structure
      expect(Array.isArray(result.similarListings)).toBe(true);
      expect(result.similarListings.length).toBeLessThanOrEqual(8);

      // Verify similar listings don't include the current listing
      result.similarListings.forEach(similarListing => {
        expect(similarListing.id).not.toBe(listingId);
      });

      // Verify similar listings have correct structure
      if (result.similarListings.length > 0) {
        const similarListing = result.similarListings[0];
        expect(similarListing).toHaveProperty('id');
        expect(similarListing).toHaveProperty('title');
        expect(similarListing).toHaveProperty('slug');
        expect(similarListing).toHaveProperty('price');
        expect(similarListing).toHaveProperty('category');
        expect(similarListing).toHaveProperty('imageUrl');
      }
    });

    it('should handle auction data when present', async () => {
      // Find a listing with an auction
      const auctionListingsResult = await query<any>(
        `SELECT l.id FROM listings l
         INNER JOIN listing_auctions la ON l.id = la."listingId"
         WHERE l.status = 'active' AND la.status = 'active'
         LIMIT 1`
      );

      if (auctionListingsResult.rows.length === 0) {
        console.log('Skipping test: No active auction listings found');
        return;
      }

      const listingId = auctionListingsResult.rows[0].id;
      const result = await getListingDetail(listingId);

      // Verify auction data exists
      expect(result.listing.auction).toBeTruthy();
      
      if (result.listing.auction) {
        expect(result.listing.auction).toHaveProperty('id');
        expect(result.listing.auction).toHaveProperty('listingId');
        expect(result.listing.auction).toHaveProperty('startingPrice');
        expect(result.listing.auction).toHaveProperty('currentPrice');
        expect(result.listing.auction).toHaveProperty('endsAt');
        expect(result.listing.auction).toHaveProperty('totalBids');
        expect(result.listing.auction).toHaveProperty('bids');
        expect(Array.isArray(result.listing.auction.bids)).toBe(true);
        expect(result.listing.auction.bids.length).toBeLessThanOrEqual(10);
      }
    });

    it('should handle boosts data when present', async () => {
      // Find a listing with active boosts
      const boostedListingsResult = await query<any>(
        `SELECT l.id FROM listings l
         INNER JOIN listing_boosts lb ON l.id = lb."listingId"
         WHERE l.status = 'active' AND lb.status = 'active' AND lb."endsAt" > NOW()
         LIMIT 1`
      );

      if (boostedListingsResult.rows.length === 0) {
        console.log('Skipping test: No boosted listings found');
        return;
      }

      const listingId = boostedListingsResult.rows[0].id;
      const result = await getListingDetail(listingId);

      // Verify boosts data exists
      expect(Array.isArray(result.listing.boosts)).toBe(true);
      expect(result.listing.boosts.length).toBeGreaterThan(0);

      if (result.listing.boosts.length > 0) {
        const boost = result.listing.boosts[0];
        expect(boost).toHaveProperty('id');
        expect(boost).toHaveProperty('listingId');
        expect(boost).toHaveProperty('boostType');
        expect(boost).toHaveProperty('status');
        expect(boost).toHaveProperty('endsAt');
      }
    });

    it('should throw error for non-existent listing', async () => {
      const nonExistentId = 'non-existent-id-12345';
      
      await expect(getListingDetail(nonExistentId)).rejects.toThrow('Listing not found');
    });
  });
});
