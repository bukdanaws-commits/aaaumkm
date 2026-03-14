'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Loader2, Image as ImageIcon, MapPin, Video } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  parentId?: string | null;
}

interface ListingFormProps {
  mode: 'create' | 'edit';
  listingId?: string;
  initialData?: {
    title: string;
    description: string;
    price: number;
    categoryId: string;
    subcategoryId?: string;
    condition: string;
    city: string;
    province: string;
    listingType: string;
    priceType?: string;
    videoUrl?: string;
    rentalPeriod?: string;
    rentalPrice?: number;
    images: { id: string; imageUrl: string; isPrimary: boolean }[];
  } | null;
}

const conditions = [
  { value: 'new', label: 'Baru' },
  { value: 'like_new', label: 'Seperti Baru' },
  { value: 'good', label: 'Baik' },
  { value: 'fair', label: 'Cukup' },
];

const listingTypes = [
  { value: 'sale', label: 'Dijual' },
  { value: 'rent', label: 'Disewakan' },
  { value: 'service', label: 'Jasa' },
  { value: 'wanted', label: 'Dicari' },
];

const priceTypes = [
  { value: 'fixed', label: 'Harga Pas' },
  { value: 'negotiable', label: 'Bisa Nego' },
  { value: 'auction', label: 'Lelang' },
];

const rentalPeriods = [
  { value: 'per_jam', label: 'Per Jam' },
  { value: 'per_hari', label: 'Per Hari' },
  { value: 'per_minggu', label: 'Per Minggu' },
  { value: 'per_bulan', label: 'Per Bulan' },
  { value: 'per_tahun', label: 'Per Tahun' },
];

