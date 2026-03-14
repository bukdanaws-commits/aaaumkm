import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findOne, remove } from '@/lib/supabase-queries';
import { checkUserRole } from '@/lib/auth/checkRole';
import { logActivity } from '@/lib/activityLog';
import { Listing } from '@/types/supabase';

// DELETE /api/admin/listings/[id] - Delete listing
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15
    const { id } = await params;

    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check admin role
    const isAdmin = await checkUserRole(user.id, 'admin');
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const adminSupabase = getSupabaseClient();

    // Get listing
    const { data: listing, error: listingError } = await findOne<Listing>(adminSupabase, 'listings', id);

    if (listingError || !listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Delete listing
    await remove(adminSupabase, 'listings', id);

    // Log activity
    await logActivity({
      userId: user.id,
      userEmail: user.email || 'admin',
      action: 'listing_deleted',
      description: `Menghapus listing: ${listing.title}`,
      metadata: {
        listingId: id,
        listingTitle: listing.title,
        sellerId: listing.userId,
      }
    });

    return NextResponse.json({
      success: true,
    });

  } catch (error) {
    console.error('Error deleting listing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
