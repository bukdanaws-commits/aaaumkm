'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Banner ads with Unsplash images
const banners = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=150&fit=crop',
    alt: 'Banner Iklan 1 - Produk UMKM',
    link: '/marketplace',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=150&fit=crop',
    alt: 'Banner Iklan 2 - Fashion Lokal',
    link: '/marketplace?category=fashion-lokal',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=1200&h=150&fit=crop',
    alt: 'Banner Iklan 3 - Kuliner',
    link: '/marketplace?category=kuliner-kue',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=150&fit=crop',
    alt: 'Banner Iklan 4 - Kerajinan Tangan',
    link: '/marketplace?category=kerajinan-tangan',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=150&fit=crop',
    alt: 'Banner Iklan 5 - Produk Kecantikan',
    link: '/marketplace?category=produk-kecantikan',
  },
];

export function BannerCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-play carousel
  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(nextSlide, 4000);
      return () => clearInterval(interval);
    }
  }, [isHovered, nextSlide]);

  return (
    <section className="py-2 bg-background">
      <div className="container mx-auto px-4">
        <div 
          className="relative h-[150px] rounded-xl overflow-hidden group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Banner Images */}
          <div className="relative h-full">
            {banners.map((banner, index) => (
              <a
                key={banner.id}
                href={banner.link}
                className={cn(
                  'absolute inset-0 transition-opacity duration-500',
                  index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                )}
              >
                <Image
                  src={banner.image}
                  alt={banner.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  priority={index === 0}
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
              </a>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label="Previous banner"
          >
            <ChevronLeft className="h-5 w-5 text-gray-800" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label="Next banner"
          >
            <ChevronRight className="h-5 w-5 text-gray-800" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  index === currentIndex 
                    ? 'w-6 bg-white' 
                    : 'w-1.5 bg-white/50 hover:bg-white/75'
                )}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
