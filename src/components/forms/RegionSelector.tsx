'use client';

import { useRegions } from '@/hooks/useRegions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface RegionSelectorProps {
  provinceId?: string;
  regencyId?: string;
  districtId?: string;
  villageId?: string;
  onProvinceChange?: (value: string) => void;
  onRegencyChange?: (value: string) => void;
  onDistrictChange?: (value: string) => void;
  onVillageChange?: (value: string) => void;
  showVillage?: boolean;
  required?: boolean;
}

export function RegionSelector({
  provinceId,
  regencyId,
  districtId,
  villageId,
  onProvinceChange,
  onRegencyChange,
  onDistrictChange,
  onVillageChange,
  showVillage = false,
  required = false,
}: RegionSelectorProps) {
  const {
    provinces,
    regencies,
    districts,
    villages,
    loadingProvinces,
    loadingRegencies,
    loadingDistricts,
    loadingVillages,
    fetchRegencies,
    fetchDistricts,
    fetchVillages,
  } = useRegions();

  const handleProvinceChange = (value: string) => {
    onProvinceChange?.(value);
    fetchRegencies(value);
    // Reset dependent fields
    onRegencyChange?.('');
    onDistrictChange?.('');
    onVillageChange?.('');
  };

  const handleRegencyChange = (value: string) => {
    onRegencyChange?.(value);
    fetchDistricts(value);
    // Reset dependent fields
    onDistrictChange?.('');
    onVillageChange?.('');
  };

  const handleDistrictChange = (value: string) => {
    onDistrictChange?.(value);
    if (showVillage) {
      fetchVillages(value);
    }
    // Reset dependent field
    onVillageChange?.('');
  };

  return (
    <div className="space-y-4">
      {/* Province */}
      <div className="space-y-2">
        <Label htmlFor="province">
          Provinsi {required && <span className="text-destructive">*</span>}
        </Label>
        <Select
          value={provinceId}
          onValueChange={handleProvinceChange}
          disabled={loadingProvinces}
        >
          <SelectTrigger id="province">
            <SelectValue placeholder="Pilih Provinsi" />
          </SelectTrigger>
          <SelectContent>
            {provinces.map((province) => (
              <SelectItem key={province.id} value={province.id}>
                {province.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Regency */}
      <div className="space-y-2">
        <Label htmlFor="regency">
          Kabupaten/Kota {required && <span className="text-destructive">*</span>}
        </Label>
        <Select
          value={regencyId}
          onValueChange={handleRegencyChange}
          disabled={!provinceId || loadingRegencies}
        >
          <SelectTrigger id="regency">
            <SelectValue placeholder="Pilih Kabupaten/Kota" />
          </SelectTrigger>
          <SelectContent>
            {regencies.map((regency) => (
              <SelectItem key={regency.id} value={regency.id}>
                {regency.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* District */}
      <div className="space-y-2">
        <Label htmlFor="district">
          Kecamatan {required && <span className="text-destructive">*</span>}
        </Label>
        <Select
          value={districtId}
          onValueChange={handleDistrictChange}
          disabled={!regencyId || loadingDistricts}
        >
          <SelectTrigger id="district">
            <SelectValue placeholder="Pilih Kecamatan" />
          </SelectTrigger>
          <SelectContent>
            {districts.map((district) => (
              <SelectItem key={district.id} value={district.id}>
                {district.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Village (Optional) */}
      {showVillage && (
        <div className="space-y-2">
          <Label htmlFor="village">
            Desa/Kelurahan {required && <span className="text-destructive">*</span>}
          </Label>
          <Select
            value={villageId}
            onValueChange={onVillageChange}
            disabled={!districtId || loadingVillages}
          >
            <SelectTrigger id="village">
              <SelectValue placeholder="Pilih Desa/Kelurahan" />
            </SelectTrigger>
            <SelectContent>
              {villages.map((village) => (
                <SelectItem key={village.id} value={village.id}>
                  {village.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
