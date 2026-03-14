'use client';

import { useEffect, useState } from 'react';
import { ColorfulStatsCard } from '@/components/admin/ColorfulStatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Package, ShoppingCart, DollarSign, TrendingUp, Eye, Loader2 } from 'lucide-react';

// Simple chart component
function SimpleBarChart({ data, title }: { data: { label: string; value: number }[]; title: string }) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2 h-[200px]">
          {data.map((item, index) => {
            const height = (item.value / maxValue) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className="w-full bg-primary rounded-t transition-all duration-300 hover:opacity-80"
                  style={{ height: `${Math.max(height, 2)}%` }}
                  title={`${item.label}: ${item.value}`}
                />
                <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

interface AnalyticsData {
  stats: {
    totalUsers: number;
    totalListings: number;
    activeListings: number;
    totalOrders: number;
    completedOrders: number;
    totalRevenue: number;
    totalViews: number;
    conversionRate: number;
  };
  charts: {
    dailyViews: { label: string; value: number }[];
    dailyOrders: { label: string; value: number }[];
  };
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch('/api/admin/analytics');
        
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      minimumFractionDigits: 0,
      notation: 'compact'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Memuat data analitik...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <span className="text-2xl">⚠️</span>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Gagal Memuat Data</h3>
            <p className="text-muted-foreground">{error || 'Terjadi kesalahan'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Analitik</h1>
        <p className="text-muted-foreground">Statistik dan performa platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <ColorfulStatsCard 
          title="Total Users" 
          value={data.stats.totalUsers.toLocaleString()} 
          icon={Users}
          colorClass="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <ColorfulStatsCard 
          title="Total Listings" 
          value={data.stats.totalListings.toLocaleString()} 
          icon={Package}
          colorClass="bg-gradient-to-br from-purple-500 to-purple-600"
          description={`${data.stats.activeListings} aktif`}
        />
        <ColorfulStatsCard 
          title="Total Orders" 
          value={data.stats.totalOrders.toLocaleString()} 
          icon={ShoppingCart}
          colorClass="bg-gradient-to-br from-green-500 to-green-600"
          description={`${data.stats.completedOrders} selesai`}
        />
        <ColorfulStatsCard 
          title="Total Revenue" 
          value={formatCurrency(data.stats.totalRevenue)} 
          icon={DollarSign}
          colorClass="bg-gradient-to-br from-orange-500 to-orange-600"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <ColorfulStatsCard 
          title="Total Views" 
          value={data.stats.totalViews.toLocaleString()} 
          icon={Eye}
          colorClass="bg-gradient-to-br from-yellow-500 to-yellow-600"
        />
        <ColorfulStatsCard 
          title="Conversion Rate" 
          value={`${data.stats.conversionRate}%`} 
          icon={TrendingUp}
          colorClass="bg-gradient-to-br from-cyan-500 to-cyan-600"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-3 lg:grid-cols-2">
        <SimpleBarChart data={data.charts.dailyViews} title="Listing Dibuat (7 Hari Terakhir)" />
        <SimpleBarChart data={data.charts.dailyOrders} title="Pesanan (7 Hari Terakhir)" />
      </div>
    </div>
  );
}
