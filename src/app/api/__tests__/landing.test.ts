/**
 * Landing Page API Route Tests
 * Tests for feature flag routing, response format, and performance logging
 * Validates Requirements: 2.6, 8.1, 8.2, 10.1, 10.2, 10.3, 10.4
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '../landing/route';
import * as featureFlags from '@/lib/feature-flags';
import * as dbDirect from '@/lib/db-direct';
import * as dbPool from '@/lib/db-pool';

// Mock dependencies
vi.mock('@/lib/feature-flags');
vi.mock('@/lib/db-direct');
vi.mock('@/lib/db-pool');
vi.mock('@/lib/db', () => ({
  db: {
    category: {
      findMany: vi.fn(),
    },
    listing: {
      findMany: vi.fn(),
    },
    listingAuction: {
      findMany: vi.fn(),
    },
  },
}));

describe('Landing Page API Route', () => {
  const mockLandingData = {
    categories: [
      {
        id: '1',
        name: 'Electronics',
        slug: 'electronics',
        iconUrl: 'https://example.com/icon.png',
        imageBannerUrl: 'https://example.com/banner.png',
        listingCount: 100,
      },
    ],
    featuredListings: [
      {
        id: 'listing-1',
        title: 'Test Listing',
        slug: 'test-listing',
        price: 100000,
        priceType: 'fixed',
        condition: 'new',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        viewCount: 50,
        favoriteCount: 10,
        isFeatured: true,
        imageUrl: 'https://example.com/image.png',
        category: { name: 'Electronics', slug: 'electronics' },
        createdAt: new Date('2024-01-01'),
      },
    ],
    premiumBoostedListings: [],
    highlightedListingIds: [],
    latestListings: [],
    popularListings: [],
    activeAuctions: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Feature Flag Routing', () => {
    it('should use direct SQL when feature flag is enabled', async () => {
      (featureFlags.useDirectSql as any).mockReturnValue(true);
      (dbPool.initializePool as any).mockResolvedValue(undefined);
      (dbDirect.getLandingPageData as any).mockResolvedValue(mockLandingData);

      const response = await GET();
      const data = await response.json();

      expect(featureFlags.useDirectSql).toHaveBeenCalledWith('landing');
      expect(dbPool.initializePool).toHaveBeenCalled();
      expect(dbDirect.getLandingPageData).toHaveBeenCalled();
      expect(data).toEqual(mockLandingData);
    });

    it('should use Prisma when feature flag is disabled', async () => {
      (featureFlags.useDirectSql as any).mockReturnValue(false);

      const { db } = await import('@/lib/db');
      (db.category.findMany as any).mockResolvedValue(mockLandingData.categories as any);
      (db.listing.findMany as any).mockResolvedValue(mockLandingData.featuredListings as any);
      (db.listingAuction.findMany as any).mockResolvedValue([]);

      const response = await GET();
      const data = await response.json();

      expect(featureFlags.useDirectSql).toHaveBeenCalledWith('landing');
      expect(dbDirect.getLandingPageData).not.toHaveBeenCalled();
      expect(data.categories).toBeDefined();
    });
  });

  describe('Response Format', () => {
    it('should return response with correct structure', async () => {
      (featureFlags.useDirectSql as any).mockReturnValue(true);
      (dbPool.initializePool as any).mockResolvedValue(undefined);
      (dbDirect.getLandingPageData as any).mockResolvedValue(mockLandingData);

      const response = await GET();
      const data = await response.json();

      // Verify response structure
      expect(data).toHaveProperty('categories');
      expect(data).toHaveProperty('featuredListings');
      expect(data).toHaveProperty('premiumBoostedListings');
      expect(data).toHaveProperty('highlightedListingIds');
      expect(data).toHaveProperty('latestListings');
      expect(data).toHaveProperty('popularListings');
      expect(data).toHaveProperty('activeAuctions');
    });

    it('should include cache headers in response', async () => {
      (featureFlags.useDirectSql as any).mockReturnValue(true);
      (dbPool.initializePool as any).mockResolvedValue(undefined);
      (dbDirect.getLandingPageData as any).mockResolvedValue(mockLandingData);

      const response = await GET();

      expect(response.headers.get('Cache-Control')).toBe(
        'public, s-maxage=60, stale-while-revalidate=120'
      );
    });
  });

  describe('Error Handling', () => {
    it('should return 500 error when direct SQL fails', async () => {
      (featureFlags.useDirectSql as any).mockReturnValue(true);
      (dbPool.initializePool as any).mockResolvedValue(undefined);
      (dbDirect.getLandingPageData as any).mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('Failed to fetch landing data');
    });

    it('should include timestamp in error response', async () => {
      (featureFlags.useDirectSql as any).mockReturnValue(true);
      (dbPool.initializePool as any).mockResolvedValue(undefined);
      (dbDirect.getLandingPageData as any).mockRejectedValue(
        new Error('Test error')
      );

      const response = await GET();
      const data = await response.json();

      expect(data).toHaveProperty('timestamp');
      expect(new Date(data.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('Integration', () => {
    it('should initialize pool when using direct SQL', async () => {
      (featureFlags.useDirectSql as any).mockReturnValue(true);
      (dbPool.initializePool as any).mockResolvedValue(undefined);
      (dbDirect.getLandingPageData as any).mockResolvedValue(mockLandingData);

      await GET();

      expect(dbPool.initializePool).toHaveBeenCalled();
    });

    it('should not initialize pool when using Prisma', async () => {
      (featureFlags.useDirectSql as any).mockReturnValue(false);

      const { db } = await import('@/lib/db');
      (db.category.findMany as any).mockResolvedValue(mockLandingData.categories as any);
      (db.listing.findMany as any).mockResolvedValue(mockLandingData.featuredListings as any);
      (db.listingAuction.findMany as any).mockResolvedValue([]);

      await GET();

      expect(dbPool.initializePool).not.toHaveBeenCalled();
    });
  });
});
