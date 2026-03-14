import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findMany, create, createMany } from '@/lib/supabase-queries';

// Helper function to check if user is admin
async function checkAdminRole(userId: string): Promise<boolean> {
  const adminSupabase = getSupabaseClient();
  const { data: userRole } = await adminSupabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .single();
  return !!userRole;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      userId = authHeader.substring(7);
    } else {
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

    // Check if user is admin
    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { title, message, target } = body;

    if (!title || !message || !target) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const adminSupabase = getSupabaseClient();

    // Get target users based on filter
    let targetUsers: any[] = [];

    switch (target) {
      case 'all':
        const { data: allUsers } = await findMany(adminSupabase, 'profiles', {
          select: 'user_id',
        });
        targetUsers = allUsers || [];
        break;

      case 'sellers':
        // Users with at least 1 listing
        const { data: sellers } = await findMany(adminSupabase, 'profiles', {
          select: 'user_id',
          filters: {
            listings: { exists: true }, // This needs a different approach
          },
        });
        // Fallback: get all users with listings
        const { data: sellerUsers } = await adminSupabase
          .from('listings')
          .select('user_id');
        const uniqueSellers = [...new Set(sellerUsers?.map((l: any) => l.user_id) || [])];
        targetUsers = uniqueSellers.map(userId => ({ user_id: userId }));
        break;

      case 'verified':
        // Users with KYC verified
        const { data: verifiedUsers } = await findMany(adminSupabase, 'profiles', {
          select: 'user_id',
          filters: { is_kyc_verified: true },
        });
        targetUsers = verifiedUsers || [];
        break;

      case 'buyers':
        // Users with at least 1 order as buyer
        const { data: buyerUsers } = await adminSupabase
          .from('orders')
          .select('buyer_id');
        const uniqueBuyers = [...new Set(buyerUsers?.map((o: any) => o.buyer_id) || [])];
        targetUsers = uniqueBuyers.map(userId => ({ user_id: userId }));
        break;

      default:
        return NextResponse.json({ error: 'Invalid target' }, { status: 400 });
    }

    // Create notifications for all target users
    const notifications = targetUsers.map((user: any) => ({
      user_id: user.user_id,
      type: 'info',
      title,
      message,
      is_read: false,
      created_at: new Date().toISOString(),
    }));

    // Batch create notifications
    if (notifications.length > 0) {
      await createMany(adminSupabase, 'notifications', notifications);
    }

    // Get user email for activity log
    const { data: userProfile } = await findOne(adminSupabase, 'profiles', userId);

    // Log the broadcast in activity log
    await create(adminSupabase, 'activity_logs', {
      user_id: userId,
      user_email: userProfile?.email || '',
      action: 'broadcast_sent',
      description: `Broadcast sent: ${title}`,
      metadata: {
        target,
        recipientCount: notifications.length,
        title,
        message: message.substring(0, 100),
      },
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      recipientCount: notifications.length,
      message: `Broadcast sent to ${notifications.length} users`,
    });
  } catch (error) {
    console.error('Error sending broadcast:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get broadcast history
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      userId = authHeader.substring(7);
    } else {
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

    // Check if user is admin
    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const adminSupabase = getSupabaseClient();

    // Get broadcast history from activity logs
    const { data: broadcasts } = await findMany(adminSupabase, 'activity_logs', {
      select: 'id, user_id, user_email, action, description, metadata, created_at',
      filters: { action: 'broadcast_sent' },
      orderBy: [{ column: 'created_at', ascending: false }],
      limit: 20,
    });

    const formattedBroadcasts = (broadcasts || []).map((log: any) => {
      let metadata: any = {};
      try {
        metadata = typeof log.metadata === 'string' ? JSON.parse(log.metadata) : (log.metadata || {});
      } catch (e) {
        // ignore
      }

      return {
        id: log.id,
        title: metadata.title || 'Broadcast',
        message: metadata.message || '',
        target: metadata.target || 'all',
        recipientCount: metadata.recipientCount || 0,
        createdAt: log.created_at,
      };
    });

    return NextResponse.json({ broadcasts: formattedBroadcasts });
  } catch (error) {
    console.error('Error fetching broadcast history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
