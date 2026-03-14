'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Camera,
  Loader2,
  User,
  Shield,
  MapPin,
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  FileText,
  Edit3,
  Save,
  X
} from 'lucide-react';

interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  phone_number: string | null;
  address: string | null;
  postal_code: string | null;
  avatar_url: string | null;
}

interface Kyc {
  id: string;
  full_name: string | null;
  ktp_number: string | null;
  province: string | null;
  city: string | null;
  district: string | null;
  village: string | null;
  full_address: string | null;
  ktp_image_url: string | null;
  selfie_image_url: string | null;
  status: string;
  rejection_reason: string | null;
}

const kycStatusConfig: Record<string, { label: string; icon: typeof Upload; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  not_submitted: { label: 'Belum Diajukan', icon: Upload, variant: 'outline' },
  pending: { label: 'Menunggu Review', icon: Clock, variant: 'secondary' },
  approved: { label: 'Terverifikasi', icon: CheckCircle, variant: 'default' },
  rejected: { label: 'Ditolak', icon: XCircle, variant: 'destructive' },
};

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">
        {value || <span className="text-muted-foreground/50 italic">Belum diisi</span>}
      </span>
    </div>
  );
}

function DocPreview({ label, hasDoc }: { label: string; hasDoc: boolean }) {
  return (
    <div className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-muted/30">
      {hasDoc ? (
        <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
      ) : (
        <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
      )}
      <span className="text-sm text-foreground">{label}</span>
      <span className="text-xs text-muted-foreground ml-auto">
        {hasDoc ? 'Terupload' : 'Belum ada'}
      </span>
    </div>
  );
}

function maskKtp(ktp: string): string {
  if (ktp.length <= 6) return ktp;
  return ktp.slice(0, 4) + '****' + ktp.slice(-4);
}

export default function DashboardProfile() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [kyc, setKyc] = useState<Kyc | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Edit modes per section
  const [editingProfile, setEditingProfile] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: '',
    phone_number: '',
    address: '',
    postal_code: '',
  });

  // Fetch profile and KYC data
  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          setProfile(data.profile);
          setKyc(data.kyc);
          setProfileForm({
            name: data.profile.name || '',
            phone_number: data.profile.phone_number || '',
            address: data.profile.address || '',
            postal_code: data.profile.postal_code || '',
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  if (authLoading || loading) {
    return (
      <DashboardLayout title="Profil" description="Kelola informasi profil dan verifikasi identitas">
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    router.push('/auth');
    return null;
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Format File Salah',
        description: 'File harus berupa gambar',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Terlalu Besar',
        description: 'Ukuran file maksimal 5MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      // Upload avatar
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Gagal upload foto');
      }

      const uploadData = await uploadResponse.json();

      // Update profile with new avatar URL
      const updateResponse = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: uploadData.url }),
      });

      if (updateResponse.ok) {
        const data = await updateResponse.json();
        setProfile(data.profile);
        toast({ title: 'Foto profil berhasil diupdate' });
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Gagal',
        description: 'Terjadi kesalahan saat upload foto',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        toast({ title: 'Profil berhasil disimpan' });
        setEditingProfile(false);
      } else {
        throw new Error('Gagal menyimpan profil');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Gagal',
        description: 'Terjadi kesalahan saat menyimpan profil',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const kycStatus = kyc?.status || 'not_submitted';
  const kycConfig = kycStatusConfig[kycStatus] || kycStatusConfig.not_submitted;
  const KycStatusIcon = kycConfig.icon;

  return (
    <DashboardLayout title="Profil" description="Kelola informasi profil dan verifikasi identitas">
      <div className="max-w-3xl space-y-6">
        {/* ===== SECTION 1: Header Profil ===== */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="relative shrink-0">
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {profile?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 shadow-md transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                </label>
              </div>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-xl font-bold text-foreground">{profile?.name || 'Nama belum diisi'}</h2>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2 justify-center sm:justify-start">
                  <Badge variant={kycConfig.variant} className="gap-1">
                    <KycStatusIcon className="h-3 w-3" />
                    KYC: {kycConfig.label}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ===== SECTION 2: Info Akun ===== */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Informasi Akun</CardTitle>
              </div>
              {!editingProfile ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingProfile(true)}
                  className="gap-1.5 text-xs rounded-full"
                >
                  <Edit3 className="h-3.5 w-3.5" /> Edit
                </Button>
              ) : (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingProfile(false);
                      setProfileForm({
                        name: profile?.name || '',
                        phone_number: profile?.phone_number || '',
                        address: profile?.address || '',
                        postal_code: profile?.postal_code || '',
                      });
                    }}
                    className="rounded-full"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="gap-1.5 text-xs rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 hover:opacity-90"
                  >
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    Simpan
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {editingProfile ? (
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>ID Akun</Label>
                  <Input value={user?.id || ''} disabled className="font-mono text-xs" />
                </div>
                <div className="space-y-2">
                  <Label>Nama Lengkap</Label>
                  <Input
                    value={profileForm.name}
                    onChange={(e) => setProfileForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user?.email || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Nomor Telepon</Label>
                  <Input
                    value={profileForm.phone_number}
                    onChange={(e) => setProfileForm(p => ({ ...p, phone_number: e.target.value }))}
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Alamat</Label>
                  <Textarea
                    value={profileForm.address}
                    onChange={(e) => setProfileForm(p => ({ ...p, address: e.target.value }))}
                    placeholder="Masukkan alamat lengkap"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kode Pos</Label>
                  <Input
                    value={profileForm.postal_code}
                    onChange={(e) => setProfileForm(p => ({ ...p, postal_code: e.target.value }))}
                    placeholder="Contoh: 57762"
                    maxLength={5}
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-3">
                <InfoRow label="ID Akun" value={user?.id} />
                <InfoRow label="Nama Lengkap" value={profile?.name} />
                <InfoRow label="Email" value={profile?.email} />
                <InfoRow label="Nomor Telepon" value={profile?.phone_number} />
                <InfoRow label="Alamat" value={profile?.address} />
                <InfoRow label="Kode Pos" value={profile?.postal_code} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* ===== SECTION 3: KYC - Data Pribadi ===== */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Data Identitas (KYC)</CardTitle>
              </div>
              {kycStatus === 'not_submitted' && (
                <Button
                  size="sm"
                  onClick={() => router.push('/dashboard/kyc')}
                  className="gap-1.5 text-xs rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 hover:opacity-90"
                >
                  <Upload className="h-3.5 w-3.5" /> Isi Data KYC
                </Button>
              )}
              {kycStatus === 'rejected' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/dashboard/kyc')}
                  className="gap-1.5 text-xs rounded-full"
                >
                  <Edit3 className="h-3.5 w-3.5" /> Perbaiki
                </Button>
              )}
            </div>
            <CardDescription>Data sesuai KTP untuk verifikasi identitas</CardDescription>
          </CardHeader>
          <CardContent>
            {kycStatus === 'rejected' && kyc?.rejection_reason && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 mb-4">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-destructive">Alasan Penolakan</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{kyc.rejection_reason}</p>
                </div>
              </div>
            )}

            {kycStatus === 'pending' && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border mb-4">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Dokumen Anda sedang direview. Proses membutuhkan 1-3 hari kerja.
                </p>
              </div>
            )}

            {kycStatus === 'not_submitted' ? (
              <div className="flex flex-col items-center py-8">
                <Upload className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-4">Belum ada data KYC</p>
                <Button
                  onClick={() => router.push('/dashboard/kyc')}
                  className="rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 hover:opacity-90"
                >
                  Mulai Verifikasi
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Data Pribadi */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" /> Data Pribadi
                  </h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <InfoRow label="Nama (KTP)" value={kyc?.full_name} />
                    <InfoRow label="Nomor KTP" value={kyc?.ktp_number ? maskKtp(kyc.ktp_number) : null} />
                  </div>
                </div>

                <Separator />

                {/* Alamat KTP */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Alamat KTP
                  </h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <InfoRow label="Provinsi" value={kyc?.province} />
                    <InfoRow label="Kabupaten/Kota" value={kyc?.city} />
                    <InfoRow label="Kecamatan" value={kyc?.district} />
                    <InfoRow label="Kelurahan/Desa" value={kyc?.village} />
                  </div>
                  <InfoRow label="Alamat Lengkap" value={kyc?.full_address} />
                </div>

                <Separator />

                {/* Dokumen */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Upload className="h-3.5 w-3.5" /> Dokumen
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <DocPreview label="Foto KTP" hasDoc={!!kyc?.ktp_image_url} />
                    <DocPreview label="Selfie + KTP" hasDoc={!!kyc?.selfie_image_url} />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
