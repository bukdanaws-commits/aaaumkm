'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ExternalLink, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface AdBannerProps {
  position: 'home' | 'header' | 'inline' | 'sidebar' | 'marketplace-top' | 'marketplace-inline' | 'marketplace-sidebar' | 'home-center' | 'home-inline' | 'home-center-sidebar' | 'home-inline-sidebar' | 'marketplace-inline-sidebar';
  className?: string;
  showPlaceholder?: boolean;
}

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  position: string;
}

export function AdBanner({ position, className, showPlaceholder = true }: AdBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [ad, setAd] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBanner() {
      try {
        const response = await fetch(`/api/banners/active?position=${position}`);
        if (response.ok) {
          const data = await response.json();
          setAd(data.banner || null);
        } else {
          setAd(null);
        }
      } catch (error) {
        console.error('Error fetching banner:', error);
        setAd(null);
      } finally {
        setLoading(false);
      }
    }

    fetchBanner();
  }, [position]);

  if (dismissed) return null;

  if (loading) {
    return null; // Or show a skeleton loader
  }

  if (!ad && showPlaceholder) {
    return (
      <div className={cn('bg-muted/50 overflow-hidden', className)}>
        <div className="flex items-center justify-center h-20 text-muted-foreground text-sm">
          <span>Iklan {position}</span>
        </div>
      </div>
    );
  }

  if (!ad) return null;

  const sizeClasses = {
    home: 'h-[150px]',
    header: 'h-[150px]',
    inline: 'h-[150px]',
    sidebar: 'h-[150px]',
    'marketplace-top': 'h-[150px]',
    'marketplace-inline': 'h-[150px]',
    'marketplace-sidebar': 'h-[150px]',
    'marketplace-inline-sidebar': 'h-[150px]',
    'home-center': 'h-[150px]',
    'home-center-sidebar': 'h-[150px]',
    'home-inline': 'h-[150px]',
    'home-inline-sidebar': 'h-[150px]',
  };

  const handleClick = async () => {
    if (ad?.id) {
      try {
        await fetch('/api/banners/click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bannerId: ad.id }),
        });
      } catch (error) {
        console.error('Error tracking click:', error);
      }
    }
  };

  return (
    <div className={cn('overflow-hidden relative group', className)}>
      <Link href={ad.targetUrl} className="block" onClick={handleClick}>
        <div className={cn('relative w-full', sizeClasses[position])}>
          <Image
            src={ad.imageUrl}
            alt={ad.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          
          {/* Ad Label */}
          <div className="absolute bottom-2 left-2">
            <span className="text-xs text-white/80 bg-black/30 px-2 py-0.5 rounded">
              Sponsor
            </span>
          </div>

          {/* Title */}
          <div className="absolute bottom-2 right-2">
            <span className="text-sm font-medium text-white flex items-center gap-1">
              {ad.title}
              <ExternalLink className="h-3 w-3" />
            </span>
          </div>
        </div>
      </Link>

      {/* Dismiss Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          setDismissed(true);
        }}
        className="absolute top-2 right-2 p-1 rounded-full bg-black/30 text-white/80 hover:bg-black/50 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
