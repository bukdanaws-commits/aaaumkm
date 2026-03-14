'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Eye, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const mockReports = [
  { id: '1', listing: { id: 'l1', title: 'iPhone 15 Pro Max' }, reporter: { name: 'John Doe', email: 'john@example.com' }, reason: 'barang_tidak_sesuai', description: 'Barang tidak sesuai deskripsi', status: 'pending', created_at: new Date().toISOString() },
  { id: '2', listing: { id: 'l2', title: 'Samsung Galaxy S24' }, reporter: { name: 'Jane Smith', email: 'jane@example.com' }, reason: 'penipuan', description: 'Diduga penipuan', status: 'reviewed', created_at: new Date(Date.now() - 86400000).toISOString() },
];

const getStatusBadge = (status: string) => {
  const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
    pending: { label: 'Pending', variant: 'secondary' },
    reviewed: { label: 'Direview', variant: 'default' },
    action_taken: { label: 'Ditindak', variant: 'default' },
    dismissed: { label: 'Ditolak', variant: 'destructive' },
  };
  const { label, variant } = config[status] || { label: status, variant: 'secondary' };
  return <Badge variant={variant}>{label}</Badge>;
};

export default function AdminReports() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Laporan Pengguna</h1>
        <p className="text-muted-foreground">Kelola laporan dari pengguna</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Laporan Pengguna
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Iklan</TableHead>
                <TableHead>Pelapor</TableHead>
                <TableHead>Alasan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.listing.title}</TableCell>
                  <TableCell>
                    <div>
                      <p>{report.reporter.name}</p>
                      <p className="text-sm text-muted-foreground">{report.reporter.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{report.reason.replace('_', ' ')}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(report.created_at), 'dd MMM yyyy', { locale: idLocale })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline"><Eye className="h-4 w-4" /></Button>
                      <Button size="sm" variant="outline" className="text-green-600"><CheckCircle className="h-4 w-4" /></Button>
                      <Button size="sm" variant="outline" className="text-destructive"><XCircle className="h-4 w-4" /></Button>
                    </div>
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
