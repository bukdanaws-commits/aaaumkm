import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkUserRole } from '@/lib/auth/checkRole';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findOne, update, remove } from '@/lib/supabase-queries';
import { Banner } from '@/types/supabase';

// PATCH /api/admin/banners/[id] - Update banner
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = await checkUserRole(user.id, 'admin');
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, imageUrl, targetUrl, position, budgetTotal, startsAt, endsAt, status } = body;

    const adminSupabase = getSupabaseClient();

    // Get existing banner
    const { data: existingBanner, error: existingError } = await findOne<Banner>(adminSupabase, 'banners', id);

    if (existingError || !existingBanner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    // Validation
    if (budgetTotal !== undefined && budgetTotal <= 0) {
      return NextResponse.json(
        { error: 'Budget must be greater than 0' },
        { status: 400 }
      );
    }

    // Validate position if provided
    if (position) {
      const validPositions = [
        'marketplace-top', 
        'marketplace-sidebar',
        'marketplace-inline', 
        'marketplace-inline-sidebar',
        'home-center',
        'home-center-sidebar',
        'home-inline',
        'home-inline-sidebar'
      ];
      if (!validPositions.includes(position)) {
        return NextResponse.json(
          { error: 'Invalid position' },
          { status: 400 }
        );
      }
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ['pending', 'active', 'paused', 'expired'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (imageUrl) updateData.imageUrl = imageUrl;
    if (targetUrl) updateData.targetUrl = targetUrl;
    if (position) updateData.position = position;
    if (status) updateData.status = status;
    if (budgetTotal !== undefined) updateData.budgetTotal = budgetTotal;
    if (startsAt) updateData.startsAt = new Date(startsAt).toISOString();
    if (endsAt !== undefined) updateData.endsAt = endsAt ? new Date(endsAt).toISOString() : null;

    await update<Banner>(adminSupabase, 'banners', id, updateData);

    return NextResponse.json({ banner: { ...existingBanner, ...updateData } });
  } catch (error) {
    console.error('Error updating banner:', error);
    return NextResponse.json(
      { error: 'Failed to update banner' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/banners/[id] - Delete banner (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = await checkUserRole(user.id, 'admin');
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const adminSupabase = getSupabaseClient();

    // Get existing banner
    const { data: existingBanner, error: existingError } = await findOne<Banner>(adminSupabase, 'banners', id);

    if (existingError || !existingBanner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    // Soft delete
    await update<Banner>(adminSupabase, 'banners', id, {
      deletedAt: new Date().toISOString(),
      status: 'expired',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting banner:', error);
    return NextResponse.json(
      { error: 'Failed to delete banner' },
      { status: 500 }
    );
  }
}
