'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Package, Search, Loader2, Eye, CheckCircle, XCircle, MoreHorizontal,
  ExternalLink, Flag, Trash2, Clock
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { useAdminListings } from '@/hooks/useAdminData';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
  active: { label: 'Aktif', variant: 'default' },
  pending_review: { label: 'Pending Review', variant: 'outline', className: 'border-yellow-500 text-yellow-600' },
  rejected: { label: 'Ditolak', variant: 'destructive' },
  sold: { label: 'Terjual', variant: 'secondary' },
  draft: { label: 'Draft', variant: 'outline' },
  expired: { label: 'Expired', variant: 'outline', className: 'border-gray-500 text-gray-600' },
};

export default function AdminListings() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(initialStatus);
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPendingDialog, setShowPendingDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  const { listings, loading, error, countsByStatus, approveListing, rejectListing, updateListingStatus, bulkApprove } = useAdminListings({
    search: searchQuery,
    status: activeTab === 'all' ? undefined : activeTab,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      minimumFractionDigits: 0 
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || { label: status, variant: 'outline' as const };
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedListings(listings.map(l => l.id));
    } else {
      setSelectedListings([]);
    }
  };

  const handleSelectListing = (listingId: string, checked: boolean) => {
    if (checked) {
      setSelectedListings(prev => [...prev, listingId]);
    } else {
      setSelectedListings(prev => prev.filter(id => id !== listingId));
    }
  };

  const handleApprove = async (listingId: string) => {
    setActionLoading(true);
    const result = await approveListing(listingId);
    setActionLoading(false);

    if (result.success) {
      toast({
        title: 'Listing Approved',
        description: 'The listing has been approved and is now active',
      });
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to approve listing',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async () => {
    if (!selectedListing || !rejectReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a rejection reason',
        variant: 'destructive',
      });
      return;
    }

    setActionLoading(true);
    const result = await rejectListing(selectedListing.id, rejectReason);
    setActionLoading(false);

    if (result.success) {
      toast({
        title: 'Listing Rejected',
        description: 'The listing has been rejected',
      });
      setShowRejectDialog(false);
      setRejectReason('');
      setSelectedListing(null);
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to reject listing',
        variant: 'destructive',
      });
    }
  };

  const handleBulkApprove = async () => {
    if (selectedListings.length === 0) return;

    setActionLoading(true);
    const result = await bulkApprove(selectedListings);
    setActionLoading(false);

    if (result.success) {
      toast({
        title: 'Listings Approved',
        description: `${selectedListings.length} listings have been approved`,
      });
      setSelectedListings([]);
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to approve listings',
        variant: 'destructive',
      });
    }
  };

  const handleSetPending = async () => {
    if (!selectedListing) return;

    setActionLoading(true);
    const result = await updateListingStatus(selectedListing.id, 'pending_review');
    setActionLoading(false);

    if (result.success) {
      toast({
        title: 'Status Updated',
        description: 'Listing has been set to pending review',
      });
      setShowPendingDialog(false);
      setSelectedListing(null);
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedListing) return;

    setActionLoading(true);
    
    try {
      const response = await fetch(`/api/admin/listings/${selectedListing.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete listing');
      }

      toast({
        title: 'Listing Deleted',
        description: 'The listing has been permanently deleted',
      });
      
      setShowDeleteDialog(false);
      setSelectedListing(null);
      
      // Refresh the list
      window.location.reload();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete listing',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const pendingCount = countsByStatus['pending_review'] || 0;
  const activeCount = countsByStatus['active'] || 0;
  const rejectedCount = countsByStatus['rejected'] || 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Manajemen Iklan</h1>
        <p className="text-muted-foreground">Kelola semua iklan di platform</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Daftar Iklan
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari iklan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Tabs */}
          <div className="flex items-center justify-between mb-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">
                  Semua
                </TabsTrigger>
                <TabsTrigger value="pending_review">
                  Pending Review
                  {pendingCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {pendingCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="active">Aktif</TabsTrigger>
                <TabsTrigger value="rejected">Ditolak</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Bulk Actions */}
            {selectedListings.length > 0 && activeTab === 'pending_review' && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedListings.length} selected
                </span>
                <Button 
                  size="sm" 
                  onClick={handleBulkApprove}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  Approve Selected
                </Button>
              </div>
            )}
          </div>

          {error ? (
            <div className="text-center py-8 text-destructive">
              <p>Error: {error}</p>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Tidak ada iklan ditemukan</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    {activeTab === 'pending_review' && (
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedListings.length === listings.length && listings.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                    )}
                    <TableHead>Iklan</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Penjual</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listings.map((listing) => (
                    <TableRow key={listing.id}>
                      {activeTab === 'pending_review' && (
                        <TableCell>
                          <Checkbox
                            checked={selectedListings.includes(listing.id)}
                            onCheckedChange={(checked) => 
                              handleSelectListing(listing.id, checked as boolean)
                            }
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                            {listing.primary_image ? (
                              <img 
                                src={listing.primary_image} 
                                alt={listing.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate max-w-[200px]">
                              {listing.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {listing.category || 'No category'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(listing.price)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{listing.seller.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {listing.seller.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getStatusBadge(listing.status)}
                          {listing.report_count > 0 && (
                            <Badge variant="outline" className="text-red-600 border-red-200">
                              <Flag className="h-3 w-3 mr-1" />
                              {listing.report_count}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span>{listing.view_count}</span>
                          <span className="text-muted-foreground ml-1">
                            views
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(listing.created_at), 'dd MMM yyyy', { locale: idLocale })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {listing.status === 'pending_review' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => handleApprove(listing.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-destructive hover:text-destructive"
                                onClick={() => {
                                  setSelectedListing(listing);
                                  setShowRejectDialog(true);
                                }}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => {
                                router.push(`/listing/${listing.id}`);
                              }}>
                                <Eye className="mr-2 h-4 w-4" />
                                Lihat Detail
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                window.open(`/marketplace/${listing.slug}`, '_blank');
                              }}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View on Site
                              </DropdownMenuItem>
                              
                              <DropdownMenuSeparator />
                              
                              {listing.status === 'pending_review' && (
                                <>
                                  <DropdownMenuItem 
                                    className="text-green-600"
                                    onClick={() => handleApprove(listing.id)}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => {
                                      setSelectedListing(listing);
                                      setShowRejectDialog(true);
                                    }}
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              
                              {listing.status !== 'pending_review' && (
                                <DropdownMenuItem 
                                  className="text-yellow-600"
                                  onClick={() => {
                                    setSelectedListing(listing);
                                    setShowPendingDialog(true);
                                  }}
                                >
                                  <Clock className="mr-2 h-4 w-4" />
                                  Set Pending Review
                                </DropdownMenuItem>
                              )}
                              
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => {
                                  setSelectedListing(listing);
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus Iklan
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Listing</DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan untuk listing ini
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Listing:</p>
              <p className="text-sm text-muted-foreground">{selectedListing?.title}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Alasan Penolakan:</p>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Contoh: Deskripsi produk tidak lengkap, foto tidak jelas, dll."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowRejectDialog(false);
              setRejectReason('');
              setSelectedListing(null);
            }}>
              Batal
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={actionLoading || !rejectReason.trim()}
            >
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tolak Listing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Listing</DialogTitle>
            <DialogDescription>
              Informasi lengkap tentang listing ini
            </DialogDescription>
          </DialogHeader>
          {selectedListing && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                  {selectedListing.primary_image ? (
                    <img 
                      src={selectedListing.primary_image} 
                      alt={selectedListing.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Package className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold truncate">{selectedListing.title}</h3>
                  <p className="text-lg font-bold text-primary">
                    {formatCurrency(selectedListing.price)}
                  </p>
                  {getStatusBadge(selectedListing.status)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Penjual</p>
                  <p className="font-medium">{selectedListing.seller.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedListing.seller.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Kategori</p>
                  <p className="font-medium">{selectedListing.category || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Kondisi</p>
                  <p className="font-medium capitalize">{selectedListing.condition?.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipe</p>
                  <p className="font-medium capitalize">{selectedListing.listing_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Views</p>
                  <p className="font-medium">{selectedListing.view_count}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Favorites</p>
                  <p className="font-medium">{selectedListing.favorite_count}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dibuat</p>
                  <p className="font-medium">
                    {format(new Date(selectedListing.created_at), 'dd MMM yyyy', { locale: idLocale })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reports</p>
                  <p className="font-medium">{selectedListing.report_count}</p>
                </div>
              </div>

              {selectedListing.rejected_reason && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive">
                  <p className="text-sm font-medium">Alasan Penolakan:</p>
                  <p className="text-sm">{selectedListing.rejected_reason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Set Pending Dialog */}
      <Dialog open={showPendingDialog} onOpenChange={setShowPendingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Pending Review</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin mengubah status listing ini menjadi pending review?
            </DialogDescription>
          </DialogHeader>
          {selectedListing && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Listing:</p>
              <p className="text-sm text-muted-foreground">{selectedListing.title}</p>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowPendingDialog(false);
                setSelectedListing(null);
              }}
            >
              Batal
            </Button>
            <Button 
              onClick={handleSetPending}
              disabled={actionLoading}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Set Pending Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Iklan</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus iklan ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          {selectedListing && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Listing:</p>
              <p className="text-sm text-muted-foreground">{selectedListing.title}</p>
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive">
                <p className="text-sm font-medium">Peringatan:</p>
                <p className="text-sm">Listing akan dihapus secara permanen dari database.</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteDialog(false);
                setSelectedListing(null);
              }}
            >
              Batal
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={actionLoading}
            >
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus Iklan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
