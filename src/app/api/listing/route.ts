import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findMany, create, count } from '@/lib/supabase-queries';
import { Listing, ListingImage, Category, Profile } from '@/types/supabase';

/**
 * Parse price range string into min/max values
 * Supports: 'under-1m', '1m-10m', '10m-50m', 'over-50m'
 */
function parsePriceRange(priceRangeStr: string): { min: number; max: number } | null {
  switch (priceRangeStr) {
    case 'under-1m':
      return { min: 0, max: 999999 };
    case '1m-10m':
      return { min: 1000000, max: 10000000 };
    case '10m-50m':
      return { min: 10000000, max: 50000000 };
    case 'over-50m':
      return { min: 50000001, max: Number.MAX_SAFE_INTEGER };
    default:
      return null;
  }
}

/**
 * Log performance metrics for listing page API
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

  const logMessage = `[LISTING_API] ${implementation.toUpperCase()} - ${duration}ms - ${queryCount} queries - ${resultCount} results`;

  if (duration > slowQueryThreshold) {
    console.warn(`[SLOW_QUERY] ${logMessage}`);
  } else if (process.env.NODE_ENV === 'development') {
    console.log(`[METRICS] ${logMessage}`);
  }
}

// GET - Fetch listings for marketplace
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const implementation = 'supabase';
  const queryCount = 2; // listings query + count query

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') || 'newest';
    const search = searchParams.get('search');
    const provinceId = searchParams.get('provinceId');
    const regencyId = searchParams.get('regencyId');
    const priceRangeStr = searchParams.get('priceRange');
    const condition = searchParams.get('condition');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '24');

    const supabase = getSupabaseClient();
    const offset = (page - 1) * limit;

    // Build filters
    const filters: Record<string, any> = {
      status: 'active',
    };

    if (category) {
      filters.categoryId = category;
    }

    if (search) {
      // Supabase doesn't support OR with contains, so we'll filter in application
      // For better performance, consider using textSearch with tsvector
    }

    // Location filters
    if (provinceId) {
      filters.provinceId = provinceId;
    }

    if (regencyId) {
      filters.regencyId = regencyId;
    }

    // Condition filter
    if (condition) {
      filters.condition = condition;
    }

    // Price range filter
    let priceMin: number | undefined;
    let priceMax: number | undefined;
    if (priceRangeStr) {
      const priceRange = parsePriceRange(priceRangeStr);
      if (priceRange) {
        priceMin = priceRange.min;
        priceMax = priceRange.max;
      }
    }

    // Build orderBy
    const orderBy: { column: string; ascending: boolean }[] = [];
    
    if (sort === 'price-low') {
      orderBy.push({ column: 'price', ascending: true });
    } else if (sort === 'price-high') {
      orderBy.push({ column: 'price', ascending: false });
    } else if (sort === 'popular') {
      orderBy.push({ column: 'viewCount', ascending: false });
    } else {
      orderBy.push({ column: 'createdAt', ascending: false }); // newest
    }

    // Fetch listings with relations
    const { data: listings, error: listingsError } = await findMany<Listing>(supabase, 'listings', {
      select: `id, title, slug, price, condition, city, province, provinceId, regencyId, viewCount, favoriteCount, createdAt, isFeatured, categoryId`,
      filters,
      orderBy,
      limit,
      offset,
    });

    if (listingsError) throw listingsError;

    // Filter by search if provided (Supabase limitation)
    let filteredListings = listings || [];
    if (search) {
      const searchLower = search.toLowerCase();
      filteredListings = filteredListings.filter(l => 
        l.title.toLowerCase().includes(searchLower) ||
        (l.description && l.description.toLowerCase().includes(searchLower))
      );
    }

    // Filter by price range if provided
    if (priceMin !== undefined || priceMax !== undefined) {
      filteredListings = filteredListings.filter(l => {
        if (priceMin !== undefined && l.price < priceMin) return false;
        if (priceMax !== undefined && l.price > priceMax) return false;
        return true;
      });
    }

    // Fetch images for each listing
    const listingIds = filteredListings.map(l => l.id);
    const { data: images, error: imagesError } = await supabase
      .from('listing_images')
      .select('listingId, imageUrl, isPrimary')
      .in('listingId', listingIds);

    if (imagesError) throw imagesError;

    // Get total count
    const { count: total, error: countError } = await count(supabase, 'listings', filters);
    if (countError) throw countError;

    // Format listings with images
    const formattedListings = filteredListings.map(listing => {
      const listingImages = images?.filter(img => img.listingId === listing.id) || [];
      const primaryImage = listingImages.find(img => img.isPrimary) || listingImages[0];

      return {
        id: listing.id,
        title: listing.title,
        slug: listing.slug,
        price: listing.price,
        city: listing.city,
        province: listing.province,
        condition: listing.condition,
        viewCount: listing.viewCount,
        imageUrl: primaryImage?.imageUrl || null,
        isFeatured: listing.isFeatured,
        createdAt: listing.createdAt,
      };
    });

    const duration = Date.now() - startTime;

    // Log performance metrics
    logPerformanceMetrics(implementation, duration, queryCount, formattedListings.length);

    return NextResponse.json({
      listings: formattedListings,
      pagination: {
        page,
        limit,
        total: total || 0,
        totalPages: Math.ceil((total || 0) / limit),
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('Error fetching listings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);

    // Log error metrics
    console.error(`[LISTING_API] ${implementation.toUpperCase()} - ERROR - ${duration}ms - ${errorMessage}`);

    return NextResponse.json(
      { 
        error: 'Failed to fetch listings',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// POST - Create new listing
export async function POST(request: NextRequest) {
  try {
    // Import Supabase client
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      price,
      categoryId,
      condition,
      city,
      province,
      listingType,
      priceType,
      images,
      primaryImageIndex,
      status,
    } = body;

    // Validate required fields
    if (!title || !description || !categoryId || !city || !province) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique slug from title
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100);
    
    // Add random suffix to ensure uniqueness
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const slug = `${baseSlug}-${randomSuffix}`;

    // Create listing using Supabase
    const { data: listing, error: listingError } = await create<Listing>(supabase, 'listings', {
      userId: user.id,
      categoryId,
      title,
      slug,
      description,
      price: parseFloat(price) || 0,
      priceType: priceType || 'fixed',
      listingType: listingType || 'sale',
      condition: condition || 'new',
      status: status || 'active',
      city,
      province,
      publishedAt: new Date().toISOString(),
    });

    if (listingError) throw listingError;

    // Create images if provided
    if (images && images.length > 0) {
      const imageData = images.map((url: string, index: number) => ({
        listingId: listing.id,
        imageUrl: url,
        isPrimary: index === (primaryImageIndex || 0),
        sortOrder: index,
      }));

      const { error: imagesError } = await supabase
        .from('listing_images')
        .insert(imageData);

      if (imagesError) throw imagesError;
    }

    // Update category listing count
    const { error: categoryError } = await supabase
      .from('categories')
      .update({ listingCount: (await count(supabase, 'listings', { categoryId })).count })
      .eq('id', categoryId);

    // Note: For atomic increment, we'd need a database function
    // For now, we'll skip this or use RPC if available

    // Update user's listing count
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        totalListings: (await count(supabase, 'listings', { userId: user.id })).count,
        activeListings: (await count(supabase, 'listings', { userId: user.id, status: 'active' })).count
      })
      .eq('userId', user.id);

    return NextResponse.json({ listing }, { status: 201 });
  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json(
      { error: 'Failed to create listing: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}