'use client';

import { ColorfulStatsCard } from '@/components/admin/ColorfulStatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  Flag,
  UserCheck,
  ArrowRight,
  AlertCircle,
  Banknote,
  TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { useAdminDashboard } from '@/hooks/useAdminData';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    pending_review: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
    active: 'bg-green-500/10 text-green-600 border-green-200',
    rejected: 'bg-red-500/10 text-red-600 border-red-200',
    pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
    reviewed: 'bg-blue-500/10 text-blue-600 border-blue-200',
    action_taken: 'bg-purple-500/10 text-purple-600 border-purple-200',
    dismissed: 'bg-gray-500/10 text-gray-600 border-gray-200',
  };
  const labels: Record<string, string> = {
    pending_review: 'Pending Review',
    active: 'Active',
    rejected: 'Rejected',
    pending: 'Pending',
    reviewed: 'Reviewed',
    action_taken: 'Action Taken',
    dismissed: 'Dismissed',
  };
  return (
    <Badge variant="outline" className={styles[status] || ''}>
      {labels[status] || status}
    </Badge>
  );
};

export default function AdminHome() {
  const { stats, pendingListings, recentReports, loading, error } = useAdminDashboard();

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
          <h2 className="text-xl font-semibold">Error Loading Dashboard</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Kelola platform UMKM ID</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <ColorfulStatsCard
          title="Total Users"
          value={stats?.totalUsers?.toString() || '0'}
          icon={Users}
          colorClass="bg-gradient-to-br from-blue-500 to-blue-600"
          description={`${stats?.newUsersToday || 0} baru hari ini`}
          isLoading={loading}
        />
        <ColorfulStatsCard
          title="Total Listings"
          value={stats ? `${stats.activeListings}/${stats.totalListings}` : '0'}
          icon={Package}
          colorClass="bg-gradient-to-br from-purple-500 to-purple-600"
          description={`${stats?.pendingListings || 0} pending review`}
          isLoading={loading}
        />
        <ColorfulStatsCard
          title="Total Orders"
          value={stats?.totalOrders?.toString() || '0'}
          icon={ShoppingCart}
          colorClass="bg-gradient-to-br from-green-500 to-green-600"
          description={`${stats?.newOrdersToday || 0} baru hari ini`}
          isLoading={loading}
        />
        <ColorfulStatsCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue || 0)}
          icon={DollarSign}
          colorClass="bg-gradient-to-br from-orange-500 to-orange-600"
          description="Total completed orders"
          isLoading={loading}
        />
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium text-white/90 truncate">Pending Reports</p>
                <p className="text-lg font-bold text-white">{stats?.pendingReports || 0}</p>
              </div>
              <div className="h-9 w-9 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <Flag className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium text-white/90 truncate">Pending KYC</p>
                <p className="text-lg font-bold text-white">{stats?.pendingKyc || 0}</p>
              </div>
              <div className="h-9 w-9 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <UserCheck className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium text-white/90 truncate">Pending Withdrawals</p>
                <p className="text-lg font-bold text-white">{stats?.pendingWithdrawals || 0}</p>
              </div>
              <div className="h-9 w-9 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <Banknote className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500 to-pink-600 border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium text-white/90 truncate">New Listings Today</p>
                <p className="text-lg font-bold text-white">{stats?.newListingsToday || 0}</p>
              </div>
              <div className="h-9 w-9 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {stats && (stats.pendingListings > 0 || stats.pendingReports > 0 || stats.pendingKyc > 0) && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Perlu Tindakan
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {stats.pendingListings > 0 && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-yellow-500/50"
              >
                <Link href="/admin/listings?status=pending_review">
                  <Package className="mr-2 h-4 w-4" />
                  {stats.pendingListings} Listing Pending
                </Link>
              </Button>
            )}
            {stats.pendingReports > 0 && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-yellow-500/50"
              >
                <Link href="/admin/reports">
                  <Flag className="mr-2 h-4 w-4" />
                  {stats.pendingReports} Report Pending
                </Link>
              </Button>
            )}
            {stats.pendingKyc > 0 && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-yellow-500/50"
              >
                <Link href="/admin/kyc">
                  <UserCheck className="mr-2 h-4 w-4" />
                  {stats.pendingKyc} KYC Pending
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Content Grid */}
      <div className="grid gap-3 lg:grid-cols-2">
        {/* Pending Listings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Listings Pending Review</CardTitle>
              <CardDescription>Iklan yang perlu di-review</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/listings?status=pending_review">
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 animate-pulse bg-muted rounded" />
                ))}
              </div>
            ) : pendingListings.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Tidak ada listing pending</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {pendingListings.map((listing) => (
                  <div key={listing.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate max-w-[200px]">
                        {listing.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {listing.seller_name} • {format(new Date(listing.created_at), 'dd MMM yyyy', { locale: idLocale })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-medium">{formatCurrency(listing.price)}</span>
                      {getStatusBadge(listing.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Reports</CardTitle>
              <CardDescription>Laporan dari pengguna</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/reports">
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 animate-pulse bg-muted rounded" />
                ))}
              </div>
            ) : recentReports.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Flag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Tidak ada laporan pending</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {recentReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate max-w-[200px]">
                        {report.listing?.title || 'Unknown Listing'}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {report.reason.replace(/_/g, ' ')}
                      </p>
                    </div>
                    {getStatusBadge(report.status)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Quick Actions</CardTitle>
          <CardDescription>Aksi cepat untuk manajemen platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-4">
            <Button variant="outline" asChild className="justify-start">
              <Link href="/admin/listings?status=pending_review">
                <Package className="mr-2 h-4 w-4" />
                Review Listings
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link href="/admin/kyc">
                <UserCheck className="mr-2 h-4 w-4" />
                Verify KYC
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link href="/admin/withdrawals">
                <Banknote className="mr-2 h-4 w-4" />
                Process Withdrawals
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link href="/admin/analytics">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Analytics
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
