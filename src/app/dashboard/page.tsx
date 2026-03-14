'use client';

import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ColorfulStatsCard } from '@/components/admin/ColorfulStatsCard';
import { AnalyticsCharts } from '@/components/dashboard/AnalyticsCharts';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Wallet,
  Coins,
  Package,
  ShoppingCart,
  MessageCircle,
  ArrowRight,
  Eye,
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  Shield,
  Settings,
  Bell,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export default function DashboardHome() {
  const router = useRouter();
  const { stats, transactions, listings, orders, loading } = useDashboardData();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  // Check if user is admin
  useEffect(() => {
    async function checkAdminRole() {
      try {
        const response = await fetch('/api/auth/check-role');
        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.isAdmin || false);
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
      } finally {
        setCheckingRole(false);
      }
    }
    checkAdminRole();
  }, []);

  // Fetch recent notifications
  useEffect(() => {
    async function fetchNotifications() {
      try {
        setLoadingNotifications(true);
        const response = await fetch('/api/notifications?limit=5');
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoadingNotifications(false);
      }
    }
    fetchNotifications();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-500/10 text-green-600 border-green-200',
      pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
      paid: 'bg-blue-500/10 text-blue-600 border-blue-200',
      shipped: 'bg-purple-500/10 text-purple-600 border-purple-200',
      completed: 'bg-green-500/10 text-green-600 border-green-200',
      cancelled: 'bg-red-500/10 text-red-600 border-red-200',
    };
    const labels: Record<string, string> = {
      active: 'Aktif',
      pending: 'Pending',
      paid: 'Dibayar',
      shipped: 'Dikirim',
      completed: 'Selesai',
      cancelled: 'Batal',
    };
    return (
      <Badge variant="outline" className={styles[status] || ''}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, any> = {
      info: Info,
      success: CheckCircle2,
      warning: AlertTriangle,
      error: XCircle,
      order: ShoppingCart,
      payment: Coins,
      message: MessageCircle,
    };
    return icons[type] || Info;
  };

  const getNotificationColor = (type: string) => {
    const colors: Record<string, string> = {
      info: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20',
      success: 'text-green-600 bg-green-50 dark:bg-green-950/20',
      warning: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20',
      error: 'text-red-600 bg-red-50 dark:bg-red-950/20',
      order: 'text-purple-600 bg-purple-50 dark:bg-purple-950/20',
      payment: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20',
      message: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20',
    };
    return colors[type] || colors.info;
  };

  return (
    <DashboardLayout title="Dashboard" description="Selamat datang di dashboard Anda">
      {/* Stats Grid */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <ColorfulStatsCard
          title="Saldo Wallet"
          value={formatCurrency(stats.walletBalance)}
          icon={Wallet}
          colorClass="bg-gradient-to-br from-blue-500 to-blue-600"
          description="Indonesian Rupiah"
          isLoading={loading}
        />
        <ColorfulStatsCard
          title="Kredit"
          value={stats.creditsBalance.toString()}
          icon={Coins}
          colorClass="bg-gradient-to-br from-purple-500 to-purple-600"
          description="Untuk boost & fitur premium"
          isLoading={loading}
        />
        <ColorfulStatsCard
          title="Iklan Aktif"
          value={`${stats.activeListings}/${stats.totalListings}`}
          icon={Package}
          colorClass="bg-gradient-to-br from-green-500 to-green-600"
          description="Iklan yang sedang tayang"
          isLoading={loading}
        />
        <ColorfulStatsCard
          title="Pesanan"
          value={stats.totalOrders.toString()}
          icon={ShoppingCart}
          colorClass="bg-gradient-to-br from-orange-500 to-orange-600"
          description={`${stats.pendingOrders} menunggu proses`}
          isLoading={loading}
        />
      </div>

      {/* Admin Access Card */}
      {isAdmin && !checkingRole && (
        <Card className="border-2 border-primary/50 bg-gradient-to-br from-primary/5 to-purple-500/5 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-xl">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Admin Panel</h3>
                  <p className="text-sm text-muted-foreground">
                    Anda memiliki akses administrator. Kelola platform dari admin panel.
                  </p>
                </div>
              </div>
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg"
                onClick={() => router.push('/admin')}
              >
                <Settings className="mr-2 h-5 w-5" />
                Buka Admin Panel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="border-2 border-dashed">
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Button
              variant="outline"
              className="h-auto py-6 justify-start gap-4 hover:bg-primary/5 hover:border-primary transition-all"
              onClick={() => router.push('/listing/create')}
            >
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                <Plus className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-base">Jual Barang Baru</div>
                <div className="text-sm text-muted-foreground">Jual produk atau jasa</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-6 justify-start gap-4 hover:bg-primary/5 hover:border-primary transition-all"
              onClick={() => router.push('/credits')}
            >
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
                <Coins className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-base">Beli Kredit</div>
                <div className="text-sm text-muted-foreground">Untuk boost iklan</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-6 justify-start gap-4 hover:bg-primary/5 hover:border-primary transition-all"
              onClick={() => router.push('/dashboard/messages')}
            >
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg relative">
                <MessageCircle className="h-6 w-6 text-white" />
                {stats.unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-[10px] flex items-center justify-center text-destructive-foreground font-bold">
                    {stats.unreadMessages > 9 ? '9+' : stats.unreadMessages}
                  </span>
                )}
              </div>
              <div className="text-left">
                <div className="font-semibold text-base">Pesan</div>
                <div className="text-sm text-muted-foreground">
                  {stats.unreadMessages > 0 ? `${stats.unreadMessages} belum dibaca` : 'Lihat semua pesan'}
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Card */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifikasi
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} Baru
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Pemberitahuan terbaru untuk Anda</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/notifications')}>
            Lihat Semua
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {loadingNotifications ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 animate-pulse bg-muted rounded-lg" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="h-16 w-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Bell className="h-8 w-8 opacity-50" />
              </div>
              <p className="font-medium">Tidak ada notifikasi</p>
              <p className="text-sm mt-1">Notifikasi Anda akan muncul di sini</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                const colorClass = getNotificationColor(notification.type);

                return (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition-all ${
                      !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-950/10 border-blue-200 dark:border-blue-900' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => router.push('/dashboard/notifications')}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${colorClass} shrink-0`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          {!notification.isRead && (
                            <Badge variant="default" className="shrink-0 bg-blue-600 text-xs">
                              Baru
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(notification.createdAt), 'dd MMM yyyy, HH:mm', { locale: idLocale })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analytics Charts */}
      <div>
        <AnalyticsCharts />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Transactions */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-lg font-semibold">Transaksi Terakhir</CardTitle>
              <CardDescription>Riwayat wallet Anda</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/wallet')}>
              Lihat Semua
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="h-16 w-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                  <Wallet className="h-8 w-8 opacity-50" />
                </div>
                <p className="font-medium">Belum ada transaksi</p>
                <p className="text-sm mt-1">Transaksi Anda akan muncul di sini</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        tx.type === 'credit' ? 'bg-green-500/10' : 'bg-red-500/10'
                      }`}>
                        {tx.type === 'credit' ? (
                          <ArrowDownCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <ArrowUpCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium truncate max-w-[180px]">
                          {tx.description || tx.type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(tx.created_at), 'dd MMM yyyy', { locale: idLocale })}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-lg font-semibold">Pesanan Terakhir</CardTitle>
              <CardDescription>Aktivitas jual beli</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/orders')}>
              Lihat Semua
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="h-16 w-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                  <ShoppingCart className="h-8 w-8 opacity-50" />
                </div>
                <p className="font-medium">Belum ada pesanan</p>
                <p className="text-sm mt-1">Pesanan Anda akan muncul di sini</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {order.listing?.title || 'Produk'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(order.created_at), 'dd MMM yyyy', { locale: idLocale })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <span className="text-sm font-bold whitespace-nowrap">
                        {formatCurrency(order.amount)}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Listings */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-lg font-semibold">Iklan Saya</CardTitle>
            <CardDescription>Kelola iklan Anda</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/listings')}>
            Lihat Semua
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {listings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="h-20 w-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Package className="h-10 w-10 opacity-50" />
              </div>
              <p className="font-medium text-lg mb-2">Anda belum memiliki iklan</p>
              <p className="text-sm mb-6">Mulai jual produk atau jasa Anda sekarang</p>
              <Button onClick={() => router.push('/listing/create')}>
                <Plus className="mr-2 h-4 w-4" />
                Buat Iklan Pertama
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {listings.slice(0, 8).map((listing) => {
                const primaryImage = listing.listing_images?.find(img => img.is_primary)?.image_url
                  || listing.listing_images?.[0]?.image_url;

                return (
                  <div
                    key={listing.id}
                    className="group flex flex-col gap-3 p-3 border rounded-xl hover:shadow-md hover:border-primary/50 cursor-pointer transition-all"
                    onClick={() => router.push(`/listing/${listing.id}`)}
                  >
                    <div className="w-full aspect-square bg-muted rounded-lg overflow-hidden">
                      {primaryImage ? (
                        <img
                          src={primaryImage}
                          alt={listing.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold line-clamp-2 mb-1">{listing.title}</p>
                      <p className="text-base font-bold text-primary mb-2">
                        {formatCurrency(listing.price)}
                      </p>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(listing.status)}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {listing.view_count || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
