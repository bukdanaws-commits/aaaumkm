'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, TrendingUp, TrendingDown, Activity, Coins, Loader2, Edit, Plus, Star } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface CreditTransaction {
  id: string;
  userId: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string | null;
  referenceType: string | null;
  referenceId: string | null;
  createdAt: Date;
  profile: {
    name: string | null;
    email: string;
  };
}

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  bonusCredits: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const getTypeBadge = (type: string) => {
  const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
    purchase: { label: 'Pembelian', variant: 'default' },
    use: { label: 'Penggunaan', variant: 'destructive' },
    bonus: { label: 'Bonus', variant: 'secondary' },
    refund: { label: 'Refund', variant: 'default' },
    expire: { label: 'Kadaluarsa', variant: 'destructive' },
  };
  const { label, variant } = config[type] || { label: type, variant: 'secondary' };
  return <Badge variant={variant}>{label}</Badge>;
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

export default function AdminCredits() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editPkg, setEditPkg] = useState<CreditPackage | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [form, setForm] = useState({
    name: '',
    credits: 0,
    price: 0,
    bonusCredits: 0,
    isActive: true,
    sortOrder: 0,
  });

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/admin/credits');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setTransactions(data.transactions || []);
      setTotalRevenue(data.totalRevenue || 0);
    } catch (error) {
      console.error('Error fetching credit transactions:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal memuat data transaksi kredit',
      });
    }
  };

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/admin/credit-packages');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setPackages(data.packages || []);
    } catch (error) {
      console.error('Error fetching credit packages:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal memuat data paket kredit',
      });
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchTransactions(), fetchPackages()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openEdit = (pkg: CreditPackage) => {
    setEditPkg(pkg);
    setForm({
      name: pkg.name,
      credits: pkg.credits,
      price: pkg.price,
      bonusCredits: pkg.bonusCredits || 0,
      isActive: pkg.isActive !== false,
      sortOrder: pkg.sortOrder || 0,
    });
  };

  const openCreate = () => {
    setShowCreateDialog(true);
    setForm({
      name: '',
      credits: 0,
      price: 0,
      bonusCredits: 0,
      isActive: true,
      sortOrder: packages.length,
    });
  };

  const saveEdit = async () => {
    if (!editPkg) return;

    try {
      const response = await fetch('/api/admin/credit-packages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editPkg.id,
          ...form,
        }),
      });

      if (!response.ok) throw new Error('Failed to update');

      toast({ title: 'Berhasil', description: 'Paket kredit diperbarui' });
      setEditPkg(null);
      fetchPackages();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Gagal menyimpan' });
    }
  };

  const createPackage = async () => {
    try {
      const response = await fetch('/api/admin/credit-packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error('Failed to create');

      toast({ title: 'Berhasil', description: 'Paket kredit dibuat' });
      setShowCreateDialog(false);
      fetchPackages();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Gagal membuat paket' });
    }
  };

  const stats = useMemo(() => {
    const totalTransactions = transactions.length;
    const totalCreditsIn = transactions.filter(tx => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0);
    const totalCreditsOut = Math.abs(transactions.filter(tx => tx.amount < 0).reduce((sum, tx) => sum + tx.amount, 0));
    const netCredits = totalCreditsIn - totalCreditsOut;

    return {
      totalTransactions,
      totalCreditsIn,
      totalCreditsOut,
      netCredits,
      totalRevenue,
    };
  }, [transactions, totalRevenue]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manajemen Kredit</h1>
        <p className="text-muted-foreground">Kelola paket kredit dan transaksi</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
              Total Transaksi
            </CardTitle>
            <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground mt-1">Semua transaksi</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">
              Kredit Masuk
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">+{stats.totalCreditsIn}</div>
            <p className="text-xs text-muted-foreground mt-1">Total kredit masuk</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400">
              Kredit Keluar
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700 dark:text-red-400">-{stats.totalCreditsOut}</div>
            <p className="text-xs text-muted-foreground mt-1">Total kredit keluar</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-400">
              Net Kredit
            </CardTitle>
            <Coins className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.netCredits >= 0 ? 'text-purple-700 dark:text-purple-400' : 'text-red-700 dark:text-red-400'}`}>
              {stats.netCredits >= 0 ? '+' : ''}{stats.netCredits}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Selisih kredit</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-400">
              Total Pendapatan
            </CardTitle>
            <CreditCard className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Dari penjualan kredit</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="packages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="packages">Paket Kredit</TabsTrigger>
          <TabsTrigger value="transactions">Transaksi</TabsTrigger>
        </TabsList>

        <TabsContent value="packages" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                Paket Kredit ({packages.length})
              </CardTitle>
              <Button onClick={openCreate} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Paket
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : packages.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Coins className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Belum ada paket kredit</p>
                  <p className="text-sm mt-1">Klik tombol "Tambah Paket" untuk membuat paket baru</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Kredit</TableHead>
                      <TableHead>Bonus</TableHead>
                      <TableHead>Harga</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Urutan</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {packages.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>{p.credits}</TableCell>
                        <TableCell>
                          {p.bonusCredits > 0 && (
                            <Badge variant="secondary" className="bg-green-500/10 text-green-700 border-green-200">
                              +{p.bonusCredits}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatCurrency(p.price)}</TableCell>
                        <TableCell>
                          <Badge variant={p.isActive ? 'default' : 'secondary'}>
                            {p.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>{p.sortOrder}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => openEdit(p)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Transaksi Kredit
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Belum ada transaksi kredit</p>
                  <p className="text-sm mt-1">Transaksi kredit akan muncul di sini</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pengguna</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Jumlah</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead>Tanggal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{tx.profile.name || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">{tx.profile.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(tx.type)}</TableCell>
                        <TableCell className={`font-medium ${tx.amount > 0 ? 'text-green-600' : 'text-destructive'}`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount}
                        </TableCell>
                        <TableCell>{tx.description || '-'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(tx.createdAt), 'dd MMM yyyy HH:mm', { locale: idLocale })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Package Dialog */}
      <Dialog open={!!editPkg} onOpenChange={() => setEditPkg(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Paket Kredit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nama Paket</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Kredit</Label>
                <Input type="number" value={form.credits} onChange={e => setForm({ ...form, credits: +e.target.value })} />
              </div>
              <div>
                <Label>Bonus Kredit</Label>
                <Input type="number" value={form.bonusCredits} onChange={e => setForm({ ...form, bonusCredits: +e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Harga (IDR)</Label>
                <Input type="number" value={form.price} onChange={e => setForm({ ...form, price: +e.target.value })} />
              </div>
              <div>
                <Label>Urutan</Label>
                <Input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: +e.target.value })} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Status Active</Label>
              <Switch checked={form.isActive} onCheckedChange={v => setForm({ ...form, isActive: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPkg(null)}>Batal</Button>
            <Button onClick={saveEdit} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Package Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Paket Kredit Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nama Paket</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Paket Starter" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Kredit</Label>
                <Input type="number" value={form.credits} onChange={e => setForm({ ...form, credits: +e.target.value })} placeholder="50" />
              </div>
              <div>
                <Label>Bonus Kredit</Label>
                <Input type="number" value={form.bonusCredits} onChange={e => setForm({ ...form, bonusCredits: +e.target.value })} placeholder="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Harga (IDR)</Label>
                <Input type="number" value={form.price} onChange={e => setForm({ ...form, price: +e.target.value })} placeholder="50000" />
              </div>
              <div>
                <Label>Urutan</Label>
                <Input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: +e.target.value })} placeholder="0" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Status Active</Label>
              <Switch checked={form.isActive} onCheckedChange={v => setForm({ ...form, isActive: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Batal</Button>
            <Button onClick={createPackage} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Buat Paket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
