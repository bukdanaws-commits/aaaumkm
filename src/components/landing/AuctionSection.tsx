'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Users, Gavel } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { Auction } from '@/hooks/useLandingData';

interface AuctionSectionProps {
  auctions: Auction[];
}

export function AuctionSection({ auctions }: AuctionSectionProps) {
  if (auctions.length === 0) return null;

  const formatTimeLeft = (endsAt: string) => {
    const end = new Date(endsAt);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Berakhir';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}h ${hours}j`;
    if (hours > 0) return `${hours}j ${minutes}m`;
    return `${minutes} menit`;
  };

  const isEndingSoon = (endsAt: string) => {
    const end = new Date(endsAt);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const hours = diff / (1000 * 60 * 60);
    return hours < 24;
  };

  return (
    <section className="bg-background py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Gavel className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Lelang Aktif</h2>
            <Badge variant="destructive" className="text-xs">
              Live
            </Badge>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-primary gap-1 text-xs">
            <Link href="/marketplace?type=auction">
              Lihat Semua
              <Gavel className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {auctions.map((auction) => {
            const listing = auction.listing;
            if (!listing) return null;

            return (
              <Link key={auction.id} href={`/listing/${listing.id}?auction=${auction.id}`}>
                <Card className="group overflow-hidden hover:shadow-lg transition-all duration-200 h-full">
                  <div className="relative aspect-square bg-muted">
                    {listing.imageUrl ? (
                      <img
                        src={listing.imageUrl}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <Gavel className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}

                    {/* Live Badge */}
                    <div className="absolute top-2 left-2">
                      <Badge variant="destructive" className="text-xs animate-pulse">
                        <span className="w-2 h-2 bg-white rounded-full mr-1" />
                        LIVE
                      </Badge>
                    </div>

                    {/* Time Left */}
                    <div className="absolute top-2 right-2">
                      <Badge
                        variant={isEndingSoon(auction.endsAt) ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTimeLeft(auction.endsAt)}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                      {listing.title}
                    </h3>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Harga Saat Ini</span>
                        <span className="font-bold text-primary">
                          {formatPrice(auction.currentPrice)}
                        </span>
                      </div>

                      {auction.buyNowPrice && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Beli Langsung</span>
                          <span className="text-sm font-medium">
                            {formatPrice(auction.buyNowPrice)}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{auction.totalBids} penawaran</span>
                        </div>
                        {listing.city && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{listing.city}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
