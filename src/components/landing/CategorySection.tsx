'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import {
  Smartphone,
  Car,
  Home,
  Shirt,
  Gamepad2,
  Sofa,
  Wrench,
  MoreHorizontal,
  UtensilsCrossed,
  Palette,
  Coffee,
  Cake,
  Scissors,
  Flower2,
  Package,
  Sparkles,
  ShoppingBag,
  Leaf,
  type LucideIcon,
} from 'lucide-react';
import type { Category } from '@/hooks/useLandingData';

// Default icons for categories
const categoryIcons: Record<string, LucideIcon> = {
  elektronik: Smartphone,
  kendaraan: Car,
  properti: Home,
  fashion: Shirt,
  'hobi-koleksi': Gamepad2,
  'rumah-tangga': Sofa,
  jasa: Wrench,
  'makanan-minuman': UtensilsCrossed,
  'handmade-craft': Palette,
  umkm: Package,
  // UMKM Categories
  'kuliner-kue': Cake,
  'fashion-lokal': Shirt,
  'kerajinan-tangan': Palette,
  'kopi-minuman': Coffee,
  'jasa-kreatif': Sparkles,
  'produk-kecantikan': Flower2,
  'tas-aksesoris': ShoppingBag,
  'makanan-olahan': UtensilsCrossed,
  'tanaman-hias': Leaf,
  'jasa-jahit': Scissors,
};

// Solid color backgrounds for each category
const categorySolidColors: Record<string, string> = {
  elektronik: 'bg-blue-500 hover:bg-blue-600',
  kendaraan: 'bg-red-500 hover:bg-red-600',
  properti: 'bg-green-500 hover:bg-green-600',
  fashion: 'bg-pink-500 hover:bg-pink-600',
  'hobi-koleksi': 'bg-gray-500 hover:bg-gray-600',
  'rumah-tangga': 'bg-yellow-500 hover:bg-yellow-600',
  jasa: 'bg-purple-500 hover:bg-purple-600',
  'makanan-minuman': 'bg-orange-500 hover:bg-orange-600',
  // UMKM Categories
  'kuliner-kue': 'bg-rose-500 hover:bg-rose-600',
  'fashion-lokal': 'bg-fuchsia-500 hover:bg-fuchsia-600',
  'kerajinan-tangan': 'bg-emerald-500 hover:bg-emerald-600',
  'kopi-minuman': 'bg-amber-600 hover:bg-amber-700',
  'jasa-kreatif': 'bg-violet-500 hover:bg-violet-600',
  'produk-kecantikan': 'bg-pink-400 hover:bg-pink-500',
  'tas-aksesoris': 'bg-slate-600 hover:bg-slate-700',
  'makanan-olahan': 'bg-orange-600 hover:bg-orange-700',
  'tanaman-hias': 'bg-lime-500 hover:bg-lime-600',
  'jasa-jahit': 'bg-sky-500 hover:bg-sky-600',
};

const categoryColors: Record<string, string> = {
  elektronik: 'text-blue-600 dark:text-blue-400',
  kendaraan: 'text-green-600 dark:text-green-400',
  properti: 'text-amber-600 dark:text-amber-400',
  fashion: 'text-pink-600 dark:text-pink-400',
  'hobi-koleksi': 'text-purple-600 dark:text-purple-400',
  'rumah-tangga': 'text-orange-600 dark:text-orange-400',
  jasa: 'text-cyan-600 dark:text-cyan-400',
  'makanan-minuman': 'text-red-600 dark:text-red-400',
  'handmade-craft': 'text-teal-600 dark:text-teal-400',
  umkm: 'text-indigo-600 dark:text-indigo-400',
  // UMKM Categories
  'kuliner-kue': 'text-rose-600 dark:text-rose-400',
  'fashion-lokal': 'text-fuchsia-600 dark:text-fuchsia-400',
  'kerajinan-tangan': 'text-emerald-600 dark:text-emerald-400',
  'kopi-minuman': 'text-amber-700 dark:text-amber-500',
  'jasa-kreatif': 'text-violet-600 dark:text-violet-400',
  'produk-kecantikan': 'text-pink-500 dark:text-pink-400',
  'tas-aksesoris': 'text-slate-600 dark:text-slate-400',
  'makanan-olahan': 'text-orange-700 dark:text-orange-500',
  'tanaman-hias': 'text-lime-600 dark:text-lime-400',
  'jasa-jahit': 'text-sky-600 dark:text-sky-400',
};

