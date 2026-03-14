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
  Plus, Pencil, Trash2, FolderTree, Layers, Loader2, 
  AlertCircle, Package, Star, Eye, EyeOff 
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

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  parentId: string | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  listingCount: number;
  createdAt: string;
}

const generateSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; category: Category | null }>({
    open: false,
    category: null,
  });
  const [editing, setEditing] = useState<Category | null>(null);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    iconUrl: '',
    parentId: null as string | null,
    isActive: true,
    isFeatured: false,
    sortOrder: 0,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/categories');
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const data = await response.json();
      setCategories(data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat kategori',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  const parentCategories = categories.filter((c) => !c.parentId);
  const getSubcategories = (parentId: string) =>
    categories.filter((c) => c.parentId === parentId);

  // Calculate stats
  const stats = {
    total: categories.length,
    active: categories.filter(c => c.isActive).length,
    featured: categories.filter(c => c.isFeatured).length,
    totalListings: categories.reduce((sum, c) => sum + c.listingCount, 0),
  };

  const openCreate = (parentId?: string) => {
    setEditing(null);
    setForm({
      name: '',
      slug: '',
      description: '',
      iconUrl: '',
      parentId: parentId || null,
      isActive: true,
      isFeatured: false,
      sortOrder: 0,
    });
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      iconUrl: cat.iconUrl || '',
      parentId: cat.parentId || null,
      isActive: cat.isActive,
      isFeatured: cat.isFeatured,
      sortOrder: cat.sortOrder || 0,
    });
    setDialogOpen(true);
  };

  const handleNameChange = (name: string) => {
    setForm((f) => ({
      ...f,
      name,
      slug: editing ? f.slug : generateSlug(name),
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      toast({
        title: 'Error',
        description: 'Nama dan slug wajib diisi',
        variant: 'destructive',
      });
      return;
    }

    try {
      setProcessing(true);
      
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description || null,
        iconUrl: form.iconUrl || null,
        parentId: form.parentId || null,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        sortOrder: form.sortOrder,
      };

      const url = editing 
        ? `/api/admin/categories/${editing.id}`
        : '/api/admin/categories';
      
      const method = editing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save category');
      }

      toast({
        title: 'Berhasil',
        description: editing ? 'Kategori berhasil diupdate' : 'Kategori berhasil ditambahkan',
      });

      setDialogOpen(false);
      fetchCategories();
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
    if (!deleteDialog.category) return;

    const subs = getSubcategories(deleteDialog.category.id);
    if (subs.length > 0) {
      toast({
        title: 'Error',
        description: `Tidak bisa menghapus "${deleteDialog.category.name}" karena masih memiliki subkategori`,
        variant: 'destructive',
      });
      setDeleteDialog({ open: false, category: null });
      return;
    }

    try {
      setProcessing(true);
      const response = await fetch(`/api/admin/categories/${deleteDialog.category.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      toast({
        title: 'Berhasil',
        description: 'Kategori berhasil dihapus',
      });

      setDeleteDialog({ open: false, category: null });
      fetchCategories();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menghapus kategori',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !current }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle status');
      }

      fetchCategories();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal mengubah status',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FolderTree className="h-8 w-8" />
            Manajemen Kategori
          </h1>
          <p className="text-muted-foreground">Kelola kategori dan subkategori produk</p>
        </div>
        <Button onClick={() => openCreate()} className="gap-2 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 hover:from-blue-700 hover:via-purple-700 hover:to-purple-800">
          <Plus className="h-4 w-4" />
          Tambah Kategori
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Categories - Blue */}
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
              Total Kategori
            </CardTitle>
            <FolderTree className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Semua kategori</p>
          </CardContent>
        </Card>

        {/* Active - Green */}
        <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">
              Aktif
            </CardTitle>
            <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 dark:text-green-400">{stats.active}</div>
            <p className="text-xs text-muted-foreground mt-1">Kategori aktif</p>
          </CardContent>
        </Card>

        {/* Featured - Yellow */}
        <Card className="border-l-4 border-l-yellow-500 bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
              Featured
            </CardTitle>
            <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">{stats.featured}</div>
            <p className="text-xs text-muted-foreground mt-1">Kategori unggulan</p>
          </CardContent>
        </Card>

        {/* Total Listings - Purple */}
        <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-400">
              Total Listing
            </CardTitle>
            <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700 dark:text-purple-400">{stats.totalListings}</div>
            <p className="text-xs text-muted-foreground mt-1">Semua listing</p>
          </CardContent>
        </Card>
      </div>

      {/* Categories List */}
      {loading ? (
        <Card>
          <CardContent className="flex justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </CardContent>
        </Card>
      ) : parentCategories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FolderTree className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Belum ada kategori</p>
            <p className="text-sm mt-1">Klik "Tambah Kategori" untuk memulai</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {parentCategories.map((parent) => {
            const subs = getSubcategories(parent.id);
            return (
              <Card key={parent.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Layers className="h-4 w-4 text-primary" />
                      {parent.name}
                      {!parent.isActive && (
                        <Badge variant="secondary" className="text-xs">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Nonaktif
                        </Badge>
                      )}
                      {parent.isFeatured && (
                        <Badge className="text-xs bg-yellow-500">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground font-normal">
                        ({parent.listingCount} listing)
                      </span>
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openCreate(parent.id)}
                        className="gap-1 text-xs"
                      >
                        <Plus className="h-3 w-3" />
                        Sub
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(parent)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Switch
                        checked={parent.isActive}
                        onCheckedChange={() => toggleActive(parent.id, parent.isActive)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteDialog({ open: true, category: parent })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {subs.length > 0 && (
                  <CardContent className="pt-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama</TableHead>
                          <TableHead>Slug</TableHead>
                          <TableHead className="text-center">Listing</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subs.map((sub) => (
                          <TableRow key={sub.id}>
                            <TableCell className="font-medium">
                              {sub.name}
                              {sub.isFeatured && (
                                <Star className="h-3 w-3 inline ml-1 text-yellow-500" />
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs">
                              {sub.slug}
                            </TableCell>
                            <TableCell className="text-center">{sub.listingCount}</TableCell>
                            <TableCell className="text-center">
                              <Switch
                                checked={sub.isActive}
                                onCheckedChange={() => toggleActive(sub.id, sub.isActive)}
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEdit(sub)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => setDeleteDialog({ open: true, category: sub })}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing
                ? 'Edit Kategori'
                : form.parentId
                ? 'Tambah Subkategori'
                : 'Tambah Kategori'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nama *</Label>
              <Input
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Nama kategori"
              />
            </div>
            <div>
              <Label>Slug *</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="slug-kategori"
              />
            </div>
            <div>
              <Label>Deskripsi</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Deskripsi kategori"
                rows={2}
              />
            </div>
            <div>
              <Label>Parent Kategori</Label>
              <Select
                value={form.parentId || 'none'}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, parentId: v === 'none' ? null : v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih parent (opsional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Tidak ada (Kategori utama)</SelectItem>
                  {parentCategories
                    .filter((c) => c.id !== editing?.id)
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Icon URL</Label>
              <Input
                value={form.iconUrl}
                onChange={(e) => setForm((f) => ({ ...f, iconUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Urutan</Label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))
                }
              />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
                />
                <Label>Aktif</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isFeatured}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, isFeatured: v }))}
                />
                <Label>Featured</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={processing}>
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? 'Simpan' : 'Tambah'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, category: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kategori?</AlertDialogTitle>
            <AlertDialogDescription>
              Yakin ingin menghapus kategori "{deleteDialog.category?.name}"? Tindakan ini tidak
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
