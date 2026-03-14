import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findMany } from '@/lib/supabase-queries';
import { Category } from '@/types/supabase';

/**
 * Log performance metrics for categories API
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

  const logMessage = `[CATEGORIES_API] ${implementation.toUpperCase()} - ${duration}ms - ${queryCount} queries - ${resultCount} results`;

  if (duration > slowQueryThreshold) {
    console.warn(`[SLOW_QUERY] ${logMessage}`);
  } else if (process.env.NODE_ENV === 'development') {
    console.log(`[METRICS] ${logMessage}`);
  }
}

export async function GET() {
  const startTime = Date.now();
  const implementation = 'supabase';
  const queryCount = 1;

  try {
    const supabase = getSupabaseClient();

    // Fetch parent categories only (where parentId is null)
    const { data: categories, error } = await findMany<Category>(supabase, 'categories', {
      filters: {
        isActive: true,
        parentId: null,
      },
      select: 'id, name, slug, icon, color, iconUrl, listingCount',
      orderBy: [{ column: 'name', ascending: true }],
    });

    if (error) throw error;

    const duration = Date.now() - startTime;

    // Log performance metrics
    logPerformanceMetrics(implementation, duration, queryCount, (categories || []).length);

    return NextResponse.json({
      categories: categories || [],
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('Error fetching categories:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);

    // Log error metrics
    console.error(`[CATEGORIES_API] ${implementation.toUpperCase()} - ERROR - ${duration}ms - ${errorMessage}`);

    return NextResponse.json(
      { 
        error: 'Failed to fetch categories',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}