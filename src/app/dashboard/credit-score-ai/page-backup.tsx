'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Shield, CheckCircle, XCircle, Clock, Loader2, AlertTriangle, Upload, MapPin, LucideIcon } from 'lucide-react';
import { useRegions } from '@/hooks/useRegions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const statusConfig: Record<string, { label: string; icon: LucideIcon; color: string }> = {
  not_submitted: { label: 'Belum Diajukan', icon: Upload, color: 'text-muted-foreground' },
  pending: { label: 'Menunggu Review', icon: Clock, color: 'text-yellow-600' },
  approved: { label: 'Terverifikasi', icon: CheckCircle, color: 'text-green-600' },
  rejected: { label: 'Ditolak', icon: XCircle, color: 'text-destructive' },
};

export default function DashboardKyc() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [kyc, setKyc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    provinces,
    regencies,
    districts,
    villages,
    loadingProvinces,
    loadingRegencies,
    loadingDistricts,
    loadingVillages,
    fetchRegencies,
    fetchDistricts,
    fetchVillages,
  } = useRegions();

  const [form, setForm] = useState({
    full_name: '',
    ktp_number: '',
    phone_number: '',
    provinceId: '',
    regencyId: '',
    districtId: '',
    villageId: '',
    full_address: '',
    ktp_image: null as File | null,
    selfie_image: null as File | null,
  });

  const [ktpPreview, setKtpPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  // Fetch KYC data
  useEffect(() => {
    async function fetchKyc() {
      if (!user) return;
      
      try {
        const response = await fetch('/api/kyc');
        if (response.ok) {
          const data = await response.json();
          if (data.kyc) {
            setKyc(data.kyc);
            const kycData = data.kyc;
            setForm({
              full_name: kycData.full_name || '',
              ktp_number: kycData.ktp_number || '',
              phone_number: kycData.phone_number || '',
              provinceId: kycData.provinceId || '',
              regencyId: kycData.regencyId || '',
              districtId: kycData.districtId || '',
              villageId: kycData.villageId || '',
              full_address: kycData.full_address || '',
              ktp_image: null,
              selfie_image: null,
            });
            // Load dependent regions
            if (kycData.provinceId) {
              fetchRegencies(kycData.provinceId);
            }
            if (kycData.regencyId) {
              fetchDistricts(kycData.regencyId);
            }
            if (kycData.districtId) {
              fetchVillages(kycData.districtId);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching KYC:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchKyc();
  }, [user]);

  if (authLoading || loading) {
    return (
      <DashboardLayout title="Verifikasi KYC" description="Verifikasi identitas Anda">
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

  const status = kyc?.status || 'not_submitted';
  const config = statusConfig[status] || statusConfig.not_submitted;
  const StatusIcon = config.icon;
  const canSubmit = status === 'not_submitted' || status === 'rejected';

  const handleSubmit = async () => {
    if (!form.full_name || !form.ktp_number || !form.phone_number || !form.provinceId || !form.regencyId || !form.ktp_image || !form.selfie_image) {
      toast({
        title: 'Data Tidak Lengkap',
        description: 'Mohon lengkapi semua field yang wajib diisi',
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);
    
    try {
      // Upload images first
      const formData = new FormData();
      formData.append('ktp_image', form.ktp_image);
      formData.append('selfie_image', form.selfie_image);
      
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Gagal upload gambar');
      }

      const uploadData = await uploadResponse.json();

      // Submit KYC data
      const response = await fetch('/api/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          ktp_image_url: uploadData.ktp_image_url,
          selfie_image_url: uploadData.selfie_image_url,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setKyc(data.kyc);
        toast({
          title: 'Berhasil!',
          description: 'Verifikasi KYC berhasil dikirim. Proses review membutuhkan 1-3 hari kerja.',
        });
      } else {
        throw new Error('Gagal mengirim verifikasi');
      }
    } catch (error) {
      console.error('Error submitting KYC:', error);
      toast({
        title: 'Gagal',
        description: 'Terjadi kesalahan saat mengirim verifikasi. Silakan coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKtpImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Terlalu Besar',
          description: 'Ukuran file maksimal 5MB',
          variant: 'destructive',
        });
        return;
      }
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Format File Salah',
          description: 'File harus berupa gambar (JPG, PNG, dll)',
          variant: 'destructive',
        });
        return;
      }
      setForm(p => ({ ...p, ktp_image: file }));
      
      // Generate preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setKtpPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelfieImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Terlalu Besar',
          description: 'Ukuran file maksimal 5MB',
          variant: 'destructive',
        });
        return;
      }
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Format File Salah',
          description: 'File harus berupa gambar (JPG, PNG, dll)',
          variant: 'destructive',
        });
        return;
      }
      setForm(p => ({ ...p, selfie_image: file }));
      
      // Generate preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelfiePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <DashboardLayout title="Verifikasi KYC" description="Verifikasi identitas untuk keamanan akun">
      {/* Status Card */}
      <Card className="mb-6">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="rounded-full p-3 bg-muted">
            <StatusIcon className={`h-8 w-8 ${config.color}`} />
          </div>
          <div>
            <p className="text-lg font-semibold">Status Verifikasi</p>
            <p className={`text-sm font-medium ${config.color}`}>{config.label}</p>
          </div>
        </CardContent>
      </Card>

      {status === 'rejected' && kyc?.rejection_reason && (
        <Card className="mb-6 border-destructive/50">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Alasan Penolakan</p>
              <p className="text-sm text-muted-foreground">{kyc.rejection_reason}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {status === 'approved' ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
            <p className="text-lg font-semibold">Identitas Anda Telah Terverifikasi</p>
            <p className="text-sm text-muted-foreground mt-1">Anda dapat mengakses semua fitur platform.</p>
          </CardContent>
        </Card>
      ) : canSubmit ? (
        <div className="space-y-6">
          {/* Section 1: Data Pribadi & Foto - 3 Columns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Data Pribadi & Foto
              </CardTitle>
              <CardDescription>Isi data sesuai KTP dan upload dokumen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Column 1: Nama & KTP */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nama Lengkap (sesuai KTP) *</Label>
                    <Input
                      value={form.full_name}
                      onChange={(e) => setForm(p => ({ ...p, full_name: e.target.value }))}
                      placeholder="Nama lengkap sesuai KTP"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nomor KTP *</Label>
                    <Input
                      value={form.ktp_number}
                      onChange={(e) => setForm(p => ({ ...p, ktp_number: e.target.value }))}
                      placeholder="3171XXXXXXXXXXXX"
                      maxLength={16}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nomor WhatsApp *</Label>
                    <Input
                      value={form.phone_number}
                      onChange={(e) => setForm(p => ({ ...p, phone_number: e.target.value }))}
                      placeholder="08xxxxxxxxxx"
                      type="tel"
                    />
                  </div>
                </div>

                {/* Column 2: Foto KTP */}
                <div className="space-y-2">
                  <Label>Foto KTP *</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary/50 transition-colors h-[180px] flex flex-col justify-center">
                    {ktpPreview ? (
                      <div className="space-y-2">
                        <img 
                          src={ktpPreview} 
                          alt="Preview KTP" 
                          className="max-h-[120px] mx-auto rounded-lg object-contain"
                        />
                        <p className="text-xs text-green-600 truncate">✓ {form.ktp_image?.name}</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                        <p className="text-xs text-muted-foreground mb-2">
                          Upload foto KTP
                        </p>
                      </>
                    )}
                    <Input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleKtpImageChange}
                      className="mt-2" 
                    />
                  </div>
                </div>

                {/* Column 3: Foto Selfie */}
                <div className="space-y-2">
                  <Label>Foto Selfie dengan KTP *</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary/50 transition-colors h-[180px] flex flex-col justify-center">
                    {selfiePreview ? (
                      <div className="space-y-2">
                        <img 
                          src={selfiePreview} 
                          alt="Preview Selfie" 
                          className="max-h-[120px] mx-auto rounded-lg object-contain"
                        />
                        <p className="text-xs text-green-600 truncate">✓ {form.selfie_image?.name}</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                        <p className="text-xs text-muted-foreground mb-2">
                          Selfie dengan KTP
                        </p>
                      </>
                    )}
                    <Input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleSelfieImageChange}
                      className="mt-2" 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Alamat - 3 Columns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Alamat (sesuai KTP)
              </CardTitle>
              <CardDescription>Pilih lokasi sesuai alamat di KTP Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Column 1: Provinsi & Kabupaten */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Provinsi *</Label>
                    <Select
                      value={form.provinceId}
                      onValueChange={(value) => {
                        setForm(p => ({ ...p, provinceId: value, regencyId: '', districtId: '', villageId: '' }));
                        fetchRegencies(value);
                      }}
                      disabled={loadingProvinces}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Provinsi" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map((province) => (
                          <SelectItem key={province.id} value={province.id}>
                            {province.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Kabupaten/Kota *</Label>
                    <Select
                      value={form.regencyId}
                      onValueChange={(value) => {
                        setForm(p => ({ ...p, regencyId: value, districtId: '', villageId: '' }));
                        fetchDistricts(value);
                      }}
                      disabled={!form.provinceId || loadingRegencies}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Kabupaten/Kota" />
                      </SelectTrigger>
                      <SelectContent>
                        {regencies.map((regency) => (
                          <SelectItem key={regency.id} value={regency.id}>
                            {regency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Column 2: Kecamatan & Kelurahan */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Kecamatan *</Label>
                    <Select
                      value={form.districtId}
                      onValueChange={(value) => {
                        setForm(p => ({ ...p, districtId: value, villageId: '' }));
                        fetchVillages(value);
                      }}
                      disabled={!form.regencyId || loadingDistricts}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Kecamatan" />
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map((district) => (
                          <SelectItem key={district.id} value={district.id}>
                            {district.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Kelurahan/Desa</Label>
                    <Select
                      value={form.villageId}
                      onValueChange={(value) => setForm(p => ({ ...p, villageId: value }))}
                      disabled={!form.districtId || loadingVillages}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Kelurahan/Desa" />
                      </SelectTrigger>
                      <SelectContent>
                        {villages.map((village) => (
                          <SelectItem key={village.id} value={village.id}>
                            {village.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Column 3: Alamat Lengkap */}
                <div className="space-y-2">
                  <Label>Alamat Lengkap</Label>
                  <Textarea
                    value={form.full_address}
                    onChange={(e) => setForm(p => ({ ...p, full_address: e.target.value }))}
                    placeholder="RT/RW, nama jalan, nomor rumah, dll."
                    rows={7}
                    className="resize-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting || 
              !form.full_name || 
              !form.ktp_number || 
              !form.phone_number ||
              !form.provinceId || 
              !form.regencyId || 
              !form.ktp_image || 
              !form.selfie_image
            }
            className="w-full rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 hover:opacity-90"
            size="lg"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Kirim Verifikasi
          </Button>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Clock className="h-16 w-16 text-yellow-600 mb-4" />
            <p className="text-lg font-semibold">Dokumen Sedang Direview</p>
            <p className="text-sm text-muted-foreground mt-1">Proses verifikasi membutuhkan 1-3 hari kerja.</p>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
