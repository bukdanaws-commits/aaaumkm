'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tag, Plus, Edit, Trash2, Loader2, Ticket, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface Coupon {
  id: string;
  code: string;
  creditsAmount: number;
  maxUses: number;
  usedCount: number;
  minPurchase: number | null;
  expiresAt: Date | null;
  isActive: boolean;
  createdAt: Date;
}

const getStatusBadge = (coupon: Coupon) => {
  const now = new Date();
  const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < now;
  const isMaxedOut = coupon.usedCount >= coupon.maxUses;
  
  if (!coupon.isActive) {
    return <Badge variant="destructive">Nonaktif</Badge>;
  }
  if (isExpired || isMaxedOut) {
    return <Badge variant="secondary">Expired</Badge>;
  }
  return <Badge variant="default">Aktif</Badge>;
};

export default function AdminCoupons() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialog, setCreateDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    code: '',
    creditsAmount: '',
    maxUses: '',
    minPurchase: '',
    expiresAt: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/coupons');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setCoupons(data.coupons || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal memuat data kupon',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    if (!formData.code || !formData.creditsAmount || !formData.maxUses) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Kode, kredit, dan max uses harus diisi',
      });
      return;
    }

    try {
      setProcessing(true);
      const response = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.code.toUpperCase(),
          creditsAmount: parseInt(formData.creditsAmount),
          maxUses: parseInt(formData.maxUses),
          minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : null,
          expiresAt: formData.expiresAt || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to create');

      toast({
        title: 'Berhasil',
        description: 'Kupon berhasil dibuat',
      });
      setCreateDialog(false);
      setFormData({ code: '', creditsAmount: '', maxUses: '', minPurchase: '', expiresAt: '' });
      fetchData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal membuat kupon',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;

    try {
      setProcessing(true);
      const response = await fetch(`/api/admin/coupons/${deleteDialog}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      toast({
        title: 'Berhasil',
        description: 'Kupon berhasil dihapus',
      });
      setDeleteDialog(null);
      fetchData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal menghapus kupon',
      });
    } finally {
      setProcessing(false);
    }
  };

  const stats = useMemo(() => {
    const now = new Date();
    const totalCoupons = coupons.length;
    const activeCount = coupons.filter((c) => {
      const isExpired = c.expiresAt && new Date(c.expiresAt) < now;
      const isMaxedOut = c.usedCount >= c.maxUses;
      return c.isActive && !isExpired && !isMaxedOut;
    }).length;
    const expiredCount = coupons.filter((c) => {
      const isExpired = c.expiresAt && new Date(c.expiresAt) < now;
      const isMaxedOut = c.usedCount >= c.maxUses;
      return isExpired || isMaxedOut;
    }).length;
    const totalUses = coupons.reduce((sum, c) => sum + c.usedCount, 0);

    return {
      totalCoupons,
      activeCount,
      expiredCount,
      totalUses,
    };
  }, [coupons]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Kupon</h1>
        <p className="text-muted-foreground">Kelola kupon kredit</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
              Total Kupon
            </CardTitle>
            <Ticket className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats.totalCoupons}</div>
            <p className="text-xs text-muted-foreground mt-1">Semua kupon</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">
              Aktif
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.activeCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Kupon aktif</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-500 bg-gradient-to-br from-gray-50 to-white dark:from-gray-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-400">
              Expired
            </CardTitle>
            <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-700 dark:text-gray-400">{stats.expiredCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Kupon expired</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-400">
              Total Penggunaan
            </CardTitle>
            <Tag className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">{stats.totalUses}</div>
            <p className="text-xs text-muted-foreground mt-1">Kali digunakan</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Daftar Kupon
          </CardTitle>
          <Button
            size="sm"
            onClick={() => setCreateDialog(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Buat Kupon
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Tag className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Belum ada kupon</p>
              <p className="text-sm mt-1">Buat kupon pertama Anda</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Kredit</TableHead>
                  <TableHead>Penggunaan</TableHead>
                  <TableHead>Expired</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
                    <TableCell>{coupon.creditsAmount} kredit</TableCell>
                    <TableCell>{coupon.usedCount}/{coupon.maxUses}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {coupon.expiresAt
                        ? format(new Date(coupon.expiresAt), 'dd MMM yyyy', { locale: idLocale })
                        : 'Tidak ada'}
                    </TableCell>
                    <TableCell>{getStatusBadge(coupon)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive/90"
                          onClick={() => setDeleteDialog(coupon.id)}
                          disabled={processing}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={createDialog} onOpenChange={(open) => !open && setCreateDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat Kupon Baru</DialogTitle>
            <DialogDescription>
              Buat kupon kredit untuk pengguna.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="code">Kode Kupon *</Label>
              <Input
                id="code"
                placeholder="PROMO2025"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              />
            </div>
            <div>
              <Label htmlFor="creditsAmount">Jumlah Kredit *</Label>
              <Input
                id="creditsAmount"
                type="number"
                placeholder="50"
                value={formData.creditsAmount}
                onChange={(e) => setFormData({ ...formData, creditsAmount: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="maxUses">Max Penggunaan *</Label>
              <Input
                id="maxUses"
                type="number"
                placeholder="100"
                value={formData.maxUses}
                onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="minPurchase">Min. Pembelian (Opsional)</Label>
              <Input
                id="minPurchase"
                type="number"
                placeholder="100000"
                value={formData.minPurchase}
                onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="expiresAt">Tanggal Expired (Opsional)</Label>
              <Input
                id="expiresAt"
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)} disabled={processing}>
              Batal
            </Button>
            <Button
              onClick={handleCreate}
              disabled={processing}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Membuat...
                </>
              ) : (
                'Buat Kupon'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteDialog} onOpenChange={(open) => !open && setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Kupon</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus kupon ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)} disabled={processing}>
              Batal
            </Button>
            <Button onClick={handleDelete} disabled={processing} variant="destructive">
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                'Hapus'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
