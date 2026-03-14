'use client';

import { useState, useEffect } from 'react';

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconUrl: string | null;
  imageBannerUrl: string | null;
  listingCount: number;
}

export interface Listing {
  id: string;
  title: string;
  slug: string;
  price: number;
  priceType: string;
  condition: string;
  city: string | null;
  province: string | null;
  viewCount: number;
  favoriteCount: number;
  isFeatured: boolean;
  imageUrl: string | null;
  category: {
    name: string;
    slug: string;
  } | null;
  createdAt: string;
}

export interface Auction {
  id: string;
  listingId: string;
  startingPrice: number;
  currentPrice: number;
  buyNowPrice: number | null;
  endsAt: string;
  totalBids: number;
  listing: {
    id: string;
    title: string;
    slug: string;
    city: string | null;
    province: string | null;
    imageUrl: string | null;
    category: {
      name: string;
      slug: string;
    } | null;
  } | null;
  highestBid: number;
}

interface LandingData {
  categories: Category[];
  featuredListings: Listing[];
  premiumBoostedListings: Listing[];
  highlightedListingIds: string[];
  latestListings: Listing[];
  popularListings: Listing[];
  activeAuctions: Auction[];
}

export function useLandingData() {
  const [data, setData] = useState<LandingData>({
    categories: [],
    featuredListings: [],
    premiumBoostedListings: [],
    highlightedListingIds: [],
    latestListings: [],
    popularListings: [],
    activeAuctions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/landing');
        
        if (!response.ok) {
          throw new Error('Failed to fetch landing data');
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Error fetching landing data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    ...data,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      fetch('/api/landing')
        .then(res => res.json())
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    },
  };
}