export function ListingForm({ mode, listingId, initialData }: ListingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [kycLocation, setKycLocation] = useState<{ city: string; province: string } | null>(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    price: initialData?.price?.toString() || '',
    categoryId: initialData?.categoryId || '',
    subcategoryId: initialData?.subcategoryId || '',
    condition: initialData?.condition || 'new',
    city: initialData?.city || '',
    province: initialData?.province || '',
    listingType: initialData?.listingType || 'sale',
    priceType: initialData?.priceType || 'fixed',
    videoUrl: initialData?.videoUrl || '',
    rentalPeriod: initialData?.rentalPeriod || '',
    rentalPrice: initialData?.rentalPrice?.toString() || '',
  });

  const [images, setImages] = useState<string[]>(
    initialData?.images?.map(img => img.imageUrl) || []
  );
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch categories and KYC location on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const catRes = await fetch('/api/categories');
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.categories || catData);
        }

        // Fetch KYC location data
        const profileRes = await fetch('/api/profile');
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.kyc && profileData.kyc.city && profileData.kyc.province) {
            const location = {
              city: profileData.kyc.city,
              province: profileData.kyc.province,
            };
            setKycLocation(location);
            
            // Auto-fill location if not editing
            if (mode === 'create' && !initialData) {
              setFormData(prev => ({
                ...prev,
                city: location.city,
                province: location.province,
              }));
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, [mode, initialData]);

  const parentCategories = categories.filter(c => !c.parentId);
  const subcategories = categories.filter(c => c.parentId === formData.categoryId);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = mode === 'create'
        ? '/api/listing'
        : `/api/listing/${listingId}`;

      const method = mode === 'create' ? 'POST' : 'PUT';

      const payload = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        rentalPrice: formData.rentalPrice ? parseFloat(formData.rentalPrice) : null,
        subcategoryId: formData.subcategoryId || null,
        videoUrl: formData.videoUrl || null,
        rentalPeriod: formData.rentalPeriod || null,
        images,
        primaryImageIndex,
        status: 'active',
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save listing');
      }

      toast.success(mode === 'create' ? 'Iklan berhasil dibuat!' : 'Iklan berhasil diperbarui!');
      router.push(`/listing/${data.listing?.id || listingId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleImageAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipe file tidak valid. Hanya JPEG, PNG, WebP, dan GIF yang diperbolehkan.');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Ukuran file terlalu besar. Maksimal 5MB.');
      return;
    }

    // Limit number of images
    if (images.length >= 10) {
      toast.error('Maksimal 10 gambar per iklan.');
      return;
    }

    setUploadingImage(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('type', 'listing'); // Add type parameter for listing images

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setImages([...images, data.url]);
        toast.success('Gambar berhasil ditambahkan!');
      } else {
        throw new Error(data.error || 'Gagal upload gambar');
      }

      e.target.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal upload gambar');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageRemove = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    if (primaryImageIndex >= images.length - 1) {
      setPrimaryImageIndex(Math.max(0, images.length - 2));
    }
  };

  const formatCurrency = (value: string) => {
    const num = value.replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Foto Produk
          </CardTitle>
          <CardDescription>Upload hingga 10 foto produk. Foto pertama akan menjadi foto utama.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
            {images.map((img, index) => (
              <div
                key={index}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                  index === primaryImageIndex ? 'border-primary' : 'border-border'
                }`}
              >
                <img
                  src={img}
                  alt={`Product ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  {index !== primaryImageIndex && (
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="h-7 w-7"
                      onClick={() => setPrimaryImageIndex(index)}
                      title="Jadikan foto utama"
                    >
                      <span className="text-xs">★</span>
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="h-7 w-7"
                    onClick={() => handleImageRemove(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                {index === primaryImageIndex && (
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="default" className="text-xs">Utama</Badge>
                  </div>
                )}
              </div>
            ))}
            
            {images.length < 10 && (
              <label
                className={`aspect-square rounded-lg border-2 border-dashed ${
                  uploadingImage 
                    ? 'border-muted-foreground/25 cursor-not-allowed' 
                    : 'border-muted-foreground/25 hover:border-primary cursor-pointer'
                } flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors`}
              >
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleImageAdd}
                  disabled={uploadingImage}
                  className="hidden"
                />
                {uploadingImage ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-xs">Upload...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-6 w-6" />
                    <span className="text-xs text-center px-2">Tambah</span>
                  </>
                )}
              </label>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              • Format: JPEG, PNG, WebP, GIF (max 5MB per foto)
            </p>
            <p className="text-sm text-muted-foreground">
              • Maksimal 10 foto, klik bintang (★) untuk set foto utama
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Video URL */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Video (Opsional)
          </CardTitle>
          <CardDescription>Tambahkan link video YouTube untuk produk Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="https://youtube.com/watch?v=..."
            value={formData.videoUrl}
            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
          />
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Dasar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul Iklan *</Label>
            <Input
              id="title"
              placeholder="Contoh: iPhone 15 Pro Max 256GB Like New"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi *</Label>
            <Textarea
              id="description"
              placeholder="Jelaskan detail produk, spesifikasi, kondisi, alasan jual, dll..."
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Kategori *</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value, subcategoryId: '' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {parentCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {subcategories.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="subcategory">Sub Kategori</Label>
                <Select
                  value={formData.subcategoryId}
                  onValueChange={(value) => setFormData({ ...formData, subcategoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih sub kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="listingType">Tipe Iklan *</Label>
              <Select
                value={formData.listingType}
                onValueChange={(value) => setFormData({ ...formData, listingType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent>
                  {listingTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Kondisi *</Label>
              <Select
                value={formData.condition}
                onValueChange={(value) => setFormData({ ...formData, condition: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kondisi" />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map((cond) => (
                    <SelectItem key={cond.value} value={cond.value}>
                      {cond.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price & Type */}
      <Card>
        <CardHeader>
          <CardTitle>Harga & Tipe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priceType">Tipe Harga *</Label>
              <Select
                value={formData.priceType}
                onValueChange={(value) => setFormData({ ...formData, priceType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe harga" />
                </SelectTrigger>
                <SelectContent>
                  {priceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">
                {formData.priceType === 'auction' ? 'Harga Awal' : 'Harga'} (Rp) *
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                <Input
                  id="price"
                  placeholder="0"
                  value={formData.price ? formatCurrency(formData.price) : ''}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value.replace(/\D/g, '') })}
                  className="pl-12"
                  required
                />
              </div>
            </div>

            {formData.listingType === 'rent' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="rentalPrice">Harga Sewa (Rp)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                    <Input
                      id="rentalPrice"
                      placeholder="0"
                      value={formData.rentalPrice ? formatCurrency(formData.rentalPrice) : ''}
                      onChange={(e) => setFormData({ ...formData, rentalPrice: e.target.value.replace(/\D/g, '') })}
                      className="pl-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rentalPeriod">Periode Sewa</Label>
                  <Select
                    value={formData.rentalPeriod}
                    onValueChange={(value) => setFormData({ ...formData, rentalPeriod: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih periode" />
                    </SelectTrigger>
                    <SelectContent>
                      {rentalPeriods.map((period) => (
                        <SelectItem key={period.value} value={period.value}>
                          {period.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Location - Auto-filled from KYC */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Lokasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {kycLocation ? (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm text-muted-foreground mb-2">Lokasi diambil dari data KYC Anda:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <span className="text-xs text-muted-foreground">Kota/Kabupaten</span>
                    <p className="text-sm font-medium">{formData.city}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Provinsi</span>
                    <p className="text-sm font-medium">{formData.province}</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Lokasi tidak dapat diubah. Jika ingin mengubah lokasi, silakan update data KYC Anda di halaman profil.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Kota *</Label>
                <Input
                  id="city"
                  placeholder="Contoh: Jakarta Selatan"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">Provinsi *</Label>
                <Input
                  id="province"
                  placeholder="Contoh: DKI Jakarta"
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  required
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex gap-4 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
          className="rounded-full"
        >
          Batal
        </Button>
        <Button 
          type="submit" 
          disabled={loading}
          className="rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 hover:opacity-90"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Pasang Iklan' : 'Simpan Perubahan'}
        </Button>
      </div>
    </form>
  );
}
