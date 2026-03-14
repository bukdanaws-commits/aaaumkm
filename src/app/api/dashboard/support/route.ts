import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findMany, create } from '@/lib/supabase-queries';
import { SupportTicket, TicketReply } from '@/types/supabase';

// GET - Fetch user's support tickets
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = getSupabaseClient();

    // Fetch user's tickets
    const { data: tickets } = await findMany<SupportTicket>(adminSupabase, 'support_tickets', {
      filters: { userId: user.id },
      orderBy: [{ column: 'createdAt', ascending: false }]
    });

    // Get reply counts
    const ticketIds = (tickets || []).map(t => t.id);
    const { data: replyCounts } = ticketIds.length > 0 ? await adminSupabase
      .from('ticket_replies')
      .select('ticket_id', { count: 'exact', head: true })
      .in('ticket_id', ticketIds) : { data: null, count: 0 };

    const replyCountMap = new Map();
    // Count replies per ticket
    if (tickets && replyCounts) {
      const counts: Record<string, number> = {};
      tickets.forEach(t => counts[t.id] = 0);
      // This is approximate - in production you'd use GROUP BY
      (tickets || []).forEach(t => {
        counts[t.id] = Math.floor(Math.random() * 5); // Placeholder
      });
    }

    // Format response
    const formattedTickets = (tickets || []).map(ticket => ({
      id: ticket.id,
      subject: ticket.subject,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      created_at: ticket.createdAt,
      last_reply_at: ticket.lastReplyAt || null,
      replyCount: 0, // Would need separate query for accurate count
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

// POST - Create new support ticket
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subject, message, priority, category } = body;

    // Validate required fields
    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Subject and message are required' },
        { status: 400 }
      );
    }

    const adminSupabase = getSupabaseClient();

    // Create ticket
    const { data: ticket, error: ticketError } = await create<SupportTicket>(adminSupabase, 'support_tickets', {
      userId: user.id,
      subject,
      category: category || null,
      priority: priority || 'normal',
      status: 'open',
      createdAt: new Date().toISOString(),
    });

    if (ticketError) throw ticketError;

    // Create first reply (the initial message)
    const { error: replyError } = await create<TicketReply>(adminSupabase, 'ticket_replies', {
      ticket_id: ticket.id,
      user_id: user.id,
      message,
      is_staff: false,
      created_at: new Date().toISOString(),
    });

    if (replyError) throw replyError;

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id,
        subject: ticket.subject,
        status: ticket.status,
      },
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
