import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findMany, findOne, update, create } from '@/lib/supabase-queries';
import { SupportTicket, Profile, SupportReply } from '@/types/supabase';

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

// GET - Fetch all support tickets (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseClient = getSupabaseClient();

    // Check if user is admin
    const isAdmin = await checkAdminRole(supabaseClient, user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    // Build filters
    const filters: Record<string, any> = {};
    if (status && status !== 'all') {
      filters.status = status;
    }
    if (priority && priority !== 'all') {
      filters.priority = priority;
    }

    // Fetch tickets with user info
    const { data: tickets, error: ticketsError } = await findMany<SupportTicket>(supabaseClient, 'support_tickets', {
      filters,
      orderBy: [
        { column: 'priority', ascending: false },
        { column: 'createdAt', ascending: false },
      ],
    });

    if (ticketsError) throw ticketsError;

    // Get user info for all tickets
    const userIds = (tickets || []).map(t => t.userId);
    const { data: profiles, error: profilesError } = await findMany<Profile>(supabaseClient, 'profiles', {
      filters: { userId: userIds },
      select: 'userId, name, email',
    });

    if (profilesError) throw profilesError;

    // Get reply counts
    const ticketIds = (tickets || []).map(t => t.id);
    const { data: replies, error: repliesError } = await supabaseClient
      .from('support_replies')
      .select('ticketId, id')
      .in('ticketId', ticketIds);

    if (repliesError) throw repliesError;

    // Create lookup maps
    const profilesMap = new Map<string, { name: string; email: string }>();
    (profiles || []).forEach(p => profilesMap.set(p.userId, { name: p.name || 'Unknown', email: p.email || '' }));

    const replyCountsMap = new Map<string, number>();
    (replies || []).forEach(r => {
      replyCountsMap.set(r.ticketId, (replyCountsMap.get(r.ticketId) || 0) + 1);
    });

    // Format response
    const formattedTickets = (tickets || []).map((ticket) => ({
      id: ticket.id,
      subject: ticket.subject,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      created_at: ticket.createdAt,
      last_reply_at: ticket.lastReplyAt,
      user: profilesMap.get(ticket.userId) || { name: 'Unknown', email: '' },
      replyCount: replyCountsMap.get(ticket.id) || 0,
    }));

    return NextResponse.json({
      tickets: formattedTickets,
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update ticket status (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseClient = getSupabaseClient();

    // Check if user is admin
    const isAdmin = await checkAdminRole(supabaseClient, user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { ticketId, status, assignedTo } = body;

    if (!ticketId) {
      return NextResponse.json(
        { error: 'Ticket ID is required' },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: any = {};
    if (status) {
      updateData.status = status;
      if (status === 'resolved') {
        updateData.resolvedBy = user.id;
        updateData.resolvedAt = new Date().toISOString();
      }
    }
    if (assignedTo !== undefined) {
      updateData.assignedTo = assignedTo;
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Update ticket
    const { data: ticket, error: updateError } = await update<SupportTicket>(supabaseAdmin, 'support_tickets', ticketId, updateData);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket?.id,
        status: ticket?.status,
      },
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}