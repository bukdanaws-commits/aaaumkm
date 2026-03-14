'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { ListingForm } from '@/components/listing/ListingForm';
import { Loader2 } from 'lucide-react';

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState<any>(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await fetch(`/api/listing/${listingId}`);
        if (res.ok) {
          const data = await res.json();
          setListing(data.listing);
        } else {
          router.push('/dashboard/listings');
        }
      } catch (error) {
        console.error('Failed to fetch listing:', error);
        router.push('/dashboard/listings');
      } finally {
        setLoading(false);
      }
    };

    if (listingId) {
      fetchListing();
    }
  }, [listingId, router]);

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!listing) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Iklan Tidak Ditemukan</h1>
            <p className="text-muted-foreground">Iklan yang Anda cari tidak ditemukan.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Edit Iklan</h1>
          <ListingForm
            mode="edit"
            listingId={listingId}
            initialData={{
              title: listing.title,
              description: listing.description,
              price: listing.price,
              categoryId: listing.categoryId,
              condition: listing.condition,
              city: listing.city,
              province: listing.province,
              listingType: listing.listingType,
              images: listing.images || [],
            }}
          />
        </div>
      </div>
    </MainLayout>
  );
}
