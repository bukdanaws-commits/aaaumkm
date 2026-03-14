import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseClient, getSupabaseAdmin } from '@/lib/supabase-client';
import { findMany, findOne, update, remove, count } from '@/lib/supabase-queries';
import { Notification } from '@/types/supabase';

// GET - Fetch user notifications
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    const supabaseClient = getSupabaseClient();

    // Build filters
    const filters: Record<string, any> = { userId: user.id };
    if (unreadOnly) {
      filters.isRead = false;
    }

    // Fetch notifications
    const { data: notifications, error: notificationsError } = await findMany<Notification>(supabaseClient, 'notifications', {
      filters,
      orderBy: [{ column: 'createdAt', ascending: false }],
      limit,
    });

    if (notificationsError) throw notificationsError;

    // Get unread count
    const { count: unreadCount, error: countError } = await count(supabaseClient, 'notifications', {
      userId: user.id,
      isRead: false,
    });

    if (countError) throw countError;

    return NextResponse.json({
      notifications: notifications || [],
      unreadCount: unreadCount || 0,
      total: (notifications || []).length,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Mark notification(s) as read
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, markAllAsRead } = body;

    const supabaseAdmin = getSupabaseAdmin();

    if (markAllAsRead) {
      // Mark all notifications as read using updateMany
      const { error: updateError } = await supabaseAdmin
        .from('notifications')
        .update({ 
          isRead: true, 
          readAt: new Date().toISOString() 
        })
        .eq('userId', user.id)
        .eq('isRead', false);

      if (updateError) throw updateError;

      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read',
      });
    } else if (notificationId) {
      // Mark single notification as read
      const { data: notification, error: findError } = await findOne<Notification>(supabaseAdmin, 'notifications', notificationId);

      if (findError || !notification || notification.userId !== user.id) {
        return NextResponse.json(
          { error: 'Notification not found' },
          { status: 404 }
        );
      }

      const { error: updateError } = await update<Notification>(supabaseAdmin, 'notifications', notificationId, {
        isRead: true,
        readAt: new Date().toISOString(),
      });

      if (updateError) throw updateError;

      return NextResponse.json({
        success: true,
        message: 'Notification marked as read',
      });
    } else {
      return NextResponse.json(
        { error: 'Missing notificationId or markAllAsRead' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete notification(s)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');
    const deleteAll = searchParams.get('all') === 'true';

    const supabaseAdmin = getSupabaseAdmin();

    if (deleteAll) {
      // Delete all read notifications
      const { error: deleteError } = await supabaseAdmin
        .from('notifications')
        .delete()
        .eq('userId', user.id)
        .eq('isRead', true);

      if (deleteError) throw deleteError;

      return NextResponse.json({
        success: true,
        message: 'All read notifications deleted',
      });
    } else if (notificationId) {
      // Delete single notification
      const { data: notification, error: findError } = await findOne<Notification>(supabaseAdmin, 'notifications', notificationId);

      if (findError || !notification || notification.userId !== user.id) {
        return NextResponse.json(
          { error: 'Notification not found' },
          { status: 404 }
        );
      }

      const { error: deleteError } = await remove(supabaseAdmin, 'notifications', notificationId);
      if (deleteError) throw deleteError;

      return NextResponse.json({
        success: true,
        message: 'Notification deleted',
      });
    } else {
      return NextResponse.json(
        { error: 'Missing notification id or all parameter' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}