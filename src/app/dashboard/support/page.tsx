'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { HelpCircle, Plus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Ticket {
  id: string;
  subject: string;
  category: string | null;
  priority: string;
  status: string;
  created_at: string;
  last_reply_at: string | null;
}

const statusBadge: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  open: { label: 'Terbuka', variant: 'default' },
  in_progress: { label: 'Diproses', variant: 'secondary' },
  waiting_customer: { label: 'Menunggu', variant: 'secondary' },
  resolved: { label: 'Selesai', variant: 'default' },
  closed: { label: 'Ditutup', variant: 'secondary' },
};

const priorityBadge: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  low: { label: 'Rendah', variant: 'secondary' },
  normal: { label: 'Normal', variant: 'default' },
  high: { label: 'Tinggi', variant: 'destructive' },
  urgent: { label: 'Urgent', variant: 'destructive' },
};

function SkeletonRow() {
  return (
    <TableRow>
      <TableCell>
        <div className="space-y-1">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-64" />
        </div>
      </TableCell>
      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
    </TableRow>
  );
}

export default function DashboardSupport() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ subject: '', message: '', priority: 'normal', category: '' });

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user) return;
      
      try {
        const response = await fetch('/api/dashboard/support');
        if (response.ok) {
          const data = await response.json();
          setTickets(data.tickets);
        }
      } catch (error) {
        console.error('Error fetching tickets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchTickets();
    }
  }, [user, authLoading]);

  const handleSubmit = async () => {
    if (!form.subject || !form.message) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/dashboard/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        const data = await response.json();
        const newTicket: Ticket = {
          id: data.ticket.id,
          subject: form.subject,
          category: form.category || null,
          priority: form.priority,
          status: 'open',
          created_at: new Date().toISOString(),
          last_reply_at: null,
        };
        setTickets([newTicket, ...tickets]);
        setForm({ subject: '', message: '', priority: 'normal', category: '' });
        setIsOpen(false);
        toast({
          title: 'Tiket berhasil dibuat',
          description: 'Tim support akan segera merespons tiket Anda',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Gagal membuat tiket',
          description: 'Terjadi kesalahan, silakan coba lagi',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Gagal membuat tiket',
        description: 'Terjadi kesalahan, silakan coba lagi',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <DashboardLayout title="Pusat Bantuan" description="Memuat...">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subjek</TableHead>
                  <TableHead>Prioritas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(3)].map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Pusat Bantuan" description="Kirim tiket bantuan atau lihat status tiket Anda">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Tiket Bantuan</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Buat Tiket</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buat Tiket Bantuan</DialogTitle>
              <DialogDescription>Jelaskan masalah Anda dan tim kami akan membantu</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Subjek</Label>
                <Input value={form.subject} onChange={(e) => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="Masalah dengan..." />
              </div>
              <div className="space-y-2">
                <Label>Pesan</Label>
                <Textarea value={form.message} onChange={(e) => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Jelaskan masalah Anda secara detail..." rows={5} />
              </div>
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select value={form.category} onValueChange={(v) => setForm(p => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payment">Pembayaran</SelectItem>
                    <SelectItem value="listing">Iklan</SelectItem>
                    <SelectItem value="account">Akun</SelectItem>
                    <SelectItem value="order">Pesanan</SelectItem>
                    <SelectItem value="other">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Prioritas</Label>
                <Select value={form.priority} onValueChange={(v) => setForm(p => ({ ...p, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Rendah</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">Tinggi</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
              <Button onClick={handleSubmit} disabled={isSubmitting || !form.subject || !form.message}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Kirim
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {tickets.length === 0 ? (
            <div className="text-center py-16">
              <HelpCircle className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Belum ada tiket bantuan</p>
              <p className="text-sm text-muted-foreground mt-1">Klik "Buat Tiket" untuk mengirim pertanyaan</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subjek</TableHead>
                  <TableHead>Prioritas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => {
                  const st = statusBadge[ticket.status] || statusBadge.open;
                  const pr = priorityBadge[ticket.priority] || priorityBadge.normal;
                  return (
                    <TableRow key={ticket.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <p className="font-medium">{ticket.subject}</p>
                          {ticket.category && (
                            <p className="text-sm text-muted-foreground capitalize">
                              {ticket.category.replace('_', ' ')}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell><Badge variant={pr.variant}>{pr.label}</Badge></TableCell>
                      <TableCell><Badge variant={st.variant}>{st.label}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {ticket.created_at ? format(new Date(ticket.created_at), 'dd MMM yyyy', { locale: idLocale }) : '-'}
                      </TableCell>
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
