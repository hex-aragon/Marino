'use client';

import { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';
import type { MarketItem, PaymentRequest } from '@/types';

type Port = 'busan' | 'incheon' | 'any';
type Category = MarketItem['category'] | 'all';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('fetch failed');
  return res.json();
};

export interface CreateItemInput {
  title: string;
  description: string;
  category: MarketItem['category'];
  price: number;
  sellerWallet: string;
  sellerName: string;
  port: MarketItem['port'];
  deliveryTime: string;
  stock: number;
}

export interface PurchaseResult {
  payment: PaymentRequest;
  escrowDraft: {
    itemId: string;
    sellerWallet: string;
    buyerWallet: string;
    amount: number;
  };
  item: MarketItem;
}

export function useMarket(initialArea: Port = 'busan') {
  const [area, setArea] = useState<Port>(initialArea);
  const [category, setCategory] = useState<Category>('all');
  const [query, setQuery] = useState<string>('');

  const url = useMemo(() => {
    const p = new URLSearchParams();
    if (area && area !== 'any') p.set('port', area);
    if (category && category !== 'all') p.set('category', category);
    if (query.trim()) p.set('q', query.trim());
    return `/api/marketplace/items?${p.toString()}`;
  }, [area, category, query]);

  const { data, isLoading, mutate } = useSWR<{ items: MarketItem[] }>(url, fetcher, {
    refreshInterval: 15_000,
    revalidateOnFocus: false,
  });

  const items = data?.items ?? [];

  const createItem = useCallback(
    async (input: CreateItemInput): Promise<MarketItem | null> => {
      try {
        const res = await fetch('/api/marketplace/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });
        if (!res.ok) return null;
        const item: MarketItem = await res.json();
        mutate();
        return item;
      } catch {
        return null;
      }
    },
    [mutate]
  );

  const purchaseItem = useCallback(
    async (itemId: string, buyerWallet: string): Promise<PurchaseResult | null> => {
      try {
        const res = await fetch('/api/marketplace/purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId, buyerWallet }),
        });
        if (!res.ok) return null;
        return (await res.json()) as PurchaseResult;
      } catch {
        return null;
      }
    },
    []
  );

  return {
    items,
    isLoading,
    area,
    setArea,
    category,
    setCategory,
    query,
    setQuery,
    createItem,
    purchaseItem,
    refresh: mutate,
  };
}
