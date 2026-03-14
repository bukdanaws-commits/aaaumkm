'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  Heart, Trash2, ShoppingCart, MapPin, Package, Search, Grid3X3, List, ExternalLink, Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface SavedListing {
  id: string;
  created_at: string;
  listing: {
    id: string;
    title: string;
    price: number;
    price_type: string;
    condition: string;
    status: string;
    city: string | null;
    province: string | null;
    view_count: number;
    is_featured: boolean;
    created_at: string;
    listing_images: { image_url: string; is_primary: boolean }[];
    categories: { name: string } | null;
  };
}

const conditionLabels: Record<string, string> = {
  new: 'Baru',
  like_new: 'Seperti Baru',
  good: 'Bagus',
  fair: 'Cukup',
};

/* Helper component - defined outside render */
function ListingCard({ 
  item, 
  unavailable = false, 
  onRemove, 
  isRemoving,
  onNavigate,
  formatPrice 
}: { 
  item: SavedListing; 
  unavailable?: boolean; 
  onRemove: (id: string) => void;
  isRemoving: boolean;
  onNavigate: (path: string) => void;
  formatPrice: (price: number) => string;
}) {
  const location = item.listing.city || item.listing.province || 'Indonesia';

  return (
    <Card className={cn(
      "group overflow-hidden transition-all duration-300 hover:shadow-lg",
      unavailable && "opacity-60"
    )}>
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {item.listing.listing_images[0]?.image_url ? (
          <img
            src={item.listing.listing_images[0].image_url}
            alt={item.listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}

        {unavailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Badge variant="destructive" className="text-sm">
              Tidak Tersedia
            </Badge>
          </div>
        )}

        {item.listing.is_featured && !unavailable && (
          <Badge className="absolute left-2 top-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
            ✨ Premium
          </Badge>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              className={cn(
                "absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity",
                "group-hover:opacity-100"
              )}
              disabled={isRemoving}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus dari Wishlist?</AlertDialogTitle>
              <AlertDialogDescription>
                Anda yakin ingin menghapus "{item.listing.title}" dari wishlist?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={() => onRemove(item.id)}>
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <CardContent className="p-4">
        <p className="text-lg font-bold text-primary mb-1">
          {formatPrice(item.listing.price)}
        </p>
        <h3 className="font-medium text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
          {item.listing.title}
        </h3>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <MapPin className="h-3 w-3" />
          <span className="truncate">{location}</span>
          <span className="text-muted-foreground/50">•</span>
          <Badge variant="secondary" className="text-xs">
            {conditionLabels[item.listing.condition] || item.listing.condition}
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            className="flex-1 gap-1"
            onClick={() => onNavigate(`/listing/${item.listing.id}`)}
            disabled={unavailable}
          >
            <ExternalLink className="h-3 w-3" />
            Lihat
          </Button>
          {!unavailable && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => onNavigate(`/listing/${item.listing.id}`)}
            >
              <ShoppingCart className="h-3 w-3" />
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-3">
          Disimpan {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: id })}
        </p>
      </CardContent>
    </Card>
  );
}

function SkeletonCard() {
  return (
    <Card>
      <div className="aspect-[4/3] bg-muted">
        <Skeleton className="w-full h-full" />
      </div>
      <CardContent className="p-4">
        <Skeleton className="h-6 w-24 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4 mb-3" />
        <div className="flex gap-2">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 w-8" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardWishlist() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [savedListings, setSavedListings] = useState<SavedListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) return;
      
      try {
        const response = await fetch('/api/dashboard/wishlist');
        if (response.ok) {
          const data = await response.json();
          setSavedListings(data.savedListings);
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchWishlist();
    }
  }, [user, authLoading]);

  const handleRemove = async (savedId: string) => {
    setRemoving(savedId);
    try {
      const response = await fetch('/api/dashboard/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ savedId }),
      });

      if (response.ok) {
        setSavedListings(prev => prev.filter(item => item.id !== savedId));
        toast({
          title: '✅ Dihapus dari wishlist',
          description: 'Iklan telah dihapus dari daftar simpan',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Gagal menghapus',
          description: 'Terjadi kesalahan saat menghapus dari wishlist',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Gagal menghapus',
        description: 'Terjadi kesalahan saat menghapus dari wishlist',
      });
    } finally {
      setRemoving(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const filteredListings = useMemo(() => 
    savedListings.filter(item =>
      item.listing.title.toLowerCase().includes(searchQuery.toLowerCase())
    ), [savedListings, searchQuery]
  );

  const activeListings = useMemo(() => 
    filteredListings.filter(item => item.listing.status === 'active'),
    [filteredListings]
  );

  const unavailableListings = useMemo(() => 
    filteredListings.filter(item => item.listing.status !== 'active'),
    [filteredListings]
  );

  if (authLoading || isLoading) {
    return (
      <DashboardLayout title="Wishlist" description="Memuat...">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Wishlist" 
      description={`${savedListings.length} iklan yang Anda simpan`}
    >
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari di wishlist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {savedListings.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Heart className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Wishlist Kosong</h3>
          <p className="text-muted-foreground mb-6">
            Anda belum menyimpan iklan apapun. Jelajahi marketplace dan simpan iklan yang Anda sukai!
          </p>
          <Button onClick={() => router.push('/marketplace')}>
            Jelajahi Marketplace
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Active Listings */}
          {activeListings.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Tersedia ({activeListings.length})
              </h3>
              <div className={cn(
                "grid gap-4",
                viewMode === 'grid' 
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
                  : "grid-cols-1"
              )}>
                {activeListings.map((item) => (
                  <ListingCard 
                    key={item.id} 
                    item={item} 
                    onRemove={handleRemove}
                    isRemoving={removing === item.id}
                    onNavigate={router.push}
                    formatPrice={formatPrice}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Unavailable Listings */}
          {unavailableListings.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-muted-foreground">
                <Package className="h-5 w-5" />
                Tidak Tersedia ({unavailableListings.length})
              </h3>
              <div className={cn(
                "grid gap-4",
                viewMode === 'grid' 
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
                  : "grid-cols-1"
              )}>
                {unavailableListings.map((item) => (
                  <ListingCard 
                    key={item.id} 
                    item={item} 
                    unavailable
                    onRemove={handleRemove}
                    isRemoving={removing === item.id}
                    onNavigate={router.push}
                    formatPrice={formatPrice}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredListings.length === 0 && searchQuery && (
            <Card className="p-8 text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Tidak ada iklan yang cocok dengan pencarian "{searchQuery}"
              </p>
            </Card>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
