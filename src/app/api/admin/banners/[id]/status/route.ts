import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkUserRole } from '@/lib/auth/checkRole';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findOne, update, create } from '@/lib/supabase-queries';

// PATCH /api/admin/banners/[id]/status - Update banner status
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
    const { status } = body;

    // Validate status
    const validStatuses = ['pending', 'active', 'paused', 'expired'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Get existing banner
    const adminClient = getSupabaseClient();
    const { data: existingBanner, error: bannerError } = await findOne(adminClient, 'banners', id);

    if (bannerError || !existingBanner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    const updateData: Record<string, any> = { status };
    if (status === 'active') {
      updateData.approved_by = user.id;
      updateData.approved_at = new Date().toISOString();
    }

    const { data: banner, error: updateError } = await update(adminClient, 'banners', id, updateData);

    if (updateError) {
      console.error('Error updating banner:', updateError);
      return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 });
    }

    // Log admin action
    await create(adminClient, 'admin_logs', {
      admin_id: user.id,
      action: 'update_banner_status',
      target_type: 'banner',
      target_id: banner.id,
      details: JSON.stringify({ 
        previousStatus: existingBanner.status,
        newStatus: status 
      }),
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ banner });
  } catch (error) {
    console.error('Error updating banner status:', error);
    return NextResponse.json(
      { error: 'Failed to update banner status' },
      { status: 500 }
    );
  }
}
