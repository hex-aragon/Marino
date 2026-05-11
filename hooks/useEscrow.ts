'use client';

import { useCallback, useState } from 'react';
import useSWR from 'swr';
import type { Escrow } from '@/types';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('fetch failed');
  return res.json();
};

export function useEscrow(initialId?: string) {
  const [escrowId, setEscrowId] = useState<string | null>(initialId ?? null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading, mutate } = useSWR<Escrow>(
    escrowId ? `/api/payment/escrow?id=${escrowId}` : null,
    fetcher,
    {
      refreshInterval: 5_000,
      revalidateOnFocus: false,
    }
  );

  const callAction = useCallback(
    async (action: 'release' | 'refund'): Promise<Escrow | null> => {
      if (!escrowId) return null;
      setActionLoading(true);
      setActionError(null);
      try {
        const res = await fetch('/api/payment/escrow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, escrowId }),
        });
        if (!res.ok) {
          setActionError('action failed');
          return null;
        }
        const updated: Escrow = await res.json();
        mutate(updated, { revalidate: false });
        return updated;
      } catch (e: any) {
        setActionError(e?.message || 'action error');
        return null;
      } finally {
        setActionLoading(false);
      }
    },
    [escrowId, mutate]
  );

  const confirmDelivery = useCallback(() => callAction('release'), [callAction]);
  const requestRefund = useCallback(() => callAction('refund'), [callAction]);

  return {
    escrow: data ?? null,
    escrowId,
    setEscrowId,
    isLoading: isLoading || actionLoading,
    actionError,
    confirmDelivery,
    requestRefund,
    refresh: mutate,
  };
}
