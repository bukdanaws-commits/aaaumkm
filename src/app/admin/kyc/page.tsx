'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileCheck, Search, Loader2, CheckCircle, XCircle, Image as ImageIcon, Clock, UserCheck, UserX, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useMemo } from 'react';

interface KycDocument {
  id: string;
  documentType: string;
  documentUrl: string;
  status: string;
}

interface KycRequest {
  id: string;
  userId: string;
  ktpNumber: string | null;
  npwpNumber: string | null;
  status: string;
  submittedAt: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  profile: {
    name: string | null;
    email: string;
  };
  documents: KycDocument[];
  provinceName: string;
  regencyName: string;
}

export default function AdminKyc() {
  const [requests, setRequests] = useState<KycRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<KycRequest | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  async function fetchRequests() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/admin/kyc?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch KYC requests');
      }
      
      const data = await response.json();
      setRequests(data.requests);
    } catch (error) {
      console.error('Error fetching KYC requests:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data KYC',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(request: KycRequest, action: 'approve' | 'reject') {
    setSelectedRequest(request);
    setDialogAction(action);
    setShowDialog(true);
    setRejectionReason('');
  }

  async function confirmAction() {
    if (!selectedRequest || !dialogAction) return;

    if (dialogAction === 'reject' && !rejectionReason.trim()) {
      toast({
        title: 'Error',
        description: 'Alasan penolakan harus diisi',
        variant: 'destructive',
      });
      return;
    }

    try {
      setProcessing(true);
      const response = await fetch(`/api/admin/kyc/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: dialogAction,
          rejectionReason: dialogAction === 'reject' ? rejectionReason : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update KYC');
      }

      toast({
        title: 'Berhasil',
        description: `KYC ${dialogAction === 'approve' ? 'disetujui' : 'ditolak'}`,
      });

      setShowDialog(false);
      fetchRequests();
    } catch (error) {
      console.error('Error updating KYC:', error);
      toast({
        title: 'Error',
        description: 'Gagal memperbarui status KYC',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      not_submitted: { label: 'Belum Submit', className: 'bg-gray-500/10 text-gray-600 border-gray-200' },
      draft: { label: 'Draft', className: 'bg-gray-500/10 text-gray-600 border-gray-200' },
      pending: { label: 'Pending', className: 'bg-yellow-500/10 text-yellow-600 border-yellow-200' },
      under_review: { label: 'Direview', className: 'bg-blue-500/10 text-blue-600 border-blue-200' },
      approved: { label: 'Disetujui', className: 'bg-green-500/10 text-green-600 border-green-200' },
      rejected: { label: 'Ditolak', className: 'bg-red-500/10 text-red-600 border-red-200' },
    };
    const { label, className } = config[status] || { label: status, className: '' };
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  const filteredRequests = requests.filter(req =>
    req.profile.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.profile.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.ktpNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats
  const totalRequests = requests.length;
  const pendingCount = requests.filter(r => r.status === 'pending' || r.status === 'under_review').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  // Pagination logic
  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredRequests.slice(startIndex, endIndex);
  }, [filteredRequests, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Verifikasi KYC</h1>
        <p className="text-muted-foreground">Kelola permintaan verifikasi identitas</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Requests - Blue */}
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
              Total Permintaan
            </CardTitle>
            <FileCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">{totalRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">Semua permintaan KYC</p>
          </CardContent>
        </Card>

        {/* Pending - Yellow */}
        <Card className="border-l-4 border-l-yellow-500 bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
              Menunggu Review
            </CardTitle>
            <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">{pendingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending & Under Review</p>
          </CardContent>
        </Card>

        {/* Approved - Green */}
        <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">
              Disetujui
            </CardTitle>
            <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 dark:text-green-400">{approvedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">KYC terverifikasi</p>
          </CardContent>
        </Card>

        {/* Rejected - Red */}
        <Card className="border-l-4 border-l-red-500 bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400">
              Ditolak
            </CardTitle>
            <UserX className="h-5 w-5 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700 dark:text-red-400">{rejectedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">KYC tidak disetujui</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Permintaan KYC
            <Badge variant="secondary" className="ml-2">
              {filteredRequests.length} total
            </Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Direview</SelectItem>
                <SelectItem value="approved">Disetujui</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileCheck className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Belum ada permintaan KYC</p>
              <p className="text-sm mt-1">Permintaan KYC akan muncul di sini</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pengguna</TableHead>
                      <TableHead>No. KTP</TableHead>
                      <TableHead>Lokasi</TableHead>
                      <TableHead>Dokumen</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRequests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{req.profile.name || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">{req.profile.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {req.ktpNumber ? `${req.ktpNumber.slice(0, 4)}****${req.ktpNumber.slice(-4)}` : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{req.provinceName}</p>
                        <p className="text-muted-foreground">{req.regencyName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {req.documents.map((doc) => (
                          <a
                            key={doc.id}
                            href={doc.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded hover:bg-muted/80"
                          >
                            <ImageIcon className="h-3 w-3" />
                            {doc.documentType}
                          </a>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(req.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {req.submittedAt ? format(new Date(req.submittedAt), 'dd MMM yyyy', { locale: idLocale }) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {(req.status === 'pending' || req.status === 'under_review') && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleAction(req, 'approve')}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:text-destructive/90"
                              onClick={() => handleAction(req, 'reject')}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {filteredRequests.length > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredRequests.length)} dari {filteredRequests.length} permintaan
                    </p>
                    <Select value={itemsPerPage.toString()} onValueChange={(v) => {
                      setItemsPerPage(Number(v));
                      setCurrentPage(1);
                    }}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            size="sm"
                            className="w-9"
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction === 'approve' ? 'Setujui KYC' : 'Tolak KYC'}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === 'approve'
                ? 'Apakah Anda yakin ingin menyetujui verifikasi KYC ini?'
                : 'Berikan alasan penolakan untuk user.'}
            </DialogDescription>
          </DialogHeader>
          {dialogAction === 'reject' && (
            <Textarea
              placeholder="Alasan penolakan..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} disabled={processing}>
              Batal
            </Button>
            <Button
              onClick={confirmAction}
              disabled={processing}
              className={dialogAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                dialogAction === 'approve' ? 'Setujui' : 'Tolak'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
