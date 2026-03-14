'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Package, Eye } from 'lucide-react';

interface RelatedListing {
  id: string;
  title: string;
  slug: string;
  price: number;
  city: string | null;
  images: { imageUrl: string; isPrimary: boolean }[];
  category: { name: string } | null;
  viewCount?: number;
  isFeatured?: boolean;
}

interface RelatedProductsProps {
  categoryId: string;
  currentListingId: string;
  categoryName?: string;
}

export function RelatedProducts({ categoryId, currentListingId, categoryName }: RelatedProductsProps) {
  const [listings, setListings] = useState<RelatedListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const res = await fetch(`/api/listings/related?categoryId=${categoryId}&excludeId=${currentListingId}&limit=8`);
        if (res.ok) {
          const data = await res.json();
          setListings(data.listings || []);
        }
      } catch (error) {
        console.error('Failed to fetch related products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId && currentListingId) {
      fetchRelated();
    }
  }, [categoryId, currentListingId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Produk Serupa</span>
            <Skeleton className="h-6 w-20" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (listings.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <span>Produk Serupa</span>
            {categoryName && (
              <Badge variant="secondary" className="ml-2">
                {categoryName}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" asChild className="gap-1">
            <Link href={`/marketplace?category=${categoryId}`}>
              Lihat Semua
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {listings.map((listing) => (
            <Link
              key={listing.id}
              href={`/listing/${listing.id}`}
              className="group"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden bg-muted mb-3">
                {listing.images?.length > 0 ? (
                  <Image
                    src={listing.images[0].imageUrl}
                    alt={listing.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                )}
                
                {/* Featured Badge */}
                {listing.isFeatured && (
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs">
                      Premium
                    </Badge>
                  </div>
                )}

                {/* View Count Overlay */}
                <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {listing.viewCount || 0}
                </div>
              </div>

              <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors mb-1">
                {listing.title}
              </h3>
              <p className="text-primary font-bold text-sm">
                {formatPrice(listing.price)}
              </p>
              {listing.city && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {listing.city}
                </p>
              )}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
