'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Zap, Edit, Sparkles, Search, Crown, LayoutDashboard, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const boostIconMap: Record<string, React.ElementType> = {
  highlight: Sparkles,
  top_search: Search,
  premium: Crown,
};

interface BoostType {
  id: string;
  type: string;
  name: string;
  description: string | null;
  creditsPerDay: number;
  multiplier: number;
  isActive: boolean;
}

interface PlatformSetting {
  id: string;
  key: string;
  value: string;
  description: string | null;
}

interface ActiveBoost {
  id: string;
  listingId: string;
  boostType: string;
  creditsCost: number;
  endsAt: string;
  listing: {
    title: string;
  } | null;
}

export default function AdminBoostSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  // Boost Types
  const [boostTypes, setBoostTypes] = useState<BoostType[]>([]);
  const [editItem, setEditItem] = useState<BoostType | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    creditsPerDay: 0,
    multiplier: 1,
    isActive: true,
  });

  // Platform Settings
  const [settings, setSettings] = useState<PlatformSetting[]>([]);
  const [editSetting, setEditSetting] = useState<PlatformSetting | null>(null);
  const [settingValue, setSettingValue] = useState('');

  // Premium Homepage
  const [premiumCount, setPremiumCount] = useState(6);
  const [savingPremiumCount, setSavingPremiumCount] = useState(false);

  // Active Boosts
  const [activeBoosts, setActiveBoosts] = useState<ActiveBoost[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/boost-settings');
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      setBoostTypes(data.boostTypes || []);
      setSettings(data.creditSettings || []);
      setPremiumCount(data.premiumCount || 6);
      setActiveBoosts(data.activeBoosts || []);
    } catch (error) {
      console.error('Error:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Gagal memuat data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openEdit = (item: BoostType) => {
    setEditItem(item);
    setForm({
      name: item.name,
      description: item.description || '',
      creditsPerDay: item.creditsPerDay,
      multiplier: item.multiplier || 1,
      isActive: item.isActive !== false,
    });
  };

  const saveBoostType = async () => {
    if (!editItem) return;

    try {
      const response = await fetch('/api/admin/boost-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_boost_type',
          data: {
            id: editItem.id,
            name: form.name,
            description: form.description,
            creditsPerDay: form.creditsPerDay,
            multiplier: form.multiplier,
            isActive: form.isActive,
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to save');

      toast({ title: 'Berhasil', description: 'Tipe boost diperbarui' });
      setEditItem(null);
      fetchData();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Gagal menyimpan' });
    }
  };

  const openSettingEdit = (setting: PlatformSetting) => {
    setEditSetting(setting);
    try {
      const parsed = JSON.parse(setting.value);
      setSettingValue(JSON.stringify(parsed, null, 2));
    } catch {
      setSettingValue(setting.value);
    }
  };

  const saveSetting = async () => {
    if (!editSetting) return;

    try {
      const parsed = JSON.parse(settingValue);
      
      const response = await fetch('/api/admin/boost-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_platform_setting',
          data: {
            id: editSetting.id,
            value: parsed,
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to save');

      toast({ title: 'Berhasil', description: 'Pengaturan diperbarui' });
      setEditSetting(null);
      fetchData();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Format JSON tidak valid atau gagal menyimpan' });
    }
  };

  const savePremiumCount = async () => {
    setSavingPremiumCount(true);
    try {
      const response = await fetch('/api/admin/boost-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_premium_count',
          data: { count: premiumCount },
        }),
      });

      if (!response.ok) throw new Error('Failed to save');

      toast({ title: 'Berhasil', description: `Jumlah card premium di homepage: ${premiumCount}` });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Gagal menyimpan' });
    } finally {
      setSavingPremiumCount(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Boost & Credit Settings</h1>
        <p className="text-sm text-muted-foreground">Kelola tipe boost dan pengaturan kredit</p>
      </div>

      {/* Premium Homepage Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            Pengaturan Iklan Premium Homepage
          </CardTitle>
          <CardDescription>Atur jumlah card iklan premium yang tampil di halaman utama</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="space-y-2">
              <Label>Jumlah Card Premium di Homepage</Label>
              <Input
                type="number"
                min={1}
                max={24}
                value={premiumCount}
                onChange={(e) => setPremiumCount(+e.target.value)}
                className="w-32"
              />
              <p className="text-xs text-muted-foreground">
                Iklan dengan boost "Premium" aktif akan muncul di section khusus setelah kategori di halaman utama.
              </p>
            </div>
            <Button 
              onClick={savePremiumCount} 
              disabled={savingPremiumCount}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full"
            >
              {savingPremiumCount ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Boosts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Boost Aktif ({activeBoosts.length})
          </CardTitle>
          <CardDescription>Daftar iklan yang sedang di-boost</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Iklan</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Kredit</TableHead>
                  <TableHead>Berakhir</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeBoosts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Tidak ada boost aktif
                    </TableCell>
                  </TableRow>
                ) : (
                  activeBoosts.map((boost) => {
                    const Icon = boostIconMap[boost.boostType] || Zap;
                    return (
                      <TableRow key={boost.id}>
                        <TableCell className="font-medium truncate max-w-[200px]">
                          {boost.listing?.title || boost.listingId.slice(0, 8)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-primary" />
                            <Badge variant="outline">{boost.boostType}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>{boost.creditsCost}</TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(boost.endsAt), 'dd MMM yyyy', { locale: idLocale })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">Active</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Boost Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Tipe Boost ({boostTypes.length})
          </CardTitle>
          <CardDescription>Kelola tipe boost yang tersedia di platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Tipe</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Kredit/Hari</TableHead>
                  <TableHead>Multiplier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {boostTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Tidak ada tipe boost
                    </TableCell>
                  </TableRow>
                ) : (
                  boostTypes.map((bt) => {
                    const Icon = boostIconMap[bt.type] || Zap;
                    return (
                      <TableRow key={bt.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-primary" />
                            <Badge variant="outline">{bt.type}</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{bt.name}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground">
                          {bt.description || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{bt.creditsPerDay} kredit</Badge>
                        </TableCell>
                        <TableCell>{bt.multiplier || 1}x</TableCell>
                        <TableCell>
                          <Badge variant={bt.isActive !== false ? 'default' : 'secondary'}>
                            {bt.isActive !== false ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => openEdit(bt)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Platform Credit Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Pengaturan Kredit Platform
          </CardTitle>
          <CardDescription>Kelola pengaturan kredit dan biaya platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Key</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Nilai</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Tidak ada pengaturan kredit
                    </TableCell>
                  </TableRow>
                ) : (
                  settings.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-xs">{s.key}</TableCell>
                      <TableCell className="text-muted-foreground">{s.description || '-'}</TableCell>
                      <TableCell>
                        <code className="bg-muted px-2 py-1 rounded text-xs">
                          {s.value.length > 50 ? s.value.slice(0, 50) + '...' : s.value}
                        </code>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => openSettingEdit(s)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Boost Type Dialog */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tipe Boost</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nama</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Deskripsi</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Kredit/Hari</Label>
                <Input
                  type="number"
                  value={form.creditsPerDay}
                  onChange={(e) => setForm({ ...form, creditsPerDay: +e.target.value })}
                />
              </div>
              <div>
                <Label>Multiplier</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.multiplier}
                  onChange={(e) => setForm({ ...form, multiplier: +e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>
              Batal
            </Button>
            <Button 
              onClick={saveBoostType}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Setting Dialog */}
      <Dialog open={!!editSetting} onOpenChange={() => setEditSetting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Pengaturan: {editSetting?.key}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nilai (JSON)</Label>
              <Textarea
                className="font-mono text-sm"
                rows={6}
                value={settingValue}
                onChange={(e) => setSettingValue(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">Format harus valid JSON</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSetting(null)}>
              Batal
            </Button>
            <Button 
              onClick={saveSetting}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
