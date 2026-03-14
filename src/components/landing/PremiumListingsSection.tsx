'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MapPin, Eye, Zap, Rocket, ChevronRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { Listing } from '@/hooks/useLandingData';

interface PremiumListingsSectionProps {
  listings: Listing[];
  highlightedIds: string[];
}

export function PremiumListingsSection({ listings, highlightedIds }: PremiumListingsSectionProps) {
  if (listings.length === 0) return null;

  return (
    <section className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold">Premium Listings</h2>
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 border-0 text-xs">
              Boosted
            </Badge>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-primary gap-1 text-xs">
            <Link href="/marketplace?boosted=true">
              Lihat Semua
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {listings.map((listing) => {
            const isHighlighted = highlightedIds.includes(listing.id);
            
            return (
              <Link key={listing.id} href={`/listing/${listing.id}`}>
                <Card
                  className={cn(
                    'group overflow-hidden hover:shadow-lg transition-all duration-200 h-full',
                    isHighlighted && 'ring-2 ring-amber-500 ring-offset-2 bg-amber-50/50'
                  )}
                >
                  <div className="relative aspect-square bg-muted">
                    {listing.imageUrl ? (
                      <img
                        src={listing.imageUrl}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <Zap className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}

                    {/* Boost Badge */}
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 border-0 text-xs">
                        <Rocket className="h-3 w-3 mr-1" />
                        Boost
                      </Badge>
                    </div>

                    {/* Condition Badge */}
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="text-xs">
                        {listing.condition === 'new' ? 'Baru' : listing.condition === 'like_new' ? 'Seperti Baru' : 'Bekas'}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                      {listing.title}
                    </h3>
                    <p className="font-bold text-primary text-base mb-2">
                      {formatPrice(listing.price)}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      {listing.city && (
                        <div className="flex items-center gap-1 line-clamp-1">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span>{listing.city}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{listing.viewCount}</span>
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
