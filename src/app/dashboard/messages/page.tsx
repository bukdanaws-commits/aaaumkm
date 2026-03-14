'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { MessageCircle, ArrowRight, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Conversation {
  id: string;
  listing: {
    id: string;
    title: string;
    image: string | null;
  } | null;
  otherUser: {
    id: string;
    name: string;
    avatar: string | null;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    isMine: boolean;
  } | null;
  unreadCount: number;
  updatedAt: string;
}

export default function DashboardMessages() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;
      
      try {
        const response = await fetch('/api/dashboard/messages');
        if (response.ok) {
          const data = await response.json();
          setConversations(data.conversations);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchConversations();
    }
  }, [user, authLoading]);

  const filteredConversations = conversations.filter((conv) =>
    conv.listing?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  if (authLoading || isLoading) {
    return (
      <DashboardLayout title="Pesan" description="Chat dengan pembeli dan penjual">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Pesan" 
      description={totalUnread > 0 ? `${totalUnread} pesan belum dibaca` : 'Chat dengan pembeli dan penjual'}
    >
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari percakapan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {conversations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Belum ada percakapan</p>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Mulai chat dengan penjual saat Anda tertarik dengan iklan
            </p>
            <Button onClick={() => router.push('/marketplace')}>
              Jelajahi Marketplace
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ) : filteredConversations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Tidak ada percakapan yang cocok
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredConversations.map((conv) => (
            <Card
              key={conv.id}
              className={cn(
                "cursor-pointer transition-colors hover:bg-muted/50",
                conv.unreadCount > 0 && "border-primary/50"
              )}
              onClick={() => router.push(`/messages/${conv.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {conv.otherUser.avatar ? (
                        <img
                          src={conv.otherUser.avatar}
                          alt={conv.otherUser.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <MessageCircle className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    {conv.unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {conv.unreadCount}
                      </Badge>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{conv.otherUser.name}</p>
                        {conv.listing && (
                          <p className="text-sm text-muted-foreground truncate">
                            {conv.listing.title}
                          </p>
                        )}
                      </div>
                      {conv.lastMessage && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(conv.lastMessage.createdAt), {
                            addSuffix: true,
                            locale: id,
                          })}
                        </span>
                      )}
                    </div>
                    {conv.lastMessage && (
                      <p
                        className={cn(
                          "text-sm mt-1 truncate",
                          !conv.lastMessage.isMine && conv.unreadCount > 0
                            ? "font-medium text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {conv.lastMessage.isMine && (
                          <span className="text-muted-foreground">Anda: </span>
                        )}
                        {conv.lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
