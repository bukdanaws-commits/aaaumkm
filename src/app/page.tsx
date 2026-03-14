'use client';

import { useLandingData } from '@/hooks/useLandingData';
import { MainLayout } from '@/components/layout/MainLayout';
import { CategorySection } from '@/components/landing/CategorySection';
import { ListingsSection } from '@/components/landing/ListingsSection';
import { PremiumListingsSection } from '@/components/landing/PremiumListingsSection';
import { AuctionSection } from '@/components/landing/AuctionSection';
import { SponsorLogos } from '@/components/landing/SponsorLogos';
import { AdBanner } from '@/components/ads/AdBanner';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { GradientHeading } from '@/components/ui/gradient-heading';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { ChevronRight, Clock, TrendingUp, Zap } from 'lucide-react';

const LoadingSkeleton = () => (
  <MainLayout>
    <div className="container mx-auto px-4 py-6">
      <div className="flex gap-3 overflow-hidden mb-8">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-20 shrink-0 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-lg" />
        ))}
      </div>
    </div>
  </MainLayout>
);

export default function HomePage() {
  const router = useRouter();
  const {
    categories,
    featuredListings,
    premiumBoostedListings,
    highlightedListingIds,
    latestListings,
    popularListings,
    activeAuctions,
    loading,
  } = useLandingData();

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <MainLayout>
      <main className="min-h-screen bg-background">
        {/* Top Banner - 2 Grid Layout */}
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            <div className="lg:col-span-2">
              <AdBanner position="home-center" showPlaceholder={false} />
            </div>
            <div className="lg:col-span-1">
              <AdBanner position="home-center-sidebar" showPlaceholder={false} />
            </div>
          </div>
        </div>

        {/* Categories */}
        <CategorySection categories={categories} />

        {/* Premium Boosted Listings - right after categories */}
        <PremiumListingsSection listings={premiumBoostedListings} highlightedIds={highlightedListingIds} />

        {/* Featured / Flash Sale */}
        {featuredListings.length > 0 && (
          <section className="bg-background">
            <div className="container mx-auto px-4 pt-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Zap className="h-4.5 w-4.5 text-amber-500" />
                  <h2 className="text-lg font-bold text-foreground">Flash Sale</h2>
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 border-0 text-xs">Premium</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/marketplace?featured=true')}
                  className="text-primary gap-1 text-xs"
                >
                  Lihat Semua
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <ListingsSection title="" listings={featuredListings} filterParam="featured=true" showViewAll={false} highlightedIds={highlightedListingIds} />
          </section>
        )}

        {/* Auctions */}
        <AuctionSection auctions={activeAuctions} />

        {/* Latest */}
        {latestListings.length > 0 && (
          <section className="bg-background">
            <div className="container mx-auto px-4 pt-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Clock className="h-4.5 w-4.5 text-primary" />
                  <h2 className="text-lg font-bold text-foreground">Produk Terbaru</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/marketplace?sort=newest')}
                  className="text-primary gap-1 text-xs"
                >
                  Lihat Semua
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <ListingsSection title="" listings={latestListings} filterParam="sort=newest" showViewAll={false} highlightedIds={highlightedListingIds} />
          </section>
        )}

        {/* Inline Ad between Latest and Popular - 2 Grid Layout */}
        <div className="container mx-auto px-4 py-2">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 -mx-4 lg:-mx-6">
            <div className="lg:col-span-2">
              <AdBanner position="home-inline" showPlaceholder={false} />
            </div>
            <div className="lg:col-span-1">
              <AdBanner position="home-inline-sidebar" showPlaceholder={false} />
            </div>
          </div>
        </div>

        {/* Popular */}
        {popularListings.length > 0 && (
          <section className="bg-background">
            <div className="container mx-auto px-4 pt-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4.5 w-4.5 text-primary" />
                  <h2 className="text-lg font-bold text-foreground">Populer Minggu Ini</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/marketplace?sort=popular')}
                  className="text-primary gap-1 text-xs"
                >
                  Lihat Semua
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <ListingsSection title="" listings={popularListings} filterParam="sort=popular" showViewAll={false} highlightedIds={highlightedListingIds} />
          </section>
        )}

        {/* Sponsor Logos - Before CTA */}
        <SponsorLogos />

        {/* CTA */}
        <section className="py-6 bg-primary">
          <div className="container mx-auto px-4 text-center">
            <GradientHeading as="h3" variant="light" className="text-xl font-bold mb-2">
              Mulai jualan di Marketplace sekarang!
            </GradientHeading>
            <p className="text-sm text-primary-foreground/70 mb-6">
              Gratis daftar · Jutaan pembeli · Transaksi aman
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="secondary" onClick={() => router.push('/auth')}>
                Daftar Gratis
              </Button>
              <Button
                variant="ghost"
                className="text-primary-foreground border border-primary-foreground/20 hover:bg-primary-foreground/10"
                onClick={() => router.push('/listing/create')}
              >
                Jual Barang
              </Button>
            </div>
          </div>
        </section>

      </main>
    </MainLayout>
  );
}
