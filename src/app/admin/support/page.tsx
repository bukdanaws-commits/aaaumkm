'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, Eye, CheckCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface Ticket {
  id: string;
  subject: string;
  user: {
    name: string;
    email: string;
  };
  priority: string;
  status: string;
  created_at: string;
  category?: string | null;
  replyCount?: number;
}

const getStatusBadge = (status: string) => {
  const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
    open: { label: 'Terbuka', variant: 'destructive' },
    in_progress: { label: 'Diproses', variant: 'secondary' },
    waiting_customer: { label: 'Menunggu', variant: 'secondary' },
    resolved: { label: 'Selesai', variant: 'default' },
    closed: { label: 'Ditutup', variant: 'secondary' },
  };
  const { label, variant } = config[status] || { label: status, variant: 'secondary' };
  return <Badge variant={variant}>{label}</Badge>;
};

const getPriorityBadge = (priority: string) => {
  const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
    low: { label: 'Rendah', variant: 'secondary' },
    normal: { label: 'Normal', variant: 'default' },
    high: { label: 'Tinggi', variant: 'destructive' },
    urgent: { label: 'Urgent', variant: 'destructive' },
  };
  const { label, variant } = config[priority] || { label: priority, variant: 'secondary' };
  return <Badge variant={variant}>{label}</Badge>;
};

function SkeletonRow() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
      <TableCell>
        <div className="space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-40" />
        </div>
      </TableCell>
      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function AdminSupport() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter]);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);

      const response = await fetch(`/api/admin/support?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets);
      } else {
        toast({
          variant: 'destructive',
          title: 'Gagal memuat tiket',
          description: 'Terjadi kesalahan saat memuat data',
        });
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        variant: 'destructive',
        title: 'Gagal memuat tiket',
        description: 'Terjadi kesalahan saat memuat data',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async (ticketId: string) => {
    setResolvingId(ticketId);
    try {
      const response = await fetch('/api/admin/support', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId,
          status: 'resolved',
        }),
      });

      if (response.ok) {
        toast({
          title: 'Tiket diselesaikan',
          description: 'Status tiket berhasil diubah menjadi selesai',
        });
        fetchTickets();
      } else {
        toast({
          variant: 'destructive',
          title: 'Gagal menyelesaikan tiket',
          description: 'Terjadi kesalahan, silakan coba lagi',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Gagal menyelesaikan tiket',
        description: 'Terjadi kesalahan, silakan coba lagi',
      });
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tiket Support</h1>
        <p className="text-muted-foreground">Kelola tiket bantuan pengguna</p>
      </div>

      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="open">Terbuka</SelectItem>
            <SelectItem value="in_progress">Diproses</SelectItem>
            <SelectItem value="waiting_customer">Menunggu</SelectItem>
            <SelectItem value="resolved">Selesai</SelectItem>
            <SelectItem value="closed">Ditutup</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter Prioritas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Prioritas</SelectItem>
            <SelectItem value="low">Rendah</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">Tinggi</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Tiket Bantuan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subjek</TableHead>
                  <TableHead>Pengguna</TableHead>
                  <TableHead>Prioritas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(3)].map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </TableBody>
            </Table>
          ) : tickets.length === 0 ? (
            <div className="text-center py-16">
              <MessageCircle className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Tidak ada tiket support</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subjek</TableHead>
                  <TableHead>Pengguna</TableHead>
                  <TableHead>Prioritas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium">
                      <div>
                        <p>{ticket.subject}</p>
                        {ticket.category && (
                          <p className="text-sm text-muted-foreground capitalize">
                            {ticket.category.replace('_', ' ')}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{ticket.user.name}</p>
                        <p className="text-sm text-muted-foreground">{ticket.user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(ticket.created_at), 'dd MMM yyyy', { locale: idLocale })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600"
                            onClick={() => handleResolve(ticket.id)}
                            disabled={resolvingId === ticket.id}
                          >
                            {resolvingId === ticket.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
