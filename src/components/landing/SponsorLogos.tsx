'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface Sponsor {
  id: string;
  name: string;
  logoUrl: string;
  website: string;
  category: string;
  isActive: boolean;
  sortOrder: number;
}

export function SponsorLogos() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch sponsors from API
  useEffect(() => {
    async function fetchSponsors() {
      try {
        const response = await fetch('/api/sponsors');
        if (response.ok) {
          const data = await response.json();
          setSponsors(data);
        }
      } catch (error) {
        console.error('Failed to fetch sponsors:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSponsors();
  }, []);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || sponsors.length === 0) return;

    let scrollInterval: NodeJS.Timeout;
    
    const startScrolling = () => {
      scrollInterval = setInterval(() => {
        if (scrollContainer) {
          // Scroll to right
          scrollContainer.scrollLeft += 1;
          
          // Reset to start when reaching end
          if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
            scrollContainer.scrollLeft = 0;
          }
        }
      }, 20); // Smooth scroll speed
    };

    startScrolling();

    // Pause on hover
    const handleMouseEnter = () => clearInterval(scrollInterval);
    const handleMouseLeave = () => startScrolling();

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearInterval(scrollInterval);
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [sponsors]);

  // Duplicate sponsors for infinite scroll effect
  const duplicatedSponsors = [...sponsors, ...sponsors];

  if (loading) {
    return (
      <section className="py-8 bg-muted/30 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Didukung Oleh
            </h3>
            <p className="text-sm text-muted-foreground">
              Partner BUMN dan Perusahaan Terpercaya
            </p>
          </div>
          <div className="flex gap-6 justify-center">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-32 h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Didukung Oleh
          </h3>
          <p className="text-sm text-muted-foreground">
            Partner BUMN dan Perusahaan Terpercaya
          </p>
        </div>

        {/* Carousel Container */}
        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-hidden scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {duplicatedSponsors.map((sponsor, index) => (
            <Link
              key={`${sponsor.id}-${index}`}
              href={sponsor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 w-32 h-16 flex items-center justify-center bg-background rounded-lg border hover:shadow-lg hover:scale-105 transition-all duration-300 p-3"
            >
              <div className="relative w-full h-full">
                <Image
                  src={sponsor.logoUrl}
                  alt={sponsor.name}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-4">
          <p className="text-xs text-muted-foreground">
            Marketplace UMKM Indonesia - Platform Terpercaya untuk UMKM
          </p>
        </div>
      </div>

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
