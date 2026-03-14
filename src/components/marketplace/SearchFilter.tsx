'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Search, SlidersHorizontal, X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface SearchFilterProps {
  onCategoryChange?: (category: string | null) => void;
  selectedCategory?: string | null;
  categories: Category[];
}

export function SearchFilter({
  onCategoryChange,
  selectedCategory,
  categories,
}: SearchFilterProps) {
  const [search, setSearch] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [condition, setCondition] = useState<string | null>(null);
  const [location, setLocation] = useState('');

  const activeFilters = [
    selectedCategory && categories.find((c) => c.id === selectedCategory)?.name,
    condition === 'new' && 'Baru',
    condition === 'used' && 'Bekas',
    priceMin && `Min: ${priceMin}`,
    priceMax && `Max: ${priceMax}`,
    location,
  ].filter(Boolean);

  const clearFilters = () => {
    onCategoryChange?.(null);
    setCondition(null);
    setPriceMin('');
    setPriceMax('');
    setLocation('');
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filter Button - Mobile */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="sm:hidden gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filter
            {activeFilters.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilters.length}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px]">
          <SheetHeader>
            <SheetTitle>Filter</SheetTitle>
          </SheetHeader>
          <div className="space-y-6 mt-6">
            {/* Categories */}
            <div>
              <h4 className="font-medium mb-3">Kategori</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={!selectedCategory ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onCategoryChange?.(null)}
                >
                  Semua
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onCategoryChange?.(cat.id)}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h4 className="font-medium mb-3">Harga</h4>
              <div className="flex gap-2">
                <Input
                  placeholder="Min"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Max"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Condition */}
            <div>
              <h4 className="font-medium mb-3">Kondisi</h4>
              <div className="flex gap-2">
                <Button
                  variant={condition === 'new' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCondition(condition === 'new' ? null : 'new')}
                >
                  Baru
                </Button>
                <Button
                  variant={condition === 'used' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCondition(condition === 'used' ? null : 'used')}
                >
                  Bekas
                </Button>
              </div>
            </div>

            {/* Location */}
            <div>
              <h4 className="font-medium mb-3">Lokasi</h4>
              <Input
                placeholder="Kota atau Provinsi"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            {/* Clear Filters */}
            {activeFilters.length > 0 && (
              <Button variant="outline" className="w-full" onClick={clearFilters}>
                Hapus Semua Filter
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Active Filters - Desktop */}
      {activeFilters.length > 0 && (
        <div className="hidden sm:flex items-center gap-2 flex-wrap">
          {activeFilters.map((filter, index) => (
            <Badge key={index} variant="secondary" className="gap-1">
              {filter}
              <button
                onClick={() => {
                  if (index === 0) onCategoryChange?.(null);
                  if (index === 1 || index === 2) setCondition(null);
                  if (index === 3) setPriceMin('');
                  if (index === 4) setPriceMax('');
                  if (index === 5) setLocation('');
                }}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground"
          >
            Hapus semua
          </Button>
        </div>
      )}
    </div>
  );
}
