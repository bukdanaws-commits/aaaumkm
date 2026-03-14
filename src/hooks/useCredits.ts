'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

interface CreditsData {
  balance: number;
  totalBonus?: number;
  totalPurchased?: number;
  totalUsed?: number;
}

export function useCredits() {
  const { user } = useAuth();
  const [credits, setCredits] = useState<CreditsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCredits = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setCredits({ balance: 0 });
      return;
    }

    try {
      const response = await fetch('/api/credits/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits);
      } else {
        setCredits({ balance: 0 });
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
      setCredits({ balance: 0 });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  const refetchCredits = useCallback(() => {
    fetchCredits();
  }, [fetchCredits]);

  return { credits, loading, refetchCredits };
}
