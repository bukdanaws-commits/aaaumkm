'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Loader2, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  ShoppingBag,
  CreditCard,
  MessageSquare,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
}

const notificationIcons: Record<string, any> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  order: ShoppingBag,
  payment: CreditCard,
  message: MessageSquare,
};

const notificationColors: Record<string, string> = {
  info: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20',
  success: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20',
  warning: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20',
  error: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20',
  order: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/20',
  payment: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20',
  message: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20',
};

export default function NotificationsPage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const url = filter === 'unread' 
        ? '/api/notifications?unread=true' 
        : '/api/notifications';
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal memuat notifikasi',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });

      if (!response.ok) throw new Error('Failed to mark as read');

      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, isRead: true, readAt: new Date() } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      toast({
        title: 'Berhasil',
        description: 'Notifikasi ditandai sudah dibaca',
      });
    } catch (error) {
      console.error('Error marking as read:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal menandai notifikasi',
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true }),
      });

      if (!response.ok) throw new Error('Failed to mark all as read');

      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true, readAt: new Date() }))
      );
      setUnreadCount(0);

      toast({
        title: 'Berhasil',
        description: 'Semua notifikasi ditandai sudah dibaca',
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal menandai semua notifikasi',
      });
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));

      toast({
        title: 'Berhasil',
        description: 'Notifikasi dihapus',
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal menghapus notifikasi',
      });
    }
  };

  const handleDeleteAllRead = async () => {
    try {
      const response = await fetch('/api/notifications?all=true', {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete all');

      // Update local state - remove all read notifications
      setNotifications(prev => prev.filter(n => !n.isRead));

      toast({
        title: 'Berhasil',
        description: 'Semua notifikasi yang sudah dibaca dihapus',
      });
    } catch (error) {
      console.error('Error deleting all read:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal menghapus notifikasi',
      });
    }
  };

  return (
    <DashboardLayout title="Notifikasi" description="Kelola notifikasi Anda">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Semua notifikasi sudah dibaca'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  {filter === 'all' ? 'Semua' : 'Belum Dibaca'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilter('all')}>
                  Semua Notifikasi
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('unread')}>
                  Belum Dibaca
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mark All as Read */}
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="gap-2"
              >
                <CheckCheck className="h-4 w-4" />
                Tandai Semua Dibaca
              </Button>
            )}

            {/* Delete All Read */}
            {notifications.some(n => n.isRead) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteAllRead}
                className="gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Hapus yang Dibaca
              </Button>
            )}
          </div>
        </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Tidak ada notifikasi</p>
              <p className="text-sm">
                {filter === 'unread' 
                  ? 'Semua notifikasi sudah dibaca' 
                  : 'Anda belum memiliki notifikasi'}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const Icon = notificationIcons[notification.type] || Info;
                const colorClass = notificationColors[notification.type] || notificationColors.info;

                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-muted/50 transition-colors ${
                      !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-950/10' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`p-2 rounded-full ${colorClass} shrink-0`}>
                        <Icon className="h-5 w-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-medium text-sm">{notification.title}</h3>
                          {!notification.isRead && (
                            <Badge variant="default" className="shrink-0 bg-blue-600">
                              Baru
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            {format(new Date(notification.createdAt), 'dd MMM yyyy, HH:mm', {
                              locale: idLocale,
                            })}
                          </span>
                          {notification.isRead && notification.readAt && (
                            <span className="text-green-600 dark:text-green-400">
                              ✓ Dibaca
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="h-8 w-8 p-0"
                            title="Tandai sudah dibaca"
                          >
                            <CheckCheck className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(notification.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  );
}
