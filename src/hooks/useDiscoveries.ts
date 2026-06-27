'use client';
import { useState, useEffect, useCallback } from 'react';
import type { DiscoveriesStore, SavedExpansion } from '@/lib/types';

const EMPTY: DiscoveriesStore = { version: 1, expansions: [] };
const LS_KEY = 'playfair-discoveries';

export function useDiscoveries() {
  const [store, setStore] = useState<DiscoveriesStore>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load: localStorage first (instant), then merge with GitHub (authoritative)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setStore(JSON.parse(raw));
    } catch { /* ignore */ }

    fetch('/api/discoveries', { cache: 'no-store' })
      .then((r) => r.json())
      .then((remote: DiscoveriesStore) => {
        if (remote.expansions.length > 0) {
          setStore(remote);
          try { localStorage.setItem(LS_KEY, JSON.stringify(remote)); } catch { /* ignore */ }
        }
      })
      .catch(() => { /* offline — use localStorage */ })
      .finally(() => setLoading(false));
  }, []);

  const saveExpansion = useCallback(async (expansion: Omit<SavedExpansion, 'id' | 'savedAt'>) => {
    setSaving(true);

    // Optimistic local update
    setStore((prev) => {
      const next = {
        ...prev,
        expansions: [
          { ...expansion, id: `${expansion.company.id}-${Date.now()}`, savedAt: new Date().toISOString() },
          ...prev.expansions.filter((e) => e.company.id !== expansion.company.id),
        ],
      };
      try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });

    // Background GitHub write — silent fail is OK
    fetch('/api/discoveries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expansion),
    })
      .catch(() => { /* no token or network error — localStorage is the fallback */ })
      .finally(() => setSaving(false));
  }, []);

  return { store, loading, saving, saveExpansion };
}
