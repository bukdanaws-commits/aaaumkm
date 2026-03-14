'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowDownCircle, Loader2, Wallet, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  pending: { label: 'Menunggu', variant: 'secondary' },
  processing: { label: 'Diproses', variant: 'default' },
  completed: { label: 'Selesai', variant: 'default' },
  rejected: { label: 'Ditolak', variant: 'destructive' },
};

// Mock data
const mockWallet = { id: 'wallet-1', balance: 2450000 };
const mockWithdrawals = [
  { id: '1', amount: 500000, bank_name: 'BCA', account_number: '1234567890', status: 'completed', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: '2', amount: 1000000, bank_name: 'BNI', account_number: '0987654321', status: 'processing', created_at: new Date().toISOString() },
];

export default function DashboardWithdraw() {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ bank_name: '', account_number: '', account_holder: '', amount: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const wallet = mockWallet;
  const withdrawals = mockWithdrawals;

  const handleSubmit = async () => {
    if (!wallet?.id) return;
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setForm({ bank_name: '', account_number: '', account_holder: '', amount: '' });
      setIsOpen(false);
    }, 1500);
  };

  return (
    <DashboardLayout title="Penarikan Dana" description="Tarik saldo wallet ke rekening bank Anda">
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Saldo Tersedia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(Number(wallet?.balance || 0))}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Tarik Dana</CardTitle>
            <CardDescription>Ajukan penarikan ke rekening bank</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <ArrowDownCircle className="mr-2 h-4 w-4" />
                  Ajukan Penarikan
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Penarikan Dana</DialogTitle>
                  <DialogDescription>Isi detail rekening tujuan penarikan</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Bank</Label>
                    <Select value={form.bank_name} onValueChange={(v) => setForm(p => ({ ...p, bank_name: v }))}>
                      <SelectTrigger><SelectValue placeholder="Pilih bank" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BCA">BCA</SelectItem>
                        <SelectItem value="BNI">BNI</SelectItem>
                        <SelectItem value="BRI">BRI</SelectItem>
                        <SelectItem value="Mandiri">Mandiri</SelectItem>
                        <SelectItem value="CIMB">CIMB Niaga</SelectItem>
                        <SelectItem value="Permata">Permata</SelectItem>
                        <SelectItem value="BSI">BSI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Nomor Rekening</Label>
                    <Input value={form.account_number} onChange={(e) => setForm(p => ({ ...p, account_number: e.target.value }))} placeholder="1234567890" />
                  </div>
                  <div className="space-y-2">
                    <Label>Nama Pemilik Rekening</Label>
                    <Input value={form.account_holder} onChange={(e) => setForm(p => ({ ...p, account_holder: e.target.value }))} placeholder="Nama sesuai rekening" />
                  </div>
                  <div className="space-y-2">
                    <Label>Jumlah Penarikan</Label>
                    <Input type="number" value={form.amount} onChange={(e) => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="100000" />
                    <p className="text-xs text-muted-foreground">Minimum Rp 50.000</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !form.bank_name || !form.account_number || !form.account_holder || Number(form.amount) < 50000}
                  >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Ajukan
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Penarikan</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : withdrawals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ArrowDownCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Belum ada riwayat penarikan</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Bank</TableHead>
                  <TableHead>Rekening</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((w) => {
                  const st = statusMap[w.status || 'pending'];
                  return (
                    <TableRow key={w.id}>
                      <TableCell className="text-sm">{w.created_at ? format(new Date(w.created_at), 'dd MMM yyyy', { locale: idLocale }) : '-'}</TableCell>
                      <TableCell>{w.bank_name}</TableCell>
                      <TableCell className="font-mono text-sm">{w.account_number}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(w.amount)}</TableCell>
                      <TableCell><Badge variant={st?.variant || 'secondary'}>{st?.label || w.status}</Badge></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
