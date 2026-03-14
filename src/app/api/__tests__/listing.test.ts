/**
 * Listing Page API Route Tests
 * Tests for feature flag routing, response format, sort/filter parameters, and performance logging
 * Validates Requirements: 3.5, 8.1, 8.2, 10.1, 10.2, 10.3, 10.4
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '../listing/route';
import * as featureFlags from '@/lib/feature-flags';
import * as dbDirect from '@/lib/db-direct';
import * as dbPool from '@/lib/db-pool';

// Mock dependencies
vi.mock('@/lib/feature-flags');
vi.mock('@/lib/db-direct');
vi.mock('@/lib/db-pool');
vi.mock('@/lib/db', () => ({
  db: {
    listing: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe('Listing Page API Route', () => {
  const mockListingResult = {
    listings: [
      {
        id: 'listing-1',
        title: 'Test Listing',
        price: 100000,
        city: 'Jakarta',
        province: 'DKI Jakarta',
        condition: 'new',
        viewCount: 50,
        imageUrl: 'https://example.com/image.png',
        isFeatured: true,
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    ],
    pagination: {
      page: 1,
      limit: 24,
      total: 1,
      totalPages: 1,
    },
  };

  const mockPrismaListings = [
    {
      id: 'listing-1',
      title: 'Test Listing',
      slug: 'test-listing',
      price: 100000,
      condition: 'new',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      viewCount: 50,
      favoriteCount: 10,
      createdAt: new Date('2024-01-01'),
      isFeatured: true,
      images: [{ imageUrl: 'https://example.com/image.png' }],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Feature Flag Routing', () => {
    it('should use direct SQL when feature flag is enabled', async () => {
      (featureFlags.useDirectSql as any).mockReturnValue(true);
      (dbPool.initializePool as any).mockResolvedValue(undefined);
      (dbDirect.getListings as any).mockResolvedValue(mockListingResult);

      const request = new Request('http://localhost/api/listing?page=1&limit=24');
      const response = await GET(request as any);
      const data = await response.json();

      expect(featureFlags.useDirectSql).toHaveBeenCalledWith('listing');
      expect(dbPool.initializePool).toHaveBeenCalled();
      expect(dbDirect.getListings).toHaveBeenCalled();
      expect(data).toEqual(mockListingResult);
    });

    it('should use Prisma when feature flag is disabled', async () => {
      (featureFlags.useDirectSql as any).mockReturnValue(false);

      const { db } = await import('@/lib/db');
      (db.listing.findMany as any).mockResolvedValue(mockPrismaListings);
      (db.listing.count as any).mockResolvedValue(1);

      const request = new Request('http://localhost/api/listing?page=1&limit=24');
      const response = await GET(request as any);
      const data = await response.json();

      expect(featureFlags.useDirectSql).toHaveBeenCalledWith('listing');
      expect(dbDirect.getListings).not.toHaveBeenCalled();
      expect(data.listings).toBeDefined();
      expect(data.pagination).toBeDefined();
    });
  });

  describe('Response Format', () => {
    it('should return response with correct structure', async () => {
      (featureFlags.useDirectSql as any).mockReturnValue(true);
      (dbPool.initializePool as any).mockResolvedValue(undefined);
      (dbDirect.getListings as any).mockResolvedValue(mockListingResult);

      const request = new Request('http://localhost/api/listing?page=1&limit=24');
      const response = await GET(request as any);
      const data = await response.json();

      // Verify response structure
      expect(data).toHaveProperty('listings');
      expect(data).toHaveProperty('pagination');
      expect(data.pagination).toHaveProperty('page');
      expect(data.pagination).toHaveProperty('limit');
      expect(data.pagination).toHaveProperty('total');
      expect(data.pagination).toHaveProperty('totalPages');
    });

    it('should format listings correctly', async () => {
      (featureFlags.useDirectSql as any).mockReturnValue(true);
      (dbPool.initializePool as any).mockResolvedValue(undefined);
      (dbDirect.getListings as any).mockResolvedValue(mockListingResult);

      const request = new Request('http://localhost/api/listing?page=1&limit=24');
      const response = await GET(request as any);
      const data = await response.json();

      const listing = data.listings[0];
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
    });
  });

  describe('Sort and Filter Parameters', () => {
    it('should pass category filter to direct SQL', async () => {
      (featureFlags.useDirectSql as any).mockReturnValue(true);
      (dbPool.initializePool as any).mockResolvedValue(undefined);
      (dbDirect.getListings as any).mockResolvedValue(mockListingResult);

      const request = new Request('http://localhost/api/listing?category=electronics&page=1&limit=24');
      await GET(request as any);

      expect(dbDirect.getListings).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'electronics', status: 'active' }),
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should pass search filter to direct SQL', async () => {
      (featureFlags.useDirectSql as any).mockReturnValue(true);
      (dbPool.initializePool as any).mockResolvedValue(undefined);
      (dbDirect.getListings as any).mockResolvedValue(mockListingResult);

      const request = new Request('http://localhost/api/listing?search=laptop&page=1&limit=24');
      await GET(request as any);

      expect(dbDirect.getListings).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'laptop', status: 'active' }),
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should pass price range filter to direct SQL', async () => {
      (featureFlags.useDirectSql as any).mockReturnValue(true);
      (dbPool.initializePool as any).mockResolvedValue(undefined);
      (dbDirect.getListings as any).mockResolvedValue(mockListingResult);

      const request = new Request('http://localhost/api/listing?priceRange=1m-10m&page=1&limit=24');
      await GET(request as any);

      expect(dbDirect.getListings).toHaveBeenCalledWith(
        expect.objectContaining({
          priceRange: { min: 1000000, max: 10000000 },
          status: 'active',
        }),
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should pass location filters to direct SQL', async () => {
      (featureFlags.useDirectSql as any).mockReturnValue(true);
      (dbPool.initializePool as any).mockResolvedValue(undefined);
      (dbDirect.getListings as any).mockResolvedValue(mockListingResult);

      const request = new Request('http://localhost/api/listing?provinceId=31&regencyId=3171&page=1&limit=24');
      await GET(request as any);

      expect(dbDirect.getListings).toHaveBeenCalledWith(
        expect.objectContaining({
          provinceId: '31',
          regencyId: '3171',
          status: 'active',
        }),
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should pass condition filter to direct SQL', async () => {
      (featureFlags.useDirectSql as any).mockReturnValue(true);
      (dbPool.initializePool as any).mockResolvedValue(undefined);
      (dbDirect.getListings as any).mockResolvedValue(mockListingResult);

      const request = new Request('http://localhost/api/listing?condition=new&page=1&limit=24');
      await GET(request as any);

      expect(dbDirect.getListings).toHaveBeenCalledWith(
        expect.objectContaining({ condition: 'new', status: 'active' }),
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should pass sort option to direct SQL', async () => {
      (featureFlags.useDirectSql as any).mockReturnValue(true);
      (dbPool.initializePool as any).mockResolvedValue(undefined);
      (dbDirect.getListings as any).mockResolvedValue(mockListingResult);

      const request = new Request('http://localhost/api/listing?sort=price-low&page=1&limit=24');
      await GET(request as any);

      expect(dbDirect.getListings).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ field: 'price-low' }),
        expect.any(Object)
      );
    });

    it('should pass pagination parameters to direct SQL', async () => {
      (featureFlags.useDirectSql as any).mockReturnValue(true);
      (dbPool.initializePool as any).mockResolvedValue(undefined);
      (dbDirect.getListings as any).mockResolvedValue(mockListingResult);

      const request = new Request('http://localhost/api/listing?page=2&limit=12');
      await GET(request as any);

      expect(dbDirect.getListings).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        expect.objectContaining({ page: 2, limit: 12 })
      );
    });
  });

  describe('Price Range Parsing', () => {
    it('should parse under-1m price range correctly', async () => {
      (featureFlags.useDirectSql as any).mockReturnValue(true);
      (dbPool.initializePool as any).mockResolvedValue(undefined);
      (dbDirect.getListings as any).mockResolvedValue(mockListingResult);

      const request = new Request('http://localhost/api/listing?priceRange=under-1m&page=1&limit=24');
      await GET(request as any);

      expect(dbDirect.getListings).toHaveBeenCalledWith(
        expect.objectContaining({
          priceRange: { min: 0, max: 999999 },
        }),
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should parse over-50m price range correctly', async () => {
      (featureFlags.useDirectSql as any).mockReturnValue(true);
      (dbPool.initializePool as any).mockResolvedValue(undefined);
      (dbDirect.getListings as any).mockResolvedValue(mockListingResult);

      const request = new Request('http://localhost/api/listing?priceRange=over-50m&page=1&limit=24');
      await GET(request as any);

      expect(dbDirect.getListings).toHaveBeenCalledWith(
        expect.objectContaining({
          priceRange: { min: 50000001, max: Number.MAX_SAFE_INTEGER },
        }),
        expect.any(Object),
        expect.any(Object)
      );
    });
  });

  describe('Error Handling', () => {
    it('should return 500 error when direct SQL fails', async () => {
      (featureFlags.useDirectSql as any).mockReturnValue(true);
      (dbPool.initializePool as any).mockResolvedValue(undefined);
      (dbDirect.getListings as any).mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new Request('http://localhost/api/listing?page=1&limit=24');
      const response = await GET(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('Failed to fetch listings');
    });

    it('should include timestamp in error response', async () => {
      (featureFlags.useDirectSql as any).mockReturnValue(true);
      (dbPool.initializePool as any).mockResolvedValue(undefined);
      (dbDirect.getListings as any).mockRejectedValue(
        new Error('Test error')
      );

      const request = new Request('http://localhost/api/listing?page=1&limit=24');
      const response = await GET(request as any);
      const data = await response.json();

      expect(data).toHaveProperty('timestamp');
      expect(new Date(data.timestamp)).toBeInstanceOf(Date);
    });

    it('should include error details in response', async () => {
      (featureFlags.useDirectSql as any).mockReturnValue(true);
      (dbPool.initializePool as any).mockResolvedValue(undefined);
      (dbDirect.getListings as any).mockRejectedValue(
        new Error('Connection timeout')
      );

      const request = new Request('http://localhost/api/listing?page=1&limit=24');
      const response = await GET(request as any);
      const data = await response.json();

      expect(data).toHaveProperty('details');
      expect(data.details).toBe('Connection timeout');
    });
  });

  describe('Integration', () => {
    it('should initialize pool when using direct SQL', async () => {
      (featureFlags.useDirectSql as any).mockReturnValue(true);
      (dbPool.initializePool as any).mockResolvedValue(undefined);
      (dbDirect.getListings as any).mockResolvedValue(mockListingResult);

      const request = new Request('http://localhost/api/listing?page=1&limit=24');
      await GET(request as any);

      expect(dbPool.initializePool).toHaveBeenCalled();
    });

    it('should not initialize pool when using Prisma', async () => {
      (featureFlags.useDirectSql as any).mockReturnValue(false);

      const { db } = await import('@/lib/db');
      (db.listing.findMany as any).mockResolvedValue(mockPrismaListings);
      (db.listing.count as any).mockResolvedValue(1);

      const request = new Request('http://localhost/api/listing?page=1&limit=24');
      await GET(request as any);

      expect(dbPool.initializePool).not.toHaveBeenCalled();
    });
  });

  describe('Default Values', () => {
    it('should use default sort (newest) when not specified', async () => {
      (featureFlags.useDirectSql as any).mockReturnValue(true);
      (dbPool.initializePool as any).mockResolvedValue(undefined);
      (dbDirect.getListings as any).mockResolvedValue(mockListingResult);

      const request = new Request('http://localhost/api/listing?page=1&limit=24');
      await GET(request as any);

      expect(dbDirect.getListings).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ field: 'newest' }),
        expect.any(Object)
      );
    });

    it('should use default pagination when not specified', async () => {
      (featureFlags.useDirectSql as any).mockReturnValue(true);
      (dbPool.initializePool as any).mockResolvedValue(undefined);
      (dbDirect.getListings as any).mockResolvedValue(mockListingResult);

      const request = new Request('http://localhost/api/listing');
      await GET(request as any);

      expect(dbDirect.getListings).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        expect.objectContaining({ page: 1, limit: 24 })
      );
    });
  });
});