interface CategorySectionProps {
  categories?: Category[];
}

// Default categories if none provided - 10 UMKM categories
const defaultCategories: Category[] = [
  { id: '1', name: 'Kuliner & Kue', slug: 'kuliner-kue', iconUrl: null, imageBannerUrl: null, listingCount: 0 },
  { id: '2', name: 'Fashion Lokal', slug: 'fashion-lokal', iconUrl: null, imageBannerUrl: null, listingCount: 0 },
  { id: '3', name: 'Kerajinan Tangan', slug: 'kerajinan-tangan', iconUrl: null, imageBannerUrl: null, listingCount: 0 },
  { id: '4', name: 'Kopi & Minuman', slug: 'kopi-minuman', iconUrl: null, imageBannerUrl: null, listingCount: 0 },
  { id: '5', name: 'Jasa Kreatif', slug: 'jasa-kreatif', iconUrl: null, imageBannerUrl: null, listingCount: 0 },
  { id: '6', name: 'Produk Kecantikan', slug: 'produk-kecantikan', iconUrl: null, imageBannerUrl: null, listingCount: 0 },
  { id: '7', name: 'Tas & Aksesoris', slug: 'tas-aksesoris', iconUrl: null, imageBannerUrl: null, listingCount: 0 },
  { id: '8', name: 'Makanan Olahan', slug: 'makanan-olahan', iconUrl: null, imageBannerUrl: null, listingCount: 0 },
  { id: '9', name: 'Tanaman Hias', slug: 'tanaman-hias', iconUrl: null, imageBannerUrl: null, listingCount: 0 },
  { id: '10', name: 'Jasa Jahit', slug: 'jasa-jahit', iconUrl: null, imageBannerUrl: null, listingCount: 0 },
];

export function CategorySection({ categories = defaultCategories }: CategorySectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      checkScrollButtons();
      scrollContainer.addEventListener('scroll', checkScrollButtons);
      window.addEventListener('resize', checkScrollButtons);
      
      return () => {
        scrollContainer.removeEventListener('scroll', checkScrollButtons);
        window.removeEventListener('resize', checkScrollButtons);
      };
    }
  }, []);

  return (
    <section className="py-3 bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="relative group/carousel">
          {/* Left Arrow - Positioned on the left edge */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-background/95 backdrop-blur-sm border-2 border-border shadow-lg flex items-center justify-center hover:bg-muted hover:scale-110 transition-all duration-200 opacity-0 group-hover/carousel:opacity-100"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {/* Right Arrow - Positioned on the right edge */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-background/95 backdrop-blur-sm border-2 border-border shadow-lg flex items-center justify-center hover:bg-muted hover:scale-110 transition-all duration-200 opacity-0 group-hover/carousel:opacity-100"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}

          {/* Categories Container */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-8 overflow-x-auto pb-3 scrollbar-hide scroll-smooth px-2"
          >
            {categories.map((category) => {
              const Icon = categoryIcons[category.slug] || MoreHorizontal;
              const solidColorClass = categorySolidColors[category.slug] || 'bg-gray-500 hover:bg-gray-600';

              return (
                <Link
                  key={category.id}
                  href={`/marketplace?category=${category.slug}`}
                  className="flex-shrink-0 flex flex-col items-center gap-2 group"
                >
                  {/* Circular Icon Container with Solid Color */}
                  <div className={cn(
                    'w-16 h-16 rounded-full flex items-center justify-center',
                    solidColorClass,
                    'shadow-md hover:shadow-lg transition-all duration-300',
                    'group-hover:scale-110'
                  )}>
                    <Icon className="h-8 w-8 text-white" strokeWidth={2} />
                  </div>
                  
                  {/* Category Name */}
                  <span className="text-xs text-center font-medium line-clamp-2 max-w-[70px] text-foreground">
                    {category.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
