'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface LocationMapProps {
  address?: string | null;
  city?: string | null;
  province?: string | null;
  className?: string;
}

interface Coordinates {
  lat: number;
  lon: number;
}

export function LocationMap({ address, city, province, className = '' }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchQuery = address 
    ? `${address}, ${city || ''}, ${province || ''}`
    : `${city || ''}, ${province || ''}`;

  useEffect(() => {
    const geocodeAddress = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiKey = process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY;
        if (!apiKey) {
          throw new Error('LocationIQ API key not configured');
        }

        // Geocode the address to get coordinates
        const geocodeUrl = `https://us1.locationiq.com/v1/search?key=${apiKey}&q=${encodeURIComponent(searchQuery)}&format=json&limit=1`;
        
        const response = await fetch(geocodeUrl);
        if (!response.ok) {
          throw new Error('Failed to geocode address');
        }

        const data = await response.json();
        if (data && data.length > 0) {
          setCoordinates({
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon),
          });
        } else {
          throw new Error('Location not found');
        }
      } catch (err) {
        console.error('Geocoding error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load map');
      } finally {
        setLoading(false);
      }
    };

    if (searchQuery) {
      geocodeAddress();
    }
  }, [searchQuery]);

  useEffect(() => {
    if (!coordinates || !mapRef.current) return;

    // Load Leaflet dynamically
    const loadLeaflet = async () => {
      // @ts-ignore
      if (typeof window !== 'undefined' && !window.L) {
        // Load Leaflet CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        // Load Leaflet JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        
        await new Promise((resolve) => {
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      // @ts-ignore
      const L = window.L;
      if (!L || !mapRef.current) return;

      // Clear existing map
      mapRef.current.innerHTML = '';

      // Create map
      const map = L.map(mapRef.current).setView([coordinates.lat, coordinates.lon], 15);

      // Add tile layer using LocationIQ tiles
      L.tileLayer(
        `https://tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.png?key=${process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY}`,
        {
          attribution: '&copy; <a href="https://locationiq.com/">LocationIQ</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }
      ).addTo(map);

      // Add marker
      const marker = L.marker([coordinates.lat, coordinates.lon]).addTo(map);
      marker.bindPopup(`<b>${city || 'Lokasi'}</b><br>${address || ''}`).openPopup();

      // Cleanup
      return () => {
        map.remove();
      };
    };

    loadLeaflet();
  }, [coordinates, address, city]);

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`;

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-48 bg-muted rounded-lg ${className}`}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Memuat peta...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-48 bg-muted rounded-lg ${className}`}>
        <div className="text-center px-4">
          <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-3">{error}</p>
          <Button variant="outline" size="sm" asChild>
            <Link href={googleMapsUrl} target="_blank">
              <ExternalLink className="h-4 w-4 mr-2" />
              Buka di Google Maps
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div 
        ref={mapRef} 
        className="w-full h-48 rounded-lg overflow-hidden border"
        style={{ zIndex: 0 }}
      />
      <div className="mt-3">
        <Button variant="outline" size="sm" asChild className="w-full">
          <Link href={googleMapsUrl} target="_blank">
            <MapPin className="h-4 w-4 mr-2" />
            Buka di Google Maps
          </Link>
        </Button>
      </div>
    </div>
  );
}
