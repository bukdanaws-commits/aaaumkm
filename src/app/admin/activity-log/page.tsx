'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, User, Package, ShoppingCart, DollarSign, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface ActivityLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  description: string;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: any;
  createdAt: string;
}

interface ActivityLogsResponse {
  logs: ActivityLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const getActionIcon = (action: string) => {
  if (action.includes('listing')) return <Package className="h-4 w-4" />;
  if (action.includes('order')) return <ShoppingCart className="h-4 w-4" />;
  if (action.includes('kyc')) return <User className="h-4 w-4" />;
  if (action.includes('withdrawal') || action.includes('deposit')) return <DollarSign className="h-4 w-4" />;
  return <FileText className="h-4 w-4" />;
};

const getActionColor = (action: string) => {
  if (action.includes('create') || action.includes('approve')) return 'bg-green-500/10 text-green-600 border-green-200';
  if (action.includes('delete') || action.includes('reject') || action.includes('cancel')) return 'bg-red-500/10 text-red-600 border-red-200';
  if (action.includes('update')) return 'bg-blue-500/10 text-blue-600 border-blue-200';
  return 'bg-gray-500/10 text-gray-600 border-gray-200';
};

export default function AdminActivityLog() {
  const [data, setData] = useState<ActivityLogsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchLogs() {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/activity-logs?page=${page}&limit=20`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        console.error('Error fetching logs:', err);
        setError(err instanceof Error ? err.message : 'Failed to load logs');
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, [page]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Memuat log aktivitas...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <span className="text-2xl">⚠️</span>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Gagal Memuat Data</h3>
            <p className="text-muted-foreground">{error || 'Terjadi kesalahan'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Log Aktivitas</h1>
        <p className="text-muted-foreground">Riwayat aktivitas sistem</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Log Aktivitas
            <Badge variant="secondary" className="ml-auto">
              {data.pagination.total} total
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Belum ada log aktivitas</p>
              <p className="text-sm mt-1">Log aktivitas akan muncul di sini</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Aksi</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Waktu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.userEmail}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`gap-1 ${getActionColor(log.action)}`}>
                          {getActionIcon(log.action)}
                          {log.action.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md truncate">{log.description}</TableCell>
                      <TableCell className="font-mono text-sm">{log.ipAddress || '-'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {format(new Date(log.createdAt), 'dd MMM yyyy HH:mm', { locale: idLocale })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Halaman {data.pagination.page} dari {data.pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Sebelumnya
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                      disabled={page === data.pagination.totalPages}
                    >
                      Selanjutnya
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
