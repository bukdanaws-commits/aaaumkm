import { useState, useEffect } from 'react';

interface Province {
  id: string;
  name: string;
}

interface Regency {
  id: string;
  name: string;
  type: string;
}

interface District {
  id: string;
  name: string;
}

interface Village {
  id: string;
  name: string;
  type: string;
  postalCode?: string;
}

export function useRegions() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [regencies, setRegencies] = useState<Regency[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingRegencies, setLoadingRegencies] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);

  // Fetch provinces on mount
  useEffect(() => {
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    setLoadingProvinces(true);
    try {
      const response = await fetch('/api/regions/provinces');
      const data = await response.json();
      if (data.success) {
        setProvinces(data.provinces);
      }
    } catch (error) {
      console.error('Error fetching provinces:', error);
    } finally {
      setLoadingProvinces(false);
    }
  };

  const fetchRegencies = async (provinceId: string) => {
    if (!provinceId) {
      setRegencies([]);
      return;
    }
    
    setLoadingRegencies(true);
    setRegencies([]);
    setDistricts([]);
    setVillages([]);
    
    try {
      const response = await fetch(`/api/regions/regencies?provinceId=${provinceId}`);
      const data = await response.json();
      if (data.success) {
        setRegencies(data.regencies);
      }
    } catch (error) {
      console.error('Error fetching regencies:', error);
    } finally {
      setLoadingRegencies(false);
    }
  };

  const fetchDistricts = async (regencyId: string) => {
    if (!regencyId) {
      setDistricts([]);
      return;
    }
    
    setLoadingDistricts(true);
    setDistricts([]);
    setVillages([]);
    
    try {
      const response = await fetch(`/api/regions/districts?regencyId=${regencyId}`);
      const data = await response.json();
      if (data.success) {
        setDistricts(data.districts);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const fetchVillages = async (districtId: string) => {
    if (!districtId) {
      setVillages([]);
      return;
    }
    
    setLoadingVillages(true);
    setVillages([]);
    
    try {
      const response = await fetch(`/api/regions/villages?districtId=${districtId}`);
      const data = await response.json();
      if (data.success) {
        setVillages(data.villages);
      }
    } catch (error) {
      console.error('Error fetching villages:', error);
    } finally {
      setLoadingVillages(false);
    }
  };

  return {
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
  };
}
