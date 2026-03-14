'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings, Save, Globe, Bell, Shield, Coins, Loader2, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminSettings() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    site_name: 'UMKM ID',
    site_email: 'admin@umkm.id',
    maintenance_mode: false,
    registration_enabled: true,
    email_notifications: true,
    kyc_required: false,
    min_withdrawal: 50000,
    platform_fee: 5,
    initial_user_credits: 500,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings((prev) => ({ ...prev, ...data.settings }));
      } else {
        toast({
          variant: 'destructive',
          title: 'Gagal memuat pengaturan',
          description: 'Terjadi kesalahan saat memuat data',
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        variant: 'destructive',
        title: 'Gagal memuat pengaturan',
        description: 'Terjadi kesalahan saat memuat data',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSetting = async (key: string, value: any, description?: string) => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value, description }),
      });

      if (response.ok) {
        return true;
      } else {
        throw new Error('Failed to save setting');
      }
    } catch (error) {
      console.error('Error saving setting:', error);
      return false;
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const promises = Object.entries(settings).map(([key, value]) =>
        saveSetting(key, value)
      );

      const results = await Promise.all(promises);
      const allSuccess = results.every((r) => r);

      if (allSuccess) {
        toast({
          title: 'Berhasil',
          description: 'Semua pengaturan berhasil disimpan',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Sebagian gagal',
          description: 'Beberapa pengaturan gagal disimpan',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Gagal menyimpan',
        description: 'Terjadi kesalahan saat menyimpan pengaturan',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSingle = async (key: string, value: any, label: string) => {
    const success = await saveSetting(key, value);
    if (success) {
      toast({
        title: 'Berhasil',
        description: `${label} berhasil disimpan`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Gagal',
        description: `Gagal menyimpan ${label}`,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Pengaturan</h1>
          <p className="text-muted-foreground">Pengaturan platform</p>
        </div>
        <div className="space-y-6 max-w-3xl">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64 mt-2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan</h1>
        <p className="text-muted-foreground">Pengaturan platform</p>
      </div>

      <div className="space-y-6 max-w-3xl">
        {/* Initial Credits Setting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Kredit User Baru
            </CardTitle>
            <CardDescription>
              Jumlah kredit yang diberikan otomatis saat user baru mendaftar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-3">
              <div className="space-y-2 flex-1 max-w-xs">
                <Label>Jumlah Kredit Awal</Label>
                <Input
                  type="number"
                  min={0}
                  max={100000}
                  value={settings.initial_user_credits}
                  onChange={(e) =>
                    setSettings({ ...settings, initial_user_credits: Number(e.target.value) })
                  }
                />
              </div>
              <Button
                onClick={() =>
                  handleSaveSingle(
                    'initial_user_credits',
                    settings.initial_user_credits,
                    'Kredit awal user'
                  )
                }
              >
                <Save className="h-4 w-4 mr-2" />
                Simpan
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Setiap user baru yang mendaftar akan otomatis mendapatkan{' '}
              {settings.initial_user_credits} kredit.
            </p>
          </CardContent>
        </Card>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Pengaturan Umum
            </CardTitle>
            <CardDescription>Pengaturan dasar platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Nama Situs</Label>
                <Input
                  value={settings.site_name}
                  onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email Admin</Label>
                <Input
                  type="email"
                  value={settings.site_email}
                  onChange={(e) => setSettings({ ...settings, site_email: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Mode Maintenance</Label>
                <p className="text-sm text-muted-foreground">
                  Aktifkan untuk menonaktifkan akses publik
                </p>
              </div>
              <Switch
                checked={settings.maintenance_mode}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, maintenance_mode: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Registrasi Pengguna</Label>
                <p className="text-sm text-muted-foreground">Izinkan pengguna baru mendaftar</p>
              </div>
              <Switch
                checked={settings.registration_enabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, registration_enabled: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Financial Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Pengaturan Keuangan
            </CardTitle>
            <CardDescription>Pengaturan terkait transaksi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Minimum Penarikan (Rp)</Label>
                <Input
                  type="number"
                  value={settings.min_withdrawal}
                  onChange={(e) =>
                    setSettings({ ...settings, min_withdrawal: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Biaya Platform (%)</Label>
                <Input
                  type="number"
                  value={settings.platform_fee}
                  onChange={(e) =>
                    setSettings({ ...settings, platform_fee: Number(e.target.value) })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Pengaturan Keamanan
            </CardTitle>
            <CardDescription>Pengaturan verifikasi dan keamanan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Wajib KYC untuk Withdraw</Label>
                <p className="text-sm text-muted-foreground">
                  Pengguna harus KYC sebelum withdraw
                </p>
              </div>
              <Switch
                checked={settings.kyc_required}
                onCheckedChange={(checked) => setSettings({ ...settings, kyc_required: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Pengaturan Notifikasi
            </CardTitle>
            <CardDescription>Pengaturan email dan notifikasi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Notifikasi Email</Label>
                <p className="text-sm text-muted-foreground">Kirim notifikasi via email</p>
              </div>
              <Switch
                checked={settings.email_notifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, email_notifications: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Tampilan
            </CardTitle>
            <CardDescription>Pengaturan tema dan tampilan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Mode Tema</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih tema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light Mode</SelectItem>
                  <SelectItem value="dark">Dark Mode</SelectItem>
                  <SelectItem value="system">System (Auto)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Pilih tema tampilan untuk admin dashboard
              </p>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSaveAll} disabled={isSaving} className="w-full md:w-auto">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Simpan Semua Pengaturan
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
