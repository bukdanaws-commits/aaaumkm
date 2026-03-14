'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { ImageGallery } from '@/components/listing/ImageGallery';
import { SellerCard } from '@/components/listing/SellerCard';
import { ProductSpecs } from '@/components/listing/ProductSpecs';
import { ReviewSection } from '@/components/listing/ReviewSection';
import { RelatedProducts } from '@/components/listing/RelatedProducts';
import { SocialShareButtons } from '@/components/listing/SocialShareButtons';
import { AdBanner } from '@/components/ads/AdBanner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  MapPin, Eye, Clock, Heart, Flag, 
  Gavel, Timer, ShoppingCart, Sparkles, Tag, CheckCircle, AlertTriangle,
  MessageCircle, Shield, Phone, Package
} from 'lucide-react';
import { formatDistanceToNow, differenceInSeconds } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// ===== Types =====
interface ListingImage {
  id: string;
  imageUrl: string;
  isPrimary: boolean;
  sortOrder: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Seller {
  userId: string;
  name: string;
  avatarUrl: string | null;
  city: string | null;
  province: string | null;
  isVerified: boolean;
  averageRating: number;
  totalReviews: number;
  totalListings: number;
  soldCount: number;
  phone: string | null;
  createdAt: string;
}

interface Auction {
  id: string;
  startingPrice: number;
  currentPrice: number;
  minIncrement: number;
  endsAt: string;
  status: string;
  totalBids: number;
  buyNowPrice: number | null;
}

interface Listing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  priceType: string;
  listingType: string;
  condition: string;
  status: string;
  city: string | null;
  province: string | null;
  viewCount: number;
  favoriteCount: number;
  isFeatured: boolean;
  createdAt: string;
  userId: string;
  images: ListingImage[];
  category: Category | null;
  profile: Seller;
  auction: Auction | null;
  boosts: Array<{ boostType: string }>;
}

const conditionConfig: Record<string, { label: string; color: string; description: string }> = {
  new: { label: 'Baru', color: 'bg-emerald-500', description: 'Barang baru, belum pernah dipakai' },
  like_new: { label: 'Seperti Baru', color: 'bg-blue-500', description: 'Bekas tapi masih sangat bagus' },
  good: { label: 'Bagus', color: 'bg-amber-500', description: 'Kondisi baik, ada tanda pemakaian wajar' },
  fair: { label: 'Cukup', color: 'bg-gray-500', description: 'Masih berfungsi dengan baik' },
};

const priceTypeLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  fixed: { label: 'Harga Pas', icon: <Tag className="h-4 w-4" /> },
  negotiable: { label: 'Bisa Nego', icon: <Sparkles className="h-4 w-4" /> },
  auction: { label: 'Lelang', icon: <Gavel className="h-4 w-4" /> },
};

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const listingId = params.id as string;

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [bidding, setBidding] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [activeTab, setActiveTab] = useState('deskripsi');

  // Fetch listing data
  useEffect(() => {
    if (listingId) {
      fetchListing();
    }
  }, [listingId]);

  // Auction timer
  useEffect(() => {
    if (!listing?.auction || listing.auction.status !== 'active') return;

    const updateTimer = () => {
      const now = new Date();
      const end = new Date(listing.auction!.endsAt);
      const diff = differenceInSeconds(end, now);

      if (diff <= 0) {
        setTimeLeft('Lelang Berakhir');
        return;
      }

      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      if (days > 0) {
        setTimeLeft(`${days}h ${hours}j ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}j ${minutes}m ${seconds}d`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}d`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [listing?.auction]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/listing/${listingId}`);
      if (!response.ok) throw new Error('Listing not found');
      const data = await response.json();
      setListing(data.listing);
      setIsSaved(data.listing.isSaved || false);
      
      if (data.listing.auction) {
        setBidAmount(String(data.listing.auction.currentPrice + data.listing.auction.minIncrement));
      }
    } catch (err) {
      console.error('Failed to fetch listing:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleSave = async () => {
    if (!user) {
      toast.error('Silakan login terlebih dahulu');
      router.push('/auth');
      return;
    }
    setSaving(true);
    // Toggle save state
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Dihapus dari wishlist' : 'Disimpan ke wishlist');
    setSaving(false);
  };

  const handleWhatsApp = () => {
    const sellerPhone = listing?.profile?.phone;
    if (!sellerPhone) {
      toast.error('Nomor WhatsApp tidak tersedia');
      return;
    }

    let phone = sellerPhone.replace(/\D/g, '');
    if (phone.startsWith('0')) phone = '62' + phone.substring(1);
    else if (!phone.startsWith('62')) phone = '62' + phone;

    const message = encodeURIComponent(
      `Halo kak, saya tertarik dengan produk "${listing?.title}" yang dijual seharga ${formatPrice(listing?.price || 0)}. Apakah masih tersedia? Terima kasih 🙏`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleBid = async () => {
    if (!user) {
      toast.error('Silakan login terlebih dahulu');
      router.push('/auth');
      return;
    }

    if (!listing?.auction) return;

    const amount = parseInt(bidAmount);
    const minBid = listing.auction.currentPrice + listing.auction.minIncrement;

    if (amount < minBid) {
      toast.error(`Bid minimal adalah ${formatPrice(minBid)}`);
      return;
    }

    setBidding(true);
    try {
      const res = await fetch(`/api/listing/${listingId}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      if (res.ok) {
        toast.success(`Bid ${formatPrice(amount)} berhasil!`);
        fetchListing();
      } else {
        const error = await res.json();
        toast.error(error.message || 'Gagal mengajukan bid');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setBidding(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="aspect-video w-full rounded-xl" />
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="w-20 h-20 rounded-lg" />
                ))}
              </div>
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Not found
  if (!listing) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Iklan tidak ditemukan</h1>
            <p className="text-muted-foreground mb-6">Iklan yang Anda cari mungkin sudah tidak tersedia.</p>
            <Button onClick={() => router.push('/marketplace')}>Kembali ke Marketplace</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const condition = listing.condition || 'good';
  const conditionData = conditionConfig[condition] || conditionConfig.good;
  const priceTypeData = priceTypeLabels[listing.priceType] || priceTypeLabels.fixed;
  const location = listing.city || listing.province || 'Indonesia';
  const isOwnListing = listing.userId === user?.id;
  const isAuction = listing.priceType === 'auction' && listing.auction;

  return (
    <MainLayout>
      {/* Inline Ad Banner - 2 Grid Layout */}
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          <div className="lg:col-span-2">
            <AdBanner position="home-inline" showPlaceholder={false} />
          </div>
          <div className="lg:col-span-1">
            <AdBanner position="home-inline-sidebar" showPlaceholder={false} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Status Banner */}
        {listing.status !== 'active' && (
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950">
            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 shrink-0" />
            <div>
              <p className="font-semibold text-orange-800 dark:text-orange-200">
                {listing.status === 'pending_review' ? 'Menunggu Review' : 
                 listing.status === 'rejected' ? 'Ditolak' : listing.status}
              </p>
              <p className="text-sm text-orange-600 dark:text-orange-400">
                Iklan ini belum aktif dan tidak terlihat oleh publik.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* ===== Left Column ===== */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <ImageGallery 
              images={listing.images || []} 
              title={listing.title} 
              isPremium={listing.isFeatured}
            />

            {/* Title & Badges */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold mb-3">{listing.title}</h1>
                  <div className="flex flex-wrap gap-2">
                    {listing.category && (
                      <Link href={`/marketplace?category=${listing.category.slug}`}>
                        <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                          {listing.category.name}
                        </Badge>
                      </Link>
                    )}
                    <Badge className={cn("text-white border-0", conditionData.color)}>
                      {conditionData.label}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      {priceTypeData.icon}
                      {priceTypeData.label}
                    </Badge>
                    {listing.isFeatured && (
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                        ✨ Premium
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleSave} 
                    disabled={saving}
                    className={cn(isSaved && "text-red-500 border-red-200 bg-red-50")}
                  >
                    <Heart className={cn("h-5 w-5", isSaved && "fill-red-500")} />
                  </Button>
                  <SocialShareButtons title={listing.title} variant="compact" />
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" />
                  {location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  {listing.viewCount} dilihat
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true, locale: id })}
                </span>
              </div>
            </div>

            <Separator />

            {/* ===== TABS ===== */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-4 h-12 bg-muted/70 rounded-xl p-1">
                {[
                  { value: 'deskripsi', label: '📝 Deskripsi' },
                  { value: 'spesifikasi', label: '📋 Spesifikasi' },
                  { value: 'ulasan', label: '⭐ Ulasan' },
                  { value: 'chat', label: '💬 Chat' },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={cn(
                      "rounded-lg font-semibold text-sm transition-all duration-300",
                      "data-[state=active]:shadow-lg",
                      "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                      "hover:bg-accent/50"
                    )}
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Deskripsi Tab */}
              <TabsContent value="deskripsi" className="mt-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-muted/30">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Tag className="h-5 w-5 text-primary" />
                      Deskripsi Produk
                    </h2>
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {listing.description || 'Tidak ada deskripsi tersedia.'}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Spesifikasi Tab */}
              <TabsContent value="spesifikasi" className="mt-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <ProductSpecs
                  condition={condition}
                  priceType={listing.priceType}
                  location={location}
                  viewCount={listing.viewCount}
                  createdAt={listing.createdAt}
                  isFeatured={listing.isFeatured}
                  category={listing.category?.name || 'Lainnya'}
                />
              </TabsContent>

              {/* Ulasan Tab */}
              <TabsContent value="ulasan" className="mt-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <ReviewSection sellerId={listing.userId} />
              </TabsContent>

              {/* Chat Tab */}
              <TabsContent value="chat" className="mt-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <Card className="border-0 shadow-lg overflow-hidden">
                  <CardContent className="p-6 space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-primary" />
                      Hubungi Penjual
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Langsung hubungi penjual via WhatsApp atau chat internal platform.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Button
                        onClick={handleWhatsApp}
                        className="h-14 text-base gap-3 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Chat WhatsApp
                      </Button>
                      {!isOwnListing && (
                        <Button
                          variant="outline"
                          className="h-14 text-base gap-3 border-2 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                          onClick={() => toast.info('Fitur chat internal akan segera hadir!')}
                        >
                          <MessageCircle className="h-5 w-5" />
                          Chat Internal
                        </Button>
                      )}
                    </div>
                    {listing.profile?.phone && (
                      <Button
                        variant="ghost"
                        className="w-full gap-2 text-muted-foreground"
                        onClick={() => window.open(`tel:${listing.profile.phone}`)}
                      >
                        <Phone className="h-4 w-4" />
                        Hubungi via Telepon
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Ad Banner - Landscape (800x150) */}
            <div className="w-full">
              <AdBanner position="home-center" showPlaceholder={false} />
            </div>

            {/* Related Products */}
            {listing.category && (
              <RelatedProducts
                categoryId={listing.category.id}
                currentListingId={listing.id}
                categoryName={listing.category.name}
              />
            )}
          </div>

          {/* ===== Right Column - Price & Actions ===== */}
          <div className="space-y-4">
            {/* Price Card */}
            <Card className="sticky top-4 shadow-xl border-2 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-primary" />
              <CardContent className="p-6">
                {isAuction ? (
                  /* Auction Section */
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 text-primary">
                      <Gavel className="h-5 w-5" />
                      <span className="font-semibold">Lelang Aktif</span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Harga Saat Ini</p>
                      <p className="text-3xl font-bold text-primary">
                        {formatPrice(listing.auction!.currentPrice)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                      <Timer className="h-5 w-5 text-orange-600" />
                      <span className="font-semibold text-orange-600">{timeLeft}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-muted-foreground">Total Bid</p>
                        <p className="font-bold text-lg">{listing.auction!.totalBids || 0}</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-muted-foreground">Min. Kenaikan</p>
                        <p className="font-bold text-lg">{formatPrice(listing.auction!.minIncrement)}</p>
                      </div>
                    </div>
                    {listing.auction!.status === 'active' && !isOwnListing && (
                      <div className="space-y-3">
                        <Input
                          type="number"
                          placeholder={`Min ${formatPrice(listing.auction!.currentPrice + listing.auction!.minIncrement)}`}
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          className="text-lg font-medium"
                        />
                        <Button
                          className="w-full h-12 text-lg"
                          onClick={handleBid}
                          disabled={bidding}
                        >
                          <Gavel className="h-5 w-5 mr-2" />
                          {bidding ? 'Memproses...' : 'Ajukan Bid'}
                        </Button>
                      </div>
                    )}
                    {listing.auction!.buyNowPrice && listing.auction!.status === 'active' && !isOwnListing && (
                      <>
                        <div className="relative">
                          <Separator />
                          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-sm text-muted-foreground">
                            atau
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Beli Langsung</p>
                          <p className="text-xl font-bold mb-3">
                            {formatPrice(listing.auction!.buyNowPrice)}
                          </p>
                          <Button variant="outline" className="w-full gap-2">
                            <ShoppingCart className="h-4 w-4" />
                            Beli Sekarang
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  /* Fixed/Negotiable Price Section */
                  <div className="space-y-5">
                    <div>
                      <p className="text-3xl font-bold text-primary">
                        {formatPrice(listing.price)}
                      </p>
                      {listing.priceType === 'negotiable' && (
                        <Badge variant="outline" className="mt-2 gap-1">
                          <Sparkles className="h-3 w-3" />
                          Harga masih bisa nego
                        </Badge>
                      )}
                    </div>
                    {!isOwnListing && (
                      <div className="space-y-3">
                        {/* Beli via Escrow */}
                        <Button className="w-full h-12 text-lg gap-2 shadow-lg">
                          <Shield className="h-5 w-5" />
                          Beli via Rekening Bersama
                        </Button>
                        <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                          <Shield className="h-3 w-3 text-emerald-500" />
                          Pembayaran aman dengan sistem escrow
                        </p>

                        <div className="relative">
                          <Separator />
                          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-sm text-muted-foreground">
                            atau
                          </span>
                        </div>

                        {/* WhatsApp */}
                        <Button
                          variant="outline"
                          className="w-full h-12 gap-3 border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                          onClick={handleWhatsApp}
                        >
                          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          Hubungi via WhatsApp
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Seller Card */}
            <SellerCard
              seller={{
                userId: listing.profile.userId,
                name: listing.profile.name,
                avatarUrl: listing.profile.avatarUrl,
                city: listing.profile.city,
                province: listing.profile.province,
                isVerified: listing.profile.isVerified,
                averageRating: listing.profile.averageRating,
                totalReviews: listing.profile.totalReviews,
                totalListings: listing.profile.totalListings,
                soldCount: listing.profile.soldCount,
                phone: listing.profile.phone,
                createdAt: listing.profile.createdAt,
              }}
              isOwnListing={isOwnListing}
              onChat={handleWhatsApp}
              onCall={() => window.open(`tel:${listing.profile.phone}`)}
            />

            {/* Ad Banners - Stacked vertically in sidebar */}
            <div className="space-y-4">
              <AdBanner position="home-center-sidebar" showPlaceholder={false} />
            </div>

            {/* Security Notice */}
            <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950 dark:to-emerald-900/30">
              <CardContent className="p-4 space-y-3">
                <h4 className="font-semibold flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                  <Shield className="h-5 w-5" />
                  Transaksi Aman
                </h4>
                <ul className="text-xs text-emerald-700 dark:text-emerald-400 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    Gunakan Rekening Bersama (escrow) untuk keamanan
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    Dana ditahan hingga barang diterima pembeli
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    Jangan transfer langsung ke rekening pribadi
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
