import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findMany, create, count } from '@/lib/supabase-queries';
import { ActivityLog } from '@/types/supabase';
import { checkUserRole } from '@/lib/auth/checkRole';

// GET /api/admin/activity-logs - Get activity logs
export async function GET(request: NextRequest) {
  try {
    console.log('📊 Activity Logs API called');
    
    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    console.log('User:', user?.email, 'Auth Error:', authError);

    if (authError || !user) {
      console.log('❌ Unauthorized - No user');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check admin role
    const isAdmin = await checkUserRole(user.id, 'admin');
    console.log('Is Admin:', isAdmin);
    
    if (!isAdmin) {
      console.log('❌ Forbidden - Not admin');
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const action = searchParams.get('action');

    const offset = (page - 1) * limit;

    // Build filters
    const filters: Record<string, any> = {};
    if (action) {
      filters.action = action;
    }

    const supabaseClient = getSupabaseClient();

    // Get logs
    const { data: logs, error: logsError } = await findMany<ActivityLog>(supabaseClient, 'admin_logs', {
      filters,
      orderBy: [{ column: 'createdAt', ascending: false }],
      limit,
      offset,
    });

    if (logsError) throw logsError;

    // Get total count
    const { count: total, error: countError } = await count(supabaseClient, 'admin_logs', filters);
    if (countError) throw countError;

    return NextResponse.json({
      logs: logs || [],
      pagination: {
        page,
        limit,
        total: total || 0,
        totalPages: Math.ceil((total || 0) / limit),
      },
    });

  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/activity-logs - Create activity log (for testing)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, description, metadata } = body;

    // Get IP address
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    // Get user agent
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const supabaseClient = getSupabaseClient();

    // Create log
    const { data: log, error: createError } = await create<ActivityLog>(supabaseClient, 'admin_logs', {
      adminId: user.id,
      action,
      targetType: 'activity_log',
      details: JSON.stringify({ description, metadata, ipAddress, userAgent }),
      ipAddress,
    });

    if (createError) throw createError;

    return NextResponse.json(log);

  } catch (error) {
    console.error('Error creating activity log:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}