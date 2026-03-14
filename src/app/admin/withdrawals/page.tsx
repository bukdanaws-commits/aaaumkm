'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Banknote, CheckCircle, XCircle, Clock, DollarSign, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  bankName: string;
  bankAccount: string;
  bankAccountName: string;
  status: string;
  processedBy: string | null;
  processedAt: Date | null;
  notes: string | null;
  createdAt: Date;
  profile: {
    name: string | null;
    email: string;
  };
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

const getStatusBadge = (status: string) => {
  const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    pending: { label: 'Pending', variant: 'secondary' },
    processing: { label: 'Diproses', variant: 'default' },
    approved: { label: 'Disetujui', variant: 'default' },
    rejected: { label: 'Ditolak', variant: 'destructive' },
    paid: { label: 'Dibayar', variant: 'default' },
  };
  const { label, variant } = config[status] || { label: status, variant: 'outline' };
  return <Badge variant={variant}>{label}</Badge>;
};

export default function AdminWithdrawals() {
  const { toast } = useToast();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectDialog, setRejectDialog] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/withdrawals');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setWithdrawals(data.withdrawals || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal memuat data penarikan',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      setProcessing(true);
      const response = await fetch(`/api/admin/withdrawals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });

      if (!response.ok) throw new Error('Failed to approve');

      toast({
        title: 'Berhasil',
        description: 'Penarikan disetujui',
      });
      fetchData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal menyetujui penarikan',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectDialog || !rejectNote.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Alasan penolakan harus diisi',
      });
      return;
    }

    try {
      setProcessing(true);
      const response = await fetch(`/api/admin/withdrawals/${rejectDialog}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', notes: rejectNote }),
      });

      if (!response.ok) throw new Error('Failed to reject');

      toast({
        title: 'Berhasil',
        description: 'Penarikan ditolak',
      });
      setRejectDialog(null);
      setRejectNote('');
      fetchData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal menolak penarikan',
      });
    } finally {
      setProcessing(false);
    }
  };

  const stats = useMemo(() => {
    const totalWithdrawals = withdrawals.length;
    const pendingCount = withdrawals.filter((w) => w.status === 'pending').length;
    const approvedCount = withdrawals.filter((w) => w.status === 'approved' || w.status === 'paid').length;
    const totalAmount = withdrawals.reduce((sum, w) => sum + w.amount, 0);

    return {
      totalWithdrawals,
      pendingCount,
      approvedCount,
      totalAmount,
    };
  }, [withdrawals]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Penarikan Dana</h1>
        <p className="text-muted-foreground">Kelola permintaan penarikan dana</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
              Total Penarikan
            </CardTitle>
            <Banknote className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats.totalWithdrawals}</div>
            <p className="text-xs text-muted-foreground mt-1">Semua permintaan</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
              Pending
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{stats.pendingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Menunggu proses</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">
              Approved
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.approvedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Penarikan disetujui</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-400">
              Total Nominal
            </CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-purple-700 dark:text-purple-400">
              {formatCurrency(stats.totalAmount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total dana ditarik</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Permintaan Penarikan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Banknote className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Belum ada permintaan penarikan</p>
              <p className="text-sm mt-1">Permintaan penarikan akan muncul di sini</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pengguna</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Bank</TableHead>
                  <TableHead>No. Rekening</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{w.profile.name || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">{w.profile.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(w.amount)}</TableCell>
                    <TableCell>{w.bankName}</TableCell>
                    <TableCell className="font-mono text-sm">{w.bankAccount}</TableCell>
                    <TableCell>{getStatusBadge(w.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(w.createdAt), 'dd MMM yyyy', { locale: idLocale })}
                    </TableCell>
                    <TableCell className="text-right">
                      {w.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleApprove(w.id)}
                            disabled={processing}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive/90"
                            onClick={() => setRejectDialog(w.id)}
                            disabled={processing}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!rejectDialog} onOpenChange={(open) => !open && setRejectDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Penarikan</DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan untuk pengguna.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Alasan penolakan..."
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(null)} disabled={processing}>
              Batal
            </Button>
            <Button onClick={handleReject} disabled={processing} variant="destructive">
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Tolak'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
