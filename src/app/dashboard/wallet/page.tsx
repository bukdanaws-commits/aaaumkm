'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useCredits } from '@/hooks/useCredits';
import { Wallet, Plus, ArrowUpCircle, ArrowDownCircle, RefreshCw, Coins, Ticket, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface WalletData {
  id: string;
  balance: number;
  status: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  reference_type: string | null;
  created_at: string;
}

export default function DashboardWallet() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { credits, refetchCredits } = useCredits();

  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTopupLoading, setIsTopupLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await fetch('/api/wallet');
      if (response.ok) {
        const data = await response.json();
        if (data.wallet) setWallet(data.wallet);
        if (data.transactions) setTransactions(data.transactions);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTopup = async () => {
    if (!wallet) {
      toast({ variant: 'destructive', title: 'Error', description: 'Wallet tidak ditemukan' });
      return;
    }
    setIsTopupLoading(true);
    try {
      // In a real implementation, this would call a payment gateway
      // For now, we simulate the topup process
      const response = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 100000, wallet_id: wallet.id }),
      });

      if (!response.ok) {
        throw new Error('Topup request failed');
      }

      const data = await response.json();

      // If snap_token exists (for Midtrans integration)
      if (data?.snap_token && typeof window !== 'undefined') {
        const windowWithSnap = window as typeof window & {
          snap?: {
            pay: (token: string, callbacks: {
              onSuccess: () => void;
              onPending: () => void;
              onError: () => void;
            }) => void;
          };
        };
        if (windowWithSnap.snap) {
          windowWithSnap.snap.pay(data.snap_token, {
            onSuccess: () => {
              toast({ title: 'Topup Berhasil' });
              fetchData();
            },
            onPending: () => {
              toast({ title: 'Menunggu Pembayaran' });
            },
            onError: () => {
              toast({ variant: 'destructive', title: 'Pembayaran Gagal' });
            },
          });
        } else {
          // Fallback if snap is not available
          toast({ title: 'Topup Berhasil', description: 'Saldo telah ditambahkan' });
          fetchData();
        }
      } else {
        toast({ title: 'Topup Berhasil', description: 'Saldo telah ditambahkan' });
        fetchData();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan';
      toast({ variant: 'destructive', title: 'Error', description: errorMessage });
    } finally {
      setIsTopupLoading(false);
    }
  };

  const handleRedeemCoupon = async () => {
    if (!couponCode.trim() || !user) return;
    setRedeemLoading(true);
    try {
      const response = await fetch('/api/wallet/redeem-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim().toUpperCase() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast({ variant: 'destructive', title: 'Gagal', description: data.message || 'Kupon tidak valid' });
      } else {
        toast({ title: '🎉 Kupon Berhasil!', description: data.message });
        setCouponCode('');
        refetchCredits();
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan';
      toast({ variant: 'destructive', title: 'Error', description: errorMessage });
    } finally {
      setRedeemLoading(false);
    }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(amount);

  return (
    <DashboardLayout title="Wallet" description="Kelola saldo dan transaksi Anda">
      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Saldo Wallet</CardTitle>
            </div>
            <Badge variant={wallet?.status === 'active' ? 'default' : 'secondary'}>
              {wallet?.status || 'N/A'}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">
                  {loading ? '...' : formatCurrency(Number(wallet?.balance || 0))}
                </p>
                <p className="text-sm text-muted-foreground">Indonesian Rupiah</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleTopup} disabled={isTopupLoading}>
                  <Plus className="mr-2 h-4 w-4" />
                  {isTopupLoading ? 'Memproses...' : 'Topup'}
                </Button>
                <Button variant="outline" size="icon" onClick={fetchData}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Saldo Kredit</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{loading ? '...' : (credits?.balance || 0)}</p>
                <p className="text-sm text-muted-foreground">Untuk boost & fitur premium</p>
              </div>
              <Button variant="outline" onClick={() => window.location.href = '/credits'}>
                <Plus className="mr-2 h-4 w-4" />
                Beli Kredit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Redeem Coupon */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Ticket className="h-5 w-5 text-primary" />
            Tukar Kupon Kredit
          </CardTitle>
          <CardDescription>Punya kode kupon? Masukkan di sini untuk mendapatkan kredit gratis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 max-w-md">
            <Input
              placeholder="Contoh: PROMO2025 atau ADFFDS2311_4"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleRedeemCoupon()}
              className="font-mono uppercase"
              maxLength={30}
            />
            <Button
              onClick={handleRedeemCoupon}
              disabled={redeemLoading || !couponCode.trim()}
              className="shrink-0"
            >
              {redeemLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Ticket className="mr-2 h-4 w-4" />
                  Tukar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Riwayat Transaksi</CardTitle>
          <CardDescription>Semua transaksi wallet Anda</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Belum ada transaksi</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(tx.created_at), 'dd MMM yyyy HH:mm', { locale: idLocale })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {tx.type === 'credit' ? (
                          <ArrowDownCircle className="h-4 w-4 text-primary" />
                        ) : (
                          <ArrowUpCircle className="h-4 w-4 text-destructive" />
                        )}
                        <Badge variant={tx.type === 'credit' ? 'default' : 'secondary'}>
                          {tx.type === 'credit' ? 'Masuk' : 'Keluar'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {tx.description || tx.reference_type || '-'}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${
                      tx.type === 'credit' ? 'text-primary' : 'text-destructive'
                    }`}>
                      {tx.type === 'credit' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
