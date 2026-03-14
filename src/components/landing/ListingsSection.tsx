'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ListingCard } from '@/components/marketplace/ListingCard';
import { ChevronRight } from 'lucide-react';
import type { Listing } from '@/hooks/useLandingData';

interface ListingsSectionProps {
  title: string;
  listings: Listing[];
  filterParam?: string;
  viewAllHref?: string;
  showViewAll?: boolean;
  highlightedIds?: string[];
}

export function ListingsSection({
  title,
  listings,
  filterParam,
  viewAllHref,
  showViewAll = true,
  highlightedIds = [],
}: ListingsSectionProps) {
  if (listings.length === 0 && title) return null;

  const href = viewAllHref || (filterParam ? `/marketplace?${filterParam}` : '/marketplace');

  return (
    <section className="py-3 bg-background">
      <div className="container mx-auto px-4">
        {title && (
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">{title}</h2>
            {showViewAll && (
              <Button variant="ghost" size="sm" className="gap-1" asChild>
                <Link href={href}>
                  Lihat Semua
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={{
                id: listing.id,
                title: listing.title,
                price: listing.price,
                city: listing.city || undefined,
                province: listing.province || undefined,
                imageUrl: listing.imageUrl || undefined,
                isFeatured: listing.isFeatured,
                isBoosted: highlightedIds.includes(listing.id),
                condition: listing.condition,
                viewCount: listing.viewCount,
                createdAt: listing.createdAt,
              }}
              highlighted={highlightedIds.includes(listing.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
