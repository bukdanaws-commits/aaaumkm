'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, Pencil, Trash2, Image as ImageIcon, Loader2, 
  Eye, EyeOff, TrendingUp, MousePointerClick, DollarSign,
  LayoutGrid, Play, Pause, XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Image from 'next/image';

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  position: string;
  status: string;
  impressions: number;
  clicks: number;
  budgetTotal: number;
  budgetSpent: number;
  startsAt: string;
  endsAt: string | null;
  createdAt: string;
}

const POSITION_CONFIG = {
  'marketplace-top': {
    label: 'Marketplace Top (Landscape)',
    dimensions: '800x150',
    aspectRatio: '16:3',
    description: 'Banner utama di atas listing (2/3 lebar)'
  },
  'marketplace-inline': {
    label: 'Marketplace Inline (Landscape)',
    dimensions: '800x150',
    aspectRatio: '16:3',
    description: 'Di antara listing (2/3 lebar)'
  },
  'marketplace-sidebar': {
    label: 'Marketplace Sidebar (Square)',
    dimensions: '400x150',
    aspectRatio: '8:3',
    description: 'Banner samping (1/3 lebar)'
  },
  'home-center': {
    label: 'Home Center (Landscape)',
    dimensions: '800x150',
    aspectRatio: '16:3',
    description: 'Banner tengah home (2/3 lebar)'
  },
  'home-inline': {
    label: 'Home Inline (Landscape)',
    dimensions: '800x150',
    aspectRatio: '16:3',
    description: 'Banner inline home (2/3 lebar)'
  },
  'home-center-sidebar': {
    label: 'Home Center Sidebar (Square)',
    dimensions: '400x150',
    aspectRatio: '8:3',
    description: 'Banner samping home center (1/3 lebar)'
  },
  'home-inline-sidebar': {
    label: 'Home Inline Sidebar (Square)',
    dimensions: '400x150',
    aspectRatio: '8:3',
    description: 'Banner samping home inline (1/3 lebar)'
  },
  'marketplace-inline-sidebar': {
    label: 'Marketplace Inline Sidebar (Square)',
    dimensions: '400x150',
    aspectRatio: '8:3',
    description: 'Banner samping marketplace inline (1/3 lebar)'
  }
};

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; banner: Banner | null }>({
    open: false,
    banner: null,
  });
  const [editing, setEditing] = useState<Banner | null>(null);
  const [processing, setProcessing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    title: '',
    imageUrl: '',
    targetUrl: '',
    position: 'marketplace-top',
    budgetTotal: 0,
    startsAt: '',
    endsAt: '',
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  async function fetchBanners() {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/banners');
      
      if (!response.ok) {
        throw new Error('Failed to fetch banners');
      }
      
      const data = await response.json();
      setBanners(data.banners);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat banner',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function initializeDefaultBanners() {
    try {
      setLoading(true);
      const defaultBanners = Object.keys(POSITION_CONFIG).map((position) => {
        const config = POSITION_CONFIG[position as keyof typeof POSITION_CONFIG];
        const [width, height] = config.dimensions.split('x');
        
        return {
          title: config.label,
          imageUrl: `https://picsum.photos/seed/${position}/${width}/${height}`,
          targetUrl: '/marketplace',
          position: position,
          budgetTotal: 1000000,
          startsAt: new Date().toISOString(),
          endsAt: null,
        };
      });

      // Create all banners
      const promises = defaultBanners.map(banner =>
        fetch('/api/admin/banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(banner),
        })
      );

      await Promise.all(promises);
      
      toast({
        title: 'Berhasil',
        description: `${defaultBanners.length} banner default berhasil dibuat. Silakan ganti gambar sesuai kebutuhan.`,
      });
      
      // Refresh banners
      const response = await fetch('/api/admin/banners');
      if (response.ok) {
        const data = await response.json();
        setBanners(data.banners);
      }
    } catch (error) {
      console.error('Error initializing banners:', error);
      toast({
        title: 'Error',
        description: 'Gagal membuat banner default',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  // Calculate stats
  const stats = {
    total: banners.length,
    active: banners.filter(b => b.status === 'active').length,
    totalImpressions: banners.reduce((sum, b) => sum + b.impressions, 0),
    totalClicks: banners.reduce((sum, b) => sum + b.clicks, 0),
    totalBudget: banners.reduce((sum, b) => sum + b.budgetSpent, 0),
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: '',
      imageUrl: '',
      targetUrl: '',
      position: 'marketplace-top',
      budgetTotal: 0,
      startsAt: '',
      endsAt: '',
    });
    setImagePreview(null);
    setDialogOpen(true);
  };

  const openEdit = (banner: Banner) => {
    setEditing(banner);
    setForm({
      title: banner.title,
      imageUrl: banner.imageUrl,
      targetUrl: banner.targetUrl,
      position: banner.position,
      budgetTotal: banner.budgetTotal,
      startsAt: banner.startsAt.split('T')[0],
      endsAt: banner.endsAt ? banner.endsAt.split('T')[0] : '',
    });
    setImagePreview(banner.imageUrl);
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'Ukuran file maksimal 5MB',
        variant: 'destructive',
      });
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast({
        title: 'Error',
        description: 'Format file harus JPEG, PNG, atau WebP',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploadingImage(true);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const formData = new FormData();
      formData.append('file', file);
      formData.append('position', form.position);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      setForm(f => ({ ...f, imageUrl: data.url }));
      
      toast({
        title: 'Berhasil',
        description: 'Gambar berhasil diupload',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.imageUrl || !form.targetUrl || !form.startsAt) {
      toast({
        title: 'Error',
        description: 'Semua field wajib diisi',
        variant: 'destructive',
      });
      return;
    }

    if (form.budgetTotal <= 0) {
      toast({
        title: 'Error',
        description: 'Budget harus lebih dari 0',
        variant: 'destructive',
      });
      return;
    }

    try {
      setProcessing(true);
      
      const payload = {
        title: form.title.trim(),
        imageUrl: form.imageUrl,
        targetUrl: form.targetUrl,
        position: form.position,
        budgetTotal: form.budgetTotal,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
      };

      const url = editing 
        ? `/api/admin/banners/${editing.id}`
        : '/api/admin/banners';
      
      const method = editing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save banner');
      }

      toast({
        title: 'Berhasil',
        description: editing ? 'Banner berhasil diupdate' : 'Banner berhasil ditambahkan',
      });

      setDialogOpen(false);
      fetchBanners();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.banner) return;

    try {
      setProcessing(true);
      const response = await fetch(`/api/admin/banners/${deleteDialog.banner.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete banner');
      }

      toast({
        title: 'Berhasil',
        description: 'Banner berhasil dihapus',
      });

      setDeleteDialog({ open: false, banner: null });
      await fetchBanners();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menghapus banner',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      setProcessing(true);
      const response = await fetch(`/api/admin/banners/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      toast({
        title: 'Berhasil',
        description: 'Status banner berhasil diupdate',
      });

      await fetchBanners();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal mengubah status',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const getCTR = (impressions: number, clicks: number) => {
    if (impressions === 0) return '0.00';
    return ((clicks / impressions) * 100).toFixed(2);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <LayoutGrid className="h-8 w-8" />
            Manajemen Banner Iklan
          </h1>
          <p className="text-muted-foreground">Kelola semua banner iklan di platform</p>
        </div>
        <div className="flex gap-2">
          {banners.length === 0 && (
            <Button 
              onClick={initializeDefaultBanners} 
              variant="outline"
              className="gap-2"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LayoutGrid className="h-4 w-4" />
              )}
              Generate Semua Banner
            </Button>
          )}
          <Button onClick={openCreate} className="gap-2 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 hover:from-blue-700 hover:via-purple-700 hover:to-purple-800">
            <Plus className="h-4 w-4" />
            Tambah Banner
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
              Total Banner
            </CardTitle>
            <LayoutGrid className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Semua banner</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">
              Aktif
            </CardTitle>
            <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 dark:text-green-400">{stats.active}</div>
            <p className="text-xs text-muted-foreground mt-1">Banner aktif</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-400">
              Impressions
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700 dark:text-purple-400">
              {stats.totalImpressions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total tayangan</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-400">
              Clicks
            </CardTitle>
            <MousePointerClick className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-700 dark:text-orange-400">
              {stats.totalClicks.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total klik</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
              Budget Spent
            </CardTitle>
            <DollarSign className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
              {formatCurrency(stats.totalBudget)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total terpakai</p>
          </CardContent>
        </Card>
      </div>

      {/* Banners Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Banner</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : banners.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="font-medium text-lg mb-2">Belum ada banner</p>
              <p className="text-sm mt-1 mb-4">
                Sistem akan otomatis membuat 8 banner default untuk semua posisi.<br />
                Anda tinggal mengganti gambar sesuai kebutuhan.
              </p>
              <div className="bg-muted/50 rounded-lg p-4 max-w-2xl mx-auto text-left">
                <p className="font-semibold mb-2 text-foreground">Banner yang akan dibuat:</p>
                <ul className="text-sm space-y-1">
                  {Object.entries(POSITION_CONFIG).map(([key, config]) => (
                    <li key={key} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>
                        <span className="font-medium text-foreground">{config.label}</span>
                        {' '}({config.dimensions}) - {config.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button 
                onClick={initializeDefaultBanners} 
                className="mt-6 gap-2"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LayoutGrid className="h-4 w-4" />
                )}
                Generate Semua Banner Sekarang
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Preview</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Posisi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Impressions</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="text-right">CTR</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      <div className="relative w-20 h-10 rounded overflow-hidden">
                        <Image
                          src={banner.imageUrl}
                          alt={banner.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{banner.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {POSITION_CONFIG[banner.position as keyof typeof POSITION_CONFIG]?.label || banner.position}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {banner.status === 'active' && (
                        <Badge className="bg-green-500">
                          <Eye className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      )}
                      {banner.status === 'pending' && (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                      {banner.status === 'paused' && (
                        <Badge variant="outline">
                          <Pause className="h-3 w-3 mr-1" />
                          Paused
                        </Badge>
                      )}
                      {banner.status === 'expired' && (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Expired
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{banner.impressions.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{banner.clicks.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{getCTR(banner.impressions, banner.clicks)}%</TableCell>
                    <TableCell className="text-right">
                      <div className="text-xs">
                        <div>{formatCurrency(banner.budgetSpent)}</div>
                        <div className="text-muted-foreground">/ {formatCurrency(banner.budgetTotal)}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {banner.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateStatus(banner.id, 'active')}
                            disabled={processing}
                            title="Activate"
                          >
                            <Play className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        {banner.status === 'active' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateStatus(banner.id, 'paused')}
                            disabled={processing}
                            title="Pause"
                          >
                            <Pause className="h-4 w-4 text-orange-600" />
                          </Button>
                        )}
                        {banner.status === 'paused' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateStatus(banner.id, 'active')}
                            disabled={processing}
                            title="Resume"
                          >
                            <Play className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(banner)}
                          disabled={processing}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteDialog({ open: true, banner })}
                          disabled={processing}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Banner' : 'Tambah Banner'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Nama banner"
              />
            </div>

            <div>
              <Label>Posisi *</Label>
              <Select
                value={form.position}
                onValueChange={(v) => setForm(f => ({ ...f, position: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(POSITION_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div>
                        <div className="font-medium">{config.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {config.dimensions} ({config.aspectRatio}) - {config.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Dimensi: {POSITION_CONFIG[form.position as keyof typeof POSITION_CONFIG]?.dimensions} 
                {' '}({POSITION_CONFIG[form.position as keyof typeof POSITION_CONFIG]?.aspectRatio})
              </p>
            </div>

            <div>
              <Label>Upload Gambar *</Label>
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Format: JPEG, PNG, WebP. Maksimal 5MB
              </p>
              {uploadingImage && (
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </div>
              )}
              {imagePreview && (
                <div className="mt-2 relative w-full h-32 rounded border overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-contain"
                  />
                </div>
              )}
            </div>

            <div>
              <Label>Target URL *</Label>
              <Input
                value={form.targetUrl}
                onChange={(e) => setForm(f => ({ ...f, targetUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tanggal Mulai *</Label>
                <Input
                  type="date"
                  value={form.startsAt}
                  onChange={(e) => setForm(f => ({ ...f, startsAt: e.target.value }))}
                />
              </div>
              <div>
                <Label>Tanggal Selesai</Label>
                <Input
                  type="date"
                  value={form.endsAt}
                  onChange={(e) => setForm(f => ({ ...f, endsAt: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label>Budget Total (Rp) *</Label>
              <Input
                type="number"
                value={form.budgetTotal}
                onChange={(e) => setForm(f => ({ ...f, budgetTotal: Number(e.target.value) }))}
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={processing || uploadingImage}>
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? 'Simpan' : 'Tambah'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, banner: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Banner?</AlertDialogTitle>
            <AlertDialogDescription>
              Yakin ingin menghapus banner "{deleteDialog.banner?.title}"? Tindakan ini tidak
              dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={processing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
