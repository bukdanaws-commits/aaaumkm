'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Package, Plus, Eye, Edit, Rocket, Search, Loader2, MoreVertical, Trash2 } from 'lucide-react';
import { useUserListings } from '@/hooks/useUserListings';

export default function DashboardListings() {
  const router = useRouter();
  const { listings, loading } = useUserListings();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredListings = listings.filter((listing) => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || listing.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const statusCounts = {
    all: listings.length,
    active: listings.filter((l) => l.status === 'active').length,
    pending_review: listings.filter((l) => l.status === 'pending_review').length,
    draft: listings.filter((l) => l.status === 'draft').length,
    sold: listings.filter((l) => l.status === 'sold').length,
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-500/10 text-green-600 border-green-200',
      draft: 'bg-gray-500/10 text-gray-600 border-gray-200',
      pending_review: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
      sold: 'bg-blue-500/10 text-blue-600 border-blue-200',
      expired: 'bg-red-500/10 text-red-600 border-red-200',
    };
    const labels: Record<string, string> = {
      active: 'Aktif',
      draft: 'Draft',
      pending_review: 'Pending',
      sold: 'Terjual',
      expired: 'Expired',
    };
    return (
      <Badge variant="outline" className={styles[status] || ''}>
        {labels[status] || status}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      notation: 'compact',
    }).format(amount);
  };

  return (
    <DashboardLayout title="Iklan Saya" description="Kelola semua iklan Anda">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari iklan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button 
          onClick={() => router.push('/listing/create')}
          className="rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 hover:from-blue-700 hover:via-purple-700 hover:to-purple-800"
        >
          <Plus className="mr-2 h-4 w-4" />
          Jual Barang Baru
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="all">Semua ({statusCounts.all})</TabsTrigger>
          <TabsTrigger value="active">Aktif ({statusCounts.active})</TabsTrigger>
          <TabsTrigger value="pending_review">Pending ({statusCounts.pending_review})</TabsTrigger>
          <TabsTrigger value="draft">Draft ({statusCounts.draft})</TabsTrigger>
          <TabsTrigger value="sold">Terjual ({statusCounts.sold})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredListings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? 'Tidak ada iklan yang cocok' : 'Belum ada iklan'}
                </p>
                {!searchQuery && (
                  <Button 
                    className="mt-4 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 hover:from-blue-700 hover:via-purple-700 hover:to-purple-800" 
                    onClick={() => router.push('/listing/create')}
                  >
                    Buat Iklan Pertama
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">Gambar</TableHead>
                      <TableHead>Judul</TableHead>
                      <TableHead className="w-[120px]">Harga</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead className="w-[80px] text-center">Views</TableHead>
                      <TableHead className="w-[100px]">Tanggal</TableHead>
                      <TableHead className="w-[80px] text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredListings.map((listing) => {
                      const primaryImage =
                        listing.listing_images?.find((img) => img.is_primary)?.image_url ||
                        listing.listing_images?.[0]?.image_url;

                      return (
                        <TableRow key={listing.id}>
                          <TableCell>
                            <div className="w-12 h-12 bg-muted rounded overflow-hidden">
                              {primaryImage ? (
                                <img
                                  src={primaryImage}
                                  alt={listing.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[300px]">
                              <p className="font-medium truncate">{listing.title}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-sm">
                              {formatCurrency(listing.price)}
                            </span>
                          </TableCell>
                          <TableCell>{getStatusBadge(listing.status)}</TableCell>
                          <TableCell className="text-center">
                            <span className="text-sm text-muted-foreground">
                              {listing.view_count || 0}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {listing.created_at &&
                                new Date(listing.created_at).toLocaleDateString('id-ID', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 rounded-full hover:bg-gradient-to-r hover:from-blue-600 hover:via-purple-600 hover:to-purple-700 hover:text-white"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => router.push(`/listing/${listing.id}`)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Lihat
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => router.push(`/listing/edit/${listing.id}`)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                {listing.status === 'active' && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      /* Open boost modal */
                                    }}
                                  >
                                    <Rocket className="h-4 w-4 mr-2" />
                                    Boost
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Hapus
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
