'use client';
import { useState, useEffect, useCallback } from 'react';
import type { PortfolioCompany } from '@/lib/types';

const STORAGE_KEY = 'playfair-custom-companies';

export function useCustomPortfolio() {
  const [customCompanies, setCustomCompanies] = useState<PortfolioCompany[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setCustomCompanies(JSON.parse(stored));
    } catch {}
    setLoaded(true);
  }, []);

  const addCompany = useCallback((company: PortfolioCompany) => {
    setCustomCompanies((prev) => {
      const updated = [...prev, { ...company, custom: true }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeCompany = useCallback((id: string) => {
    setCustomCompanies((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { customCompanies, addCompany, removeCompany, loaded };
}
