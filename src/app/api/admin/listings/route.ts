import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseClient, getSupabaseAdmin } from '@/lib/supabase-client';
import { findMany, findOne, update, create, count } from '@/lib/supabase-queries';
import { Listing, Profile, Category, ListingImage, AdminLog } from '@/types/supabase';

// Helper function to check if user is admin
async function checkAdminRole(supabase: any, userId: string): Promise<boolean> {
  const { data: userRole, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('userId', userId)
    .eq('role', 'admin')
    .single();
  
  return !error && !!userRole;
}

export async function GET(request: NextRequest) {
  try {
    // Check for demo/mock authentication (development mode)
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      // Demo mode: extract userId from Bearer token
      userId = authHeader.substring(7);
    } else {
      // Try Supabase authentication
      const supabase = await createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = user.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseClient = getSupabaseClient();

    // Check if user is admin
    const isAdmin = await checkAdminRole(supabaseClient, userId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build filters
    const filters: Record<string, any> = {};
    
    if (search) {
      filters.or = [
        { title: { ilike: `%${search}%` } },
        { description: { ilike: `%${search}%` } },
      ];
    }

    if (status) {
      filters.status = status;
    }

    // Get listings with pagination
    const { data: listings, error: listingsError } = await findMany<Listing>(supabaseClient, 'listings', {
      filters,
      orderBy: [{ column: 'createdAt', ascending: false }],
      limit,
      offset,
      select: 'id, title, slug, price, status, condition, listingType, viewCount, favoriteCount, createdAt, approvedAt, rejectedReason, userId, categoryId',
    });

    if (listingsError) throw listingsError;

    // Get seller info for all listings
    const userIds = (listings || []).map(l => l.userId);
    const { data: profiles, error: profilesError } = await findMany<Profile>(supabaseClient, 'profiles', {
      filters: { userId: userIds },
      select: 'userId, name, email',
    });

    if (profilesError) throw profilesError;

    // Get categories
    const categoryIds = (listings || []).map(l => l.categoryId);
    const { data: categories, error: categoriesError } = await findMany<Category>(supabaseClient, 'categories', {
      filters: { id: categoryIds },
      select: 'id, name',
    });

    if (categoriesError) throw categoriesError;

    // Get primary images
    const listingIds = (listings || []).map(l => l.id);
    const { data: images, error: imagesError } = await supabaseClient
      .from('listing_images')
      .select('listingId, imageUrl')
      .in('listingId', listingIds)
      .eq('isPrimary', true);

    if (imagesError) throw imagesError;

    // Get total count for pagination
    const { count: total, error: totalError } = await count(supabaseClient, 'listings', filters);
    if (totalError) throw totalError;

    // Get counts by status
    const { data: statusCounts, error: statusCountsError } = await supabaseClient
      .from('listings')
      .select('status, count')
      .group('status');

    if (statusCountsError) throw statusCountsError;

    const countsByStatus: Record<string, number> = {};
    (statusCounts || []).forEach(item => {
      countsByStatus[item.status] = item.count as number;
    });

    // Create lookup maps
    const profilesMap = new Map<string, { name: string; email: string }>();
    (profiles || []).forEach(p => profilesMap.set(p.userId, { name: p.name || 'Unknown', email: p.email || '' }));

    const categoriesMap = new Map<string, string>();
    (categories || []).forEach(c => categoriesMap.set(c.id, c.name));

    const imagesMap = new Map<string, string>();
    (images || []).forEach(img => imagesMap.set(img.listingId, img.imageUrl));

    // Format listings data
    const formattedListings = (listings || []).map(listing => ({
      id: listing.id,
      title: listing.title,
      slug: listing.slug,
      price: listing.price,
      status: listing.status,
      condition: listing.condition,
      listing_type: listing.listingType,
      view_count: listing.viewCount,
      favorite_count: listing.favoriteCount,
      created_at: listing.createdAt,
      approved_at: listing.approvedAt,
      rejected_reason: listing.rejectedReason || null,
      primary_image: imagesMap.get(listing.id) || null,
      category: categoriesMap.get(listing.categoryId) || null,
      seller: profilesMap.get(listing.userId) || { id: listing.userId, name: 'Unknown', email: '' },
      report_count: 0,
    }));

    return NextResponse.json({
      listings: formattedListings,
      counts_by_status: countsByStatus,
      pagination: {
        page,
        limit,
        total: total || 0,
        totalPages: Math.ceil((total || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching admin listings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check for demo/mock authentication (development mode)
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      // Demo mode: extract userId from Bearer token
      userId = authHeader.substring(7);
    } else {
      // Try Supabase authentication
      const supabase = await createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = user.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseClient = getSupabaseClient();
    const supabaseAdmin = getSupabaseAdmin();

    // Check if user is admin
    const isAdmin = await checkAdminRole(supabaseClient, userId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { listingId, action, data } = body;

    if (!listingId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the target listing
    const { data: listing, error: listingError } = await findOne<Listing>(supabaseClient, 'listings', listingId);

    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const supabase = getSupabaseAdmin();

    switch (action) {
      case 'approve': {
        await update<Listing>(supabase, 'listings', listingId, {
          status: 'active',
          approvedBy: userId,
          approvedAt: new Date().toISOString(),
          publishedAt: new Date().toISOString(),
          rejectedReason: null,
        });

        // Log admin action
        await create<AdminLog>(supabase, 'admin_logs', {
          adminId: userId,
          action: 'approve_listing',
          targetType: 'listing',
          targetId: listingId,
          details: JSON.stringify({ title: listing.title }),
        });

        return NextResponse.json({ success: true, message: 'Listing approved successfully' });
      }

      case 'reject': {
        const { reason } = data;
        if (!reason) {
          return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
        }

        await update<Listing>(supabase, 'listings', listingId, {
          status: 'rejected',
          rejectedReason: reason,
        });

        // Log admin action
        await create<AdminLog>(supabase, 'admin_logs', {
          adminId: userId,
          action: 'reject_listing',
          targetType: 'listing',
          targetId: listingId,
          details: JSON.stringify({ title: listing.title, reason }),
        });

        return NextResponse.json({ success: true, message: 'Listing rejected' });
      }

      case 'toggle_status': {
        const { status } = data;
        
        if (!['draft', 'pending_review', 'active', 'sold', 'expired', 'rejected'].includes(status)) {
          return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        await update<Listing>(supabase, 'listings', listingId, { status });

        // Log admin action
        await create<AdminLog>(supabase, 'admin_logs', {
          adminId: userId,
          action: 'update_listing_status',
          targetType: 'listing',
          targetId: listingId,
          details: JSON.stringify({ title: listing.title, newStatus: status }),
        });

        return NextResponse.json({ success: true, message: 'Status updated successfully' });
      }

      case 'bulk_approve': {
        const { listingIds } = data;
        if (!Array.isArray(listingIds) || listingIds.length === 0) {
          return NextResponse.json({ error: 'No listings selected' }, { status: 400 });
        }

        for (const id of listingIds) {
          await update<Listing>(supabase, 'listings', id, {
            status: 'active',
            approvedBy: userId,
            approvedAt: new Date().toISOString(),
            publishedAt: new Date().toISOString(),
          });
        }

        // Log admin action
        await create<AdminLog>(supabase, 'admin_logs', {
          adminId: userId,
          action: 'bulk_approve_listings',
          targetType: 'listing',
          details: JSON.stringify({ count: listingIds.length, listingIds }),
        });

        return NextResponse.json({ success: true, message: `${listingIds.length} listings approved` });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating listing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}