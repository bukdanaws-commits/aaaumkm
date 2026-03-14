'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { MapPin, Eye, Clock, Heart, Sparkles } from 'lucide-react';
import { formatPrice, formatRelativeTime } from '@/lib/utils';
import { useState } from 'react';

interface Listing {
  id: string;
  title: string;
  price: number;
  city?: string;
  province?: string;
  imageUrl?: string | null;
  isFeatured?: boolean;
  isBoosted?: boolean;
  condition?: string;
  viewCount?: number;
  createdAt?: string;
  category?: string;
  isNegotiable?: boolean;
  isWishlisted?: boolean;
}

interface ListingCardProps {
  listing: Listing;
  highlighted?: boolean;
  onWishlistToggle?: (listingId: string) => void;
  viewMode?: 'grid' | 'list';
}

export function ListingCard({ listing, highlighted = false, onWishlistToggle, viewMode = 'grid' }: ListingCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(listing.isWishlisted || false);

  const conditionBadge = {
    new: { label: 'Baru', variant: 'default' as const, color: 'bg-emerald-500', icon: true },
    like_new: { label: 'Seperti Baru', variant: 'secondary' as const, color: 'bg-blue-500', icon: false },
    good: { label: 'Baik', variant: 'outline' as const, color: 'bg-gray-500', icon: false },
    fair: { label: 'Cukup', variant: 'outline' as const, color: 'bg-orange-500', icon: false },
  };

  const condition = conditionBadge[listing.condition as keyof typeof conditionBadge] || conditionBadge.good;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    onWishlistToggle?.(listing.id);
  };

  // List View Layout
  if (viewMode === 'list') {
    return (
      <Link href={`/listing/${listing.id}`}>
        <Card
          className={cn(
            'group cursor-pointer overflow-hidden transition-all duration-300',
            'hover:shadow-lg hover:border-primary/50',
            'gap-0 p-0', // Remove all default padding
            highlighted && 'ring-2 ring-amber-500 ring-offset-2',
            listing.isFeatured && 'border-amber-500'
          )}
        >
          <div className="flex gap-2">
            {/* Image - Flush to edge */}
            <div className="relative w-28 h-20 shrink-0 overflow-hidden bg-muted">
              {listing.imageUrl ? (
                <Image
                  src={listing.imageUrl}
                  alt={listing.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="112px"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <span className="text-muted-foreground text-xs">No image</span>
                </div>
              )}

              {/* Condition Badge - Small */}
              <div className="absolute bottom-1 left-1">
                <Badge 
                  className={cn(
                    'text-[8px] px-1 py-0 h-3.5 border-0 font-medium text-white',
                    condition.color
                  )}
                >
                  {condition.label}
                </Badge>
              </div>
            </div>

            {/* Content - Horizontal Layout */}
            <div className="flex-1 flex flex-col justify-between min-w-0 py-2 pr-2">
              {/* Top Row: Title & Price */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground line-clamp-1 mb-0.5">
                    {listing.title}
                  </h3>
                  {listing.category && (
                    <Badge 
                      className="text-[8px] px-1.5 py-0 h-3.5 border-0 text-white font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700"
                    >
                      {listing.category}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="text-right">
                    <span className="text-base font-bold text-foreground block leading-tight">
                      {formatPrice(listing.price)}
                    </span>
                    {!listing.isNegotiable && (
                      <Badge 
                        variant="outline" 
                        className="text-[8px] px-1 py-0 h-3.5 font-medium bg-primary/10 text-primary border-primary/20 mt-0.5"
                      >
                        Harga Pas
                      </Badge>
                    )}
                  </div>
                  <button
                    onClick={handleWishlistClick}
                    className={cn(
                      'rounded-full p-1 transition-all',
                      isWishlisted 
                        ? 'bg-red-500 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart className={cn('h-3 w-3 transition-colors', isWishlisted && 'fill-white')} />
                  </button>
                </div>
              </div>

              {/* Bottom Row: Location & Stats */}
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-2.5 w-2.5 shrink-0 text-primary" />
                  <span className="font-medium">{listing.city || listing.province || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {listing.viewCount !== undefined && (
                    <span className="flex items-center gap-0.5">
                      <Eye className="h-2.5 w-2.5" />
                      <span className="font-medium">{listing.viewCount}</span>
                    </span>
                  )}
                  {listing.createdAt && (
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      <span className="font-medium">{formatRelativeTime(listing.createdAt)}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  // Grid View Layout (existing)

  return (
    <Link href={`/listing/${listing.id}`}>
      <Card
        className={cn(
          'group cursor-pointer overflow-hidden transition-all duration-300 h-full',
          'hover:shadow-xl hover:-translate-y-1',
          highlighted && 'ring-2 ring-amber-500 ring-offset-2',
          listing.isFeatured && 'border-amber-500'
        )}
      >
        {/* Image Container with 4:3 Aspect Ratio */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {listing.imageUrl ? (
            <Image
              src={listing.imageUrl}
              alt={listing.title}
              fill
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <span className="text-muted-foreground text-sm">No image</span>
            </div>
          )}

          {/* Featured/Boost Badges - Top Left */}
          <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
            {listing.isFeatured && (
              <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-lg">
                Featured
              </Badge>
            )}
            {listing.isBoosted && (
              <Badge variant="default" className="bg-purple-500 hover:bg-purple-600 text-white border-0 shadow-lg">
                Boost
              </Badge>
            )}
          </div>

          {/* Condition Badge - Bottom Left with Icon */}
          <div className="absolute bottom-2 left-2">
            <Badge 
              className={cn(
                'shadow-lg border-0 font-medium text-white',
                condition.color
              )}
            >
              {condition.icon && <Sparkles className="mr-1 h-3 w-3" />}
              {condition.label}
            </Badge>
          </div>

          {/* Wishlist Button - Top Right */}
          <button
            onClick={handleWishlistClick}
            className={cn(
              'absolute right-2 top-2 rounded-full p-2 shadow-lg transition-all',
              isWishlisted 
                ? 'bg-red-500 text-white opacity-100' 
                : 'bg-white/90 text-gray-600 opacity-0 group-hover:opacity-100'
            )}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={cn('h-4 w-4 transition-colors', isWishlisted && 'fill-white')} />
          </button>
        </div>

        <CardContent className="p-3">
          {/* Price and Negotiable Badge */}
          <div className="mb-1 flex items-center justify-between gap-1">
            <span className="text-base font-bold text-foreground">
              {formatPrice(listing.price)}
            </span>
            {!listing.isNegotiable && (
              <Badge 
                variant="outline" 
                className="text-xs font-medium shrink-0 bg-primary/10 text-primary border-primary/20"
              >
                Harga Pas
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="mb-2 line-clamp-2 text-xs font-semibold text-foreground leading-snug min-h-[2rem]">
            {listing.title}
          </h3>

          {/* Category Badge */}
          {listing.category && (
            <Badge 
              className="mb-2 text-[10px] border-0 text-white font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 shadow-md shadow-primary/25"
            >
              {listing.category}
            </Badge>
          )}

          {/* Footer with Stats */}
          <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t pt-2">
            {/* Location */}
            <div className="flex items-center gap-1 truncate max-w-[50%]">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="truncate font-medium">{listing.city || listing.province || 'Unknown'}</span>
            </div>

            {/* Views and Time */}
            <div className="flex items-center gap-3">
              {listing.viewCount !== undefined && (
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  <span className="font-medium">{listing.viewCount}</span>
                </span>
              )}
              {listing.createdAt && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="font-medium">{formatRelativeTime(listing.createdAt)}</span>
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
