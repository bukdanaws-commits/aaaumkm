import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findMany, count } from '@/lib/supabase-queries';
import { Conversation, Message } from '@/types/supabase';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    const adminSupabase = getSupabaseClient();

    // Get conversations where user is buyer or seller
    const { data: conversations } = await findMany<Conversation>(adminSupabase, 'conversations', {
      filters: { or: [{ buyerId: userId }, { sellerId: userId }] },
      orderBy: [{ column: 'updatedAt', ascending: false }]
    });

    const conversationIds = (conversations || []).map(c => c.id);

    // Get listings for conversations
    const { data: listings } = conversationIds.length > 0 ? await adminSupabase
      .from('listings')
      .select('id, title, listing_images(image_url)')
      .in('id', (conversations || []).map(c => c.listingId)) : { data: null };

    const listingMap = new Map();
    (listings || []).forEach(l => {
      listingMap.set(l.id, {
        id: l.id,
        title: l.title,
        image: (l.listing_images || [])[0]?.image_url || null
      });
    });

    // Get profiles for buyers and sellers
    const { data: profiles } = await adminSupabase
      .from('profiles')
      .select('user_id, name, avatar_url')
      .in('user_id', (conversations || []).flatMap(c => [c.buyerId, c.sellerId]));

    const profileMap = new Map();
    (profiles || []).forEach(p => {
      profileMap.set(p.user_id, { name: p.name, avatar: p.avatar_url });
    });

    // Get last message for each conversation
    const { data: lastMessages } = conversationIds.length > 0 ? await adminSupabase
      .from('messages')
      .select('id, content, created_at, sender_id, is_read, conversation_id')
      .in('conversation_id', conversationIds)
      .order('created_at', { ascending: false }) : { data: null };

    const lastMessageMap = new Map();
    (lastMessages || []).forEach(m => {
      if (!lastMessageMap.has(m.conversation_id)) {
        lastMessageMap.set(m.conversation_id, m);
      }
    });

    // Get unread counts
    const { data: unreadCounts } = conversationIds.length > 0 ? await adminSupabase
      .from('messages')
      .select('conversation_id', { count: 'exact', head: true })
      .in('conversation_id', conversationIds)
      .neq('sender_id', userId)
      .eq('is_read', false) : { count: 0 };

    const unreadMap = new Map();
    // Group by conversation
    (lastMessages || []).forEach(m => {
      if (m.sender_id !== userId && !m.is_read) {
        unreadMap.set(m.conversation_id, (unreadMap.get(m.conversation_id) || 0) + 1);
      }
    });

    // Format conversations
    const formattedConversations = (conversations || []).map(conv => {
      const otherUserId = conv.buyerId === userId ? conv.sellerId : conv.buyerId;
      const otherUser = profileMap.get(otherUserId) || { name: 'Pengguna', avatar: null };
      const lastMessage = lastMessageMap.get(conv.id);

      return {
        id: conv.id,
        listing: listingMap.get(conv.listingId) || null,
        otherUser: {
          id: otherUserId,
          name: otherUser.name || 'Pengguna',
          avatar: otherUser.avatar,
        },
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          createdAt: lastMessage.created_at,
          isMine: lastMessage.sender_id === userId,
        } : null,
        unreadCount: unreadMap.get(conv.id) || 0,
        updatedAt: conv.updatedAt,
      };
    });

    return NextResponse.json({ conversations: formattedConversations });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
