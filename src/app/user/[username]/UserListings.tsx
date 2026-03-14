'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ListingCard } from '@/components/marketplace/ListingCard';
import { Package } from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  slug: string;
  price: number;
  priceType: string;
  condition: string;
  city: string;
  province: string;
  imageUrl: string;
  viewCount: number;
  favoriteCount: number;
  isFeatured: boolean;
  createdAt: string;
  category: string;
  status: string;
}

interface UserListingsProps {
  listings: Listing[];
  activeCount: number;
  totalCount: number;
}

export default function UserListings({ listings, activeCount, totalCount }: UserListingsProps) {
  const activeListings = listings.filter(l => l.status === 'active');

  return (
    <Tabs defaultValue="active" className="w-full">
      <TabsList>
        <TabsTrigger value="active">
          Listing Aktif ({activeCount})
        </TabsTrigger>
        <TabsTrigger value="all">
          Semua Listing ({totalCount})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="active" className="mt-6">
        {activeCount === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Belum ada listing aktif</p>
              <p className="text-sm mt-2">Listing akan muncul di sini setelah dipublikasikan</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {activeListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={{
                  id: listing.id,
                  title: listing.title,
                  price: listing.price,
                  condition: listing.condition,
                  city: listing.city,
                  province: listing.province,
                  imageUrl: listing.imageUrl,
                  viewCount: listing.viewCount,
                  isFeatured: listing.isFeatured,
                  createdAt: listing.createdAt,
                  category: listing.category,
                }}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="all" className="mt-6">
        {totalCount === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Belum ada listing</p>
              <p className="text-sm mt-2">Mulai jual produk Anda sekarang</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={{
                  id: listing.id,
                  title: listing.title,
                  price: listing.price,
                  condition: listing.condition,
                  city: listing.city,
                  province: listing.province,
                  imageUrl: listing.imageUrl,
                  viewCount: listing.viewCount,
                  isFeatured: listing.isFeatured,
                  createdAt: listing.createdAt,
                  category: listing.category,
                }}
              />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
