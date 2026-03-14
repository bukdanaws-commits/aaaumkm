'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { ListingCard } from '@/components/marketplace/ListingCard';
import { AdBanner } from '@/components/ads/AdBanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Grid, List, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRegions } from '@/hooks/useRegions';

interface Listing {
  id: string;
  title: string;
  price: number;
  city: string;
  province: string;
  condition: 'new' | 'like_new' | 'good' | 'fair';
  viewCount: number;
  imageUrl?: string | null;
  isFeatured: boolean;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  parentId?: string | null;
}

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('category')
  );
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Region filters
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
  const [selectedRegencyId, setSelectedRegencyId] = useState<string>('');
  const { provinces, regencies, fetchRegencies } = useRegions();

  // Fetch categories from database
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          // Filter hanya kategori utama (parent categories)
          const parentCategories = (data.categories || data).filter((cat: Category) => !cat.parentId);
          setCategories(parentCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    }
    fetchCategories();
  }, []);

  // Fetch listings from database
  useEffect(() => {
    async function fetchListings() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedCategory) params.append('category', selectedCategory);
        if (sortBy) params.append('sort', sortBy);
        if (searchQuery) params.append('search', searchQuery);
        if (selectedProvinceId) params.append('provinceId', selectedProvinceId);
        if (selectedRegencyId) params.append('regencyId', selectedRegencyId);
        if (selectedPriceRange) params.append('priceRange', selectedPriceRange);
        if (selectedCondition) params.append('condition', selectedCondition);
        
        const response = await fetch(`/api/listing?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setListings(data.listings || []);
        }
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, [selectedCategory, sortBy, searchQuery, selectedProvinceId, selectedRegencyId, selectedPriceRange, selectedCondition]);

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Banner Section - 2 Banners Layout - Full Width */}
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            {/* Main Banner - 2/3 width (landscape) */}
            <div className="lg:col-span-2">
              <AdBanner position="marketplace-top" />
            </div>
            {/* Side Banner - 1/3 width (square/portrait) */}
            <div className="lg:col-span-1">
              <AdBanner position="marketplace-sidebar" />
            </div>
          </div>
        </div>

        <div className="container px-4 py-6">
          {/* Search, Sort, Location & View Toggle - Combined in One Row */}
          <div className="mb-6">
            <div className="flex flex-col lg:flex-row gap-3 items-center">
              {/* Search Input */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari produk..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Location Filters */}
              <Select
                value={selectedProvinceId}
                onValueChange={(value) => {
                  setSelectedProvinceId(value);
                  setSelectedRegencyId('');
                  if (value) {
                    fetchRegencies(value);
                  }
                }}
              >
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue placeholder="Semua Provinsi" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((province) => (
                    <SelectItem key={province.id} value={province.id}>
                      {province.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedRegencyId}
                onValueChange={setSelectedRegencyId}
                disabled={!selectedProvinceId}
              >
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue placeholder="Semua Kab/Kota" />
                </SelectTrigger>
                <SelectContent>
                  {regencies.map((regency) => (
                    <SelectItem key={regency.id} value={regency.id}>
                      {regency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-[150px]">
                  <SelectValue placeholder="Urutkan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Terbaru</SelectItem>
                  <SelectItem value="price-low">Harga Terendah</SelectItem>
                  <SelectItem value="price-high">Harga Tertinggi</SelectItem>
                  <SelectItem value="popular">Terpopuler</SelectItem>
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-20 space-y-4">
                {/* Categories */}
                <div className="bg-card rounded-lg border overflow-hidden">
                  <h3 className="font-semibold px-4 pt-3 pb-2 text-sm">Kategori</h3>
                  <div className="flex flex-col max-h-[500px] overflow-y-auto">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={cn(
                        'w-full text-left px-4 py-2 text-xs transition-all duration-300',
                        !selectedCategory
                          ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white font-semibold shadow-md'
                          : 'hover:bg-muted'
                      )}
                    >
                      Semua Kategori
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={cn(
                          'w-full text-left px-4 py-2 text-xs transition-all duration-300',
                          selectedCategory === cat.id
                            ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white font-semibold shadow-md'
                            : 'hover:bg-muted'
                        )}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="bg-card rounded-lg border overflow-hidden">
                  <h3 className="font-semibold px-4 pt-3 pb-2 text-sm">Rentang Harga</h3>
                  <div className="flex flex-col">
                    <button 
                      onClick={() => setSelectedPriceRange(selectedPriceRange === 'under-1m' ? null : 'under-1m')}
                      className={cn(
                        'w-full text-left px-4 py-2 text-xs transition-all duration-300',
                        selectedPriceRange === 'under-1m'
                          ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white font-semibold shadow-md'
                          : 'hover:bg-muted'
                      )}
                    >
                      Di bawah Rp 1 Juta
                    </button>
                    <button 
                      onClick={() => setSelectedPriceRange(selectedPriceRange === '1m-10m' ? null : '1m-10m')}
                      className={cn(
                        'w-full text-left px-4 py-2 text-xs transition-all duration-300',
                        selectedPriceRange === '1m-10m'
                          ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white font-semibold shadow-md'
                          : 'hover:bg-muted'
                      )}
                    >
                      Rp 1 - 10 Juta
                    </button>
                    <button 
                      onClick={() => setSelectedPriceRange(selectedPriceRange === '10m-50m' ? null : '10m-50m')}
                      className={cn(
                        'w-full text-left px-4 py-2 text-xs transition-all duration-300',
                        selectedPriceRange === '10m-50m'
                          ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white font-semibold shadow-md'
                          : 'hover:bg-muted'
                      )}
                    >
                      Rp 10 - 50 Juta
                    </button>
                    <button 
                      onClick={() => setSelectedPriceRange(selectedPriceRange === 'over-50m' ? null : 'over-50m')}
                      className={cn(
                        'w-full text-left px-4 py-2 text-xs transition-all duration-300',
                        selectedPriceRange === 'over-50m'
                          ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white font-semibold shadow-md'
                          : 'hover:bg-muted'
                      )}
                    >
                      Di atas Rp 50 Juta
                    </button>
                  </div>
                </div>

                {/* Condition */}
                <div className="bg-card rounded-lg border overflow-hidden">
                  <h3 className="font-semibold px-4 pt-3 pb-2 text-sm">Kondisi</h3>
                  <div className="flex flex-col">
                    <button 
                      onClick={() => setSelectedCondition(selectedCondition === 'new' ? null : 'new')}
                      className={cn(
                        'w-full text-left px-4 py-2 text-xs transition-all duration-300',
                        selectedCondition === 'new'
                          ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white font-semibold shadow-md'
                          : 'hover:bg-muted'
                      )}
                    >
                      Baru
                    </button>
                    <button 
                      onClick={() => setSelectedCondition(selectedCondition === 'like_new' ? null : 'like_new')}
                      className={cn(
                        'w-full text-left px-4 py-2 text-xs transition-all duration-300',
                        selectedCondition === 'like_new'
                          ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white font-semibold shadow-md'
                          : 'hover:bg-muted'
                      )}
                    >
                      Seperti Baru
                    </button>
                    <button 
                      onClick={() => setSelectedCondition(selectedCondition === 'used' ? null : 'used')}
                      className={cn(
                        'w-full text-left px-4 py-2 text-xs transition-all duration-300',
                        selectedCondition === 'used'
                          ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white font-semibold shadow-md'
                          : 'hover:bg-muted'
                      )}
                    >
                      Bekas
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
              {/* Listings Grid */}
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="aspect-square rounded-lg" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Listings with Ads every 3 rows (12 items) */}
                  {listings.length > 0 ? (
                    <>
                      {Array.from({ length: Math.ceil(listings.length / 12) }).map((_, chunkIndex) => {
                        const startIndex = chunkIndex * 12;
                        const endIndex = startIndex + 12;
                        const chunkListings = listings.slice(startIndex, endIndex);
                        
                        return (
                          <div key={chunkIndex}>
                            {/* Listings Grid */}
                            <div
                              className={cn(
                                'grid gap-4',
                                viewMode === 'grid'
                                  ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4'
                                  : 'grid-cols-1'
                              )}
                            >
                              {chunkListings.map((listing) => (
                                <ListingCard 
                                  key={listing.id} 
                                  listing={listing}
                                  viewMode={viewMode}
                                />
                              ))}
                            </div>
                            
                            {/* Ad Banner after every 3 rows (12 items), but not after the last chunk - 2 Grid Layout */}
                            {endIndex < listings.length && (
                              <div className="mt-4 -mx-4 lg:-mx-6">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                                  <div className="lg:col-span-2">
                                    <AdBanner position="marketplace-inline" showPlaceholder={false} />
                                  </div>
                                  <div className="lg:col-span-1">
                                    <AdBanner position="marketplace-inline-sidebar" showPlaceholder={false} />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Tidak ada produk ditemukan</p>
                    </div>
                  )}
                </div>
              )}

              {/* Load More */}
              <div className="mt-8 text-center">
                <Button variant="outline" size="lg">
                  Muat Lebih Banyak
                </Button>
              </div>
            </main>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="container px-4 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </MainLayout>
    }>
      <MarketplaceContent />
    </Suspense>
  );
}
