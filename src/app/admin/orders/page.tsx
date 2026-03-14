'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShoppingCart, Package, CheckCircle, Clock, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { useMemo } from 'react';

const mockOrders = [
  { id: 'ORD-001', buyer: { name: 'John Doe', email: 'john@example.com' }, seller: { name: 'Jane Smith', email: 'jane@example.com' }, listing: { title: 'iPhone 15 Pro Max' }, amount: 21500000, status: 'paid', created_at: new Date().toISOString() },
  { id: 'ORD-002', buyer: { name: 'Budi Santoso', email: 'budi@example.com' }, seller: { name: 'Dewi Lestari', email: 'dewi@example.com' }, listing: { title: 'MacBook Pro M3' }, amount: 35000000, status: 'shipped', created_at: new Date(Date.now() - 86400000).toISOString() },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

const getStatusBadge = (status: string) => {
  const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    pending: { label: 'Pending', variant: 'outline' },
    paid: { label: 'Dibayar', variant: 'default' },
    shipped: { label: 'Dikirim', variant: 'secondary' },
    completed: { label: 'Selesai', variant: 'default' },
    cancelled: { label: 'Dibatalkan', variant: 'destructive' },
  };
  const { label, variant } = config[status] || { label: status, variant: 'outline' };
  return <Badge variant={variant}>{label}</Badge>;
};

export default function AdminOrders() {
  // Calculate stats
  const stats = useMemo(() => {
    const totalOrders = mockOrders.length;
    const pendingCount = mockOrders.filter(o => o.status === 'pending').length;
    const completedCount = mockOrders.filter(o => o.status === 'completed').length;
    const cancelledCount = mockOrders.filter(o => o.status === 'cancelled').length;
    
    return {
      totalOrders,
      pendingCount,
      completedCount,
      cancelledCount,
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Manajemen Pesanan</h1>
        <p className="text-muted-foreground">Kelola semua pesanan platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders - Blue */}
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
              Total Orders
            </CardTitle>
            <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">Semua pesanan</p>
          </CardContent>
        </Card>

        {/* Pending - Yellow */}
        <Card className="border-l-4 border-l-yellow-500 bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
              Pending
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{stats.pendingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Menunggu pembayaran</p>
          </CardContent>
        </Card>

        {/* Completed - Green */}
        <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">
              Completed
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.completedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Pesanan selesai</p>
          </CardContent>
        </Card>

        {/* Cancelled - Red */}
        <Card className="border-l-4 border-l-red-500 bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400">
              Cancelled
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.cancelledCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Pesanan dibatalkan</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Daftar Pesanan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Pesanan</TableHead>
                <TableHead>Pembeli</TableHead>
                <TableHead>Penjual</TableHead>
                <TableHead>Produk</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>
                    <div>
                      <p>{order.buyer.name}</p>
                      <p className="text-sm text-muted-foreground">{order.buyer.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{order.seller.name}</p>
                      <p className="text-sm text-muted-foreground">{order.seller.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{order.listing.title}</TableCell>
                  <TableCell>{formatCurrency(order.amount)}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(order.created_at), 'dd MMM yyyy', { locale: idLocale })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
