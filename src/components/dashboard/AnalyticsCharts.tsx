'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Eye, ShoppingCart } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface DailyStats {
  date: string;
  views: number;
  orders: number;
  revenue: number;
}

// Simple Bar Chart Component
function SimpleBarChart({ data, dataKey, color }: { data: DailyStats[]; dataKey: keyof DailyStats; color: string }) {
  const maxValue = Math.max(...data.map(d => d[dataKey] as number), 1);
  
  return (
    <div className="flex items-end gap-2 h-[250px] pt-4">
      {data.map((item, index) => {
        const value = item[dataKey] as number;
        const height = (value / maxValue) * 100;
        return (
          <div key={index} className="flex-1 flex flex-col items-center gap-1">
            <div 
              className="w-full rounded-t transition-all duration-300 hover:opacity-80"
              style={{ 
                height: `${Math.max(height, 2)}%`,
                backgroundColor: color 
              }}
              title={`${item.date}: ${value}`}
            />
            <span className="text-[10px] text-muted-foreground truncate w-full text-center">
              {item.date}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Simple Line Chart Component
function SimpleLineChart({ data, dataKey, color }: { data: DailyStats[]; dataKey: keyof DailyStats; color: string }) {
  const maxValue = Math.max(...data.map(d => d[dataKey] as number), 1);
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((item[dataKey] as number) / maxValue) * 100;
    return { x, y, value: item[dataKey] as number, date: item.date };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="relative h-[250px] pt-4">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(y => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="hsl(var(--border))" strokeWidth="0.5" />
        ))}
        {/* Line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        {/* Points */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} className="hover:r-4 transition-all" />
        ))}
      </svg>
      {/* X-axis labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-muted-foreground">
        {data.map((item, i) => (
          <span key={i} className="truncate">{item.date}</span>
        ))}
      </div>
    </div>
  );
}

export function AnalyticsCharts() {
  const [loading, setLoading] = useState(true);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [totals, setTotals] = useState({ views: 0, orders: 0, revenue: 0 });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/dashboard/analytics');
      
      if (response.ok) {
        const data = await response.json();
        setDailyStats(data.dailyStats);
        setTotals(data.totals);
      } else {
        // Fallback to empty data
        setDailyStats([]);
        setTotals({ views: 0, orders: 0, revenue: 0 });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Fallback to empty data
      setDailyStats([]);
      setTotals({ views: 0, orders: 0, revenue: 0 });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      notation: 'compact',
    }).format(value);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Analytics
            </CardTitle>
            <CardDescription>Performa iklan 7 hari terakhir</CardDescription>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <p className="text-muted-foreground">Views</p>
              <p className="font-bold text-lg">{totals.views}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Pesanan</p>
              <p className="font-bold text-lg">{totals.orders}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Pendapatan</p>
              <p className="font-bold text-lg">{formatCurrency(totals.revenue)}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="views" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="views" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Views
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Pesanan
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Pendapatan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="views">
            <SimpleBarChart data={dailyStats} dataKey="views" color="hsl(var(--primary))" />
          </TabsContent>

          <TabsContent value="orders">
            <SimpleBarChart data={dailyStats} dataKey="orders" color="hsl(var(--chart-2))" />
          </TabsContent>

          <TabsContent value="revenue">
            <SimpleLineChart data={dailyStats} dataKey="revenue" color="hsl(var(--chart-3))" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
