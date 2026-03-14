/**
 * Unit tests for Product Detail API Route
 * Tests feature flag routing, response format, and performance logging
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from '../listing/[id]/route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/feature-flags', () => ({
  useDirectSql: vi.fn(),
}));

vi.mock('@/lib/db-direct', () => ({
  getListingDetail: vi.fn(),
}));

vi.mock('@/lib/db-pool', () => ({
  initializePool: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    listing: {
      findUnique: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

import { useDirectSql } from '@/lib/feature-flags';
import { getListingDetail } from '@/lib/db-direct';
import { initializePool } from '@/lib/db-pool';
import { db } from '@/lib/db';

describe('Product Detail API Route', () => {
  const mockListingId = 'test-listing-id';
  const mockRequest = new NextRequest('http://localhost:3000/api/listing/test-listing-id');
  const mockParams = Promise.resolve({ id: mockListingId });

  const mockListingData = {
    listing: {
      id: mockListingId,
      title: 'Test Product',
      slug: 'test-product',
      description: 'Test description',
      price: 100000,
      priceType: 'fixed',
      condition: 'new',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      viewCount: 10,
      favoriteCount: 5,
      isFeatured: false,
      status: 'active',
      userId: 'user-1',
      categoryId: 'cat-1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      profile: {
        userId: 'user-1',
        name: 'Test User',
        phone: '08123456789',
        avatarUrl: null,
        city: 'Jakarta',
        province: 'DKI Jakarta',
        isVerified: true,
        averageRating: 4.5,
        totalReviews: 10,
        totalListings: 5,
        soldCount: 3,
        createdAt: new Date('2024-01-01'),
      },
      category: {
        id: 'cat-1',
        name: 'Electronics',
        slug: 'electronics',
      },
      images: [
        {
          id: 'img-1',
          listingId: mockListingId,
          imageUrl: 'https://example.com/image1.jpg',
          isPrimary: true,
          sortOrder: 0,
          createdAt: new Date('2024-01-01'),
        },
      ],
      auction: null,
      boosts: [],
      isSaved: false,
      savedCount: 2,
    },
    similarListings: [
      {
        id: 'similar-1',
        title: 'Similar Product',
        slug: 'similar-product',
        price: 90000,
        priceType: 'fixed',
        condition: 'new',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        viewCount: 5,
        favoriteCount: 2,
        isFeatured: false,
        imageUrl: 'https://example.com/similar1.jpg',
        category: {
          name: 'Electronics',
          slug: 'electronics',
        },
        createdAt: new Date('2024-01-02'),
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console logs during tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Feature Flag Routing', () => {
    it('should use direct SQL when feature flag is enabled', async () => {
      vi.mocked(useDirectSql).mockReturnValue(true);
      vi.mocked(getListingDetail).mockResolvedValue(mockListingData);

      const response = await GET(mockRequest, { params: mockParams });
      const data = await response.json();

      expect(useDirectSql).toHaveBeenCalledWith('detail');
      expect(initializePool).toHaveBeenCalled();
      expect(getListingDetail).toHaveBeenCalledWith(mockListingId);
      
      // Verify structure (dates will be serialized to ISO strings in JSON response)
      expect(data).toHaveProperty('listing');
      expect(data).toHaveProperty('similarListings');
      expect(data.listing.id).toBe(mockListingId);
      expect(data.listing.title).toBe('Test Product');
    });

    it('should use Prisma when feature flag is disabled', async () => {
      vi.mocked(useDirectSql).mockReturnValue(false);
      
      const mockPrismaListing = {
        id: mockListingId,
        title: 'Test Product',
        slug: 'test-product',
        description: 'Test description',
        price: 100000,
        priceType: 'fixed',
        condition: 'new',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        viewCount: 10,
        favoriteCount: 5,
        isFeatured: false,
        status: 'active',
        userId: 'user-1',
        categoryId: 'cat-1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        profile: mockListingData.listing.profile,
        category: mockListingData.listing.category,
        images: mockListingData.listing.images,
        auction: null,
        boosts: [],
        savedBy: [{ userId: 'user-2' }, { userId: 'user-3' }],
      };

      vi.mocked(db.listing.findUnique).mockResolvedValue(mockPrismaListing as any);
      vi.mocked(db.listing.update).mockResolvedValue(mockPrismaListing as any);
      vi.mocked(db.listing.findMany).mockResolvedValue([
        {
          id: 'similar-1',
          title: 'Similar Product',
          slug: 'similar-product',
          price: 90000,
          condition: 'new',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          viewCount: 5,
          favoriteCount: 2,
          isFeatured: false,
          createdAt: new Date('2024-01-02'),
          images: [{ imageUrl: 'https://example.com/similar1.jpg' }],
          category: { name: 'Electronics', slug: 'electronics' },
        },
      ] as any);

      const response = await GET(mockRequest, { params: mockParams });
      const data = await response.json();

      expect(useDirectSql).toHaveBeenCalledWith('detail');
      expect(db.listing.findUnique).toHaveBeenCalledWith({
        where: { id: mockListingId },
        include: expect.any(Object),
      });
      expect(db.listing.update).toHaveBeenCalledWith({
        where: { id: mockListingId },
        data: { viewCount: { increment: 1 } },
      });
      expect(data.listing).toBeDefined();
      expect(data.similarListings).toBeDefined();
    });
  });

  describe('Response Format', () => {
    it('should return response with correct structure', async () => {
      vi.mocked(useDirectSql).mockReturnValue(true);
      vi.mocked(getListingDetail).mockResolvedValue(mockListingData);

      const response = await GET(mockRequest, { params: mockParams });
      const data = await response.json();

      expect(data).toHaveProperty('listing');
      expect(data).toHaveProperty('similarListings');
      expect(data.listing).toHaveProperty('id');
      expect(data.listing).toHaveProperty('title');
      expect(data.listing).toHaveProperty('profile');
      expect(data.listing).toHaveProperty('category');
      expect(data.listing).toHaveProperty('images');
      expect(Array.isArray(data.similarListings)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 when listing not found (direct SQL)', async () => {
      vi.mocked(useDirectSql).mockReturnValue(true);
      vi.mocked(getListingDetail).mockRejectedValue(new Error('Listing not found'));

      const response = await GET(mockRequest, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Listing not found');
    });

    it('should return 404 when listing not found (Prisma)', async () => {
      vi.mocked(useDirectSql).mockReturnValue(false);
      vi.mocked(db.listing.findUnique).mockResolvedValue(null);

      const response = await GET(mockRequest, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Listing not found');
    });

    it('should return 500 error when direct SQL fails', async () => {
      vi.mocked(useDirectSql).mockReturnValue(true);
      vi.mocked(getListingDetail).mockRejectedValue(new Error('Database error'));

      const response = await GET(mockRequest, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch listing');
    });
  });

  describe('Performance Logging', () => {
    it('should log metrics for direct SQL implementation', async () => {
      vi.mocked(useDirectSql).mockReturnValue(true);
      vi.mocked(getListingDetail).mockResolvedValue(mockListingData);

      await GET(mockRequest, { params: mockParams });

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[METRICS] detail (sql)')
      );
    });

    it('should log metrics for Prisma implementation', async () => {
      vi.mocked(useDirectSql).mockReturnValue(false);
      vi.mocked(db.listing.findUnique).mockResolvedValue({
        ...mockListingData.listing,
        savedBy: [],
      } as any);
      vi.mocked(db.listing.update).mockResolvedValue({} as any);
      vi.mocked(db.listing.findMany).mockResolvedValue([]);

      await GET(mockRequest, { params: mockParams });

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[METRICS] detail (prisma)')
      );
    });

    it('should log slow queries when duration exceeds threshold', async () => {
      vi.mocked(useDirectSql).mockReturnValue(true);
      
      // Mock a slow query by adding delay
      vi.mocked(getListingDetail).mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 1100));
        return mockListingData;
      });

      await GET(mockRequest, { params: mockParams });

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('[SLOW_QUERY] detail (sql)')
      );
    });
  });

  describe('Integration', () => {
    it('should initialize pool when using direct SQL', async () => {
      vi.mocked(useDirectSql).mockReturnValue(true);
      vi.mocked(getListingDetail).mockResolvedValue(mockListingData);

      await GET(mockRequest, { params: mockParams });

      expect(initializePool).toHaveBeenCalled();
    });

    it('should not initialize pool when using Prisma', async () => {
      vi.mocked(useDirectSql).mockReturnValue(false);
      vi.mocked(db.listing.findUnique).mockResolvedValue({
        ...mockListingData.listing,
        savedBy: [],
      } as any);
      vi.mocked(db.listing.update).mockResolvedValue({} as any);
      vi.mocked(db.listing.findMany).mockResolvedValue([]);

      await GET(mockRequest, { params: mockParams });

      expect(initializePool).not.toHaveBeenCalled();
    });
  });
});
