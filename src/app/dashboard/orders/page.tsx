'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Package, Truck, CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

// Mock data
const mockBuyingOrders = [
  { id: '1', listing: { title: 'iPhone 15 Pro Max' }, seller: { name: 'Toko Jaya', email: 'jaya@example.com' }, amount: 21500000, status: 'paid', created_at: new Date().toISOString(), tracking_number: null },
  { id: '2', listing: { title: 'MacBook Pro M3' }, seller: { name: 'Tech Store', email: 'tech@example.com' }, amount: 35000000, status: 'shipped', created_at: new Date(Date.now() - 86400000).toISOString(), tracking_number: 'JNE1234567890' },
  { id: '3', listing: { title: 'Samsung Galaxy S24' }, seller: { name: 'Gadget Shop', email: 'gadget@example.com' }, amount: 19000000, status: 'delivered', created_at: new Date(Date.now() - 172800000).toISOString(), tracking_number: 'SICEPAT9876543210' },
];

const mockSellingOrders = [
  { id: '4', listing: { title: 'Nike Air Jordan 1' }, buyer: { name: 'Budi Santoso', email: 'budi@example.com' }, amount: 3500000, status: 'pending', created_at: new Date().toISOString(), tracking_number: null },
  { id: '5', listing: { title: 'Sony A7 IV Camera' }, buyer: { name: 'Dewi Lestari', email: 'dewi@example.com' }, amount: 42000000, status: 'paid', created_at: new Date(Date.now() - 86400000).toISOString(), tracking_number: null },
  { id: '6', listing: { title: 'iPad Pro M2' }, buyer: { name: 'Andi Wijaya', email: 'andi@example.com' }, amount: 18500000, status: 'completed', created_at: new Date(Date.now() - 172800000).toISOString(), tracking_number: 'JNT1122334455' },
];

export default function DashboardOrders() {
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});

  const buyingOrders = mockBuyingOrders;
  const sellingOrders = mockSellingOrders;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'Menunggu Pembayaran', variant: 'outline' },
      paid: { label: 'Dibayar', variant: 'default' },
      shipped: { label: 'Dikirim', variant: 'secondary' },
      delivered: { label: 'Diterima', variant: 'default' },
      completed: { label: 'Selesai', variant: 'default' },
      cancelled: { label: 'Dibatalkan', variant: 'destructive' },
    };
    const { label, variant } = config[status] || { label: status, variant: 'outline' };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5 text-muted-foreground" />;
      case 'paid': return <Package className="h-5 w-5 text-blue-500" />;
      case 'shipped': return <Truck className="h-5 w-5 text-purple-500" />;
      case 'delivered':
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  const handleShip = async (orderId: string) => {
    const trackingNumber = trackingInputs[orderId];
    if (trackingNumber) {
      setIsUpdating(true);
      // Simulate API call
      setTimeout(() => {
        setIsUpdating(false);
      }, 1000);
    }
  };

  const handlePayOrder = async (orderId: string) => {
    setPaymentLoading(true);
    // Simulate payment
    setTimeout(() => {
      setPaymentLoading(false);
    }, 2000);
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    setIsUpdating(true);
    // Simulate API call
    setTimeout(() => {
      setIsUpdating(false);
    }, 1000);
  };

  const renderOrderCard = (order: any, type: 'buying' | 'selling') => (
    <Card key={order.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
            {getStatusIcon(order.status)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-medium truncate">{order.listing?.title || 'Produk'}</h3>
                <p className="text-lg font-bold text-primary">{formatCurrency(order.amount)}</p>
              </div>
              {getStatusBadge(order.status)}
            </div>

            <div className="mt-2 text-sm text-muted-foreground">
              <p>
                {type === 'buying' ? 'Penjual' : 'Pembeli'}:{' '}
                {type === 'buying' ? order.seller?.name || order.seller?.email : order.buyer?.name || order.buyer?.email}
              </p>
              <p>{format(new Date(order.created_at), 'dd MMM yyyy HH:mm', { locale: idLocale })}</p>
              {order.tracking_number && <p>Resi: {order.tracking_number}</p>}
            </div>

            <div className="flex gap-2 mt-3 flex-wrap">
              {type === 'buying' && order.status === 'pending' && (
                <Button
                  size="sm"
                  onClick={() => handlePayOrder(order.id)}
                  disabled={paymentLoading}
                >
                  {paymentLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  Bayar Sekarang
                </Button>
              )}
              {type === 'selling' && order.status === 'paid' && (
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Nomor Resi"
                    className="w-40"
                    value={trackingInputs[order.id] || ''}
                    onChange={(e) => setTrackingInputs({ ...trackingInputs, [order.id]: e.target.value })}
                  />
                  <Button
                    size="sm"
                    onClick={() => handleShip(order.id)}
                    disabled={isUpdating || !trackingInputs[order.id]}
                  >
                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Kirim'}
                  </Button>
                </div>
              )}
              {type === 'buying' && order.status === 'shipped' && (
                <Button
                  size="sm"
                  onClick={() => handleUpdateStatus(order.id, 'delivered')}
                  disabled={isUpdating}
                >
                  Konfirmasi Terima
                </Button>
              )}
              {type === 'buying' && order.status === 'delivered' && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleUpdateStatus(order.id, 'completed')}
                  disabled={isUpdating}
                >
                  Selesaikan Pesanan
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout title="Pesanan" description="Kelola pesanan jual beli Anda">
      <Tabs defaultValue="buying">
        <TabsList>
          <TabsTrigger value="buying">Membeli ({buyingOrders.length})</TabsTrigger>
          <TabsTrigger value="selling">Menjual ({sellingOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="buying" className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : buyingOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Belum ada pesanan pembelian</p>
              </CardContent>
            </Card>
          ) : (
            buyingOrders.map((order) => renderOrderCard(order, 'buying'))
          )}
        </TabsContent>

        <TabsContent value="selling" className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : sellingOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Belum ada pesanan penjualan</p>
              </CardContent>
            </Card>
          ) : (
            sellingOrders.map((order) => renderOrderCard(order, 'selling'))
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
