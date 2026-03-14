'use client';

import { useState, useEffect } from 'react';

interface ListingImage {
  image_url: string;
  is_primary: boolean;
}

interface Listing {
  id: string;
  title: string;
  price: number;
  status: string;
  view_count: number | null;
  created_at: string | null;
  listing_images: ListingImage[];
}

interface UseUserListingsResult {
  listings: Listing[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUserListings(): UseUserListingsResult {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get demo user from localStorage for authentication
      const demoUser = localStorage.getItem('demoUser');
      const headers: HeadersInit = {};
      
      if (demoUser) {
        const user = JSON.parse(demoUser);
        headers['Authorization'] = `Bearer ${user.id}`;
      }

      const response = await fetch('/api/dashboard/listings', { headers });
      
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }

      const data = await response.json();
      setListings(data.listings || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  return {
    listings,
    loading,
    error,
    refetch: fetchListings,
  };
}
