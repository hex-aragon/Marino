'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PaymentRequest } from '@/types';

interface CreateInput {
  type: 'subscription' | 'market';
  amount?: number;
  meta?: Record<string, any>;
}

const POLL_INTERVAL_MS = 5_000;
const MAX_POLL_ATTEMPTS = 60;

export function usePayment() {
  const [isLoading, setIsLoading] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [qrData, setQrData] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const attemptsRef = useRef(0);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stopPolling();
    setIsLoading(false);
    setIsPaid(false);
    setQrData(null);
    setReference(null);
    setPaymentRequest(null);
    setTxHash(null);
    setError(null);
    attemptsRef.current = 0;
  }, [stopPolling]);

  const verifyPayment = useCallback(async (ref: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/payment/verify?reference=${encodeURIComponent(ref)}`);
      if (!res.ok) return false;
      const data = await res.json();
      if (data?.verified) {
        setTxHash(data.signature || null);
        setIsPaid(true);
        return true;
      }
    } catch {}
    return false;
  }, []);

  const createPayment = useCallback(
    async (input: CreateInput): Promise<PaymentRequest | null> => {
      reset();
      setIsLoading(true);
      try {
        const res = await fetch('/api/payment/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });
        if (!res.ok) throw new Error('create failed');
        const data: PaymentRequest = await res.json();
        setPaymentRequest(data);
        setQrData(data.qrData);
        setReference(data.reference);
        setIsLoading(false);
        return data;
      } catch (e: any) {
        setError(e?.message || 'create error');
        setIsLoading(false);
        return null;
      }
    },
    [reset]
  );

  useEffect(() => {
    if (!reference || isPaid) return;
    attemptsRef.current = 0;
    stopPolling();

    pollTimerRef.current = setInterval(async () => {
      attemptsRef.current += 1;
      if (attemptsRef.current > MAX_POLL_ATTEMPTS) {
        stopPolling();
        return;
      }
      const ok = await verifyPayment(reference);
      if (ok) stopPolling();
    }, POLL_INTERVAL_MS);

    return () => stopPolling();
  }, [reference, isPaid, verifyPayment, stopPolling]);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  return {
    createPayment,
    verifyPayment,
    reset,
    isLoading,
    isPaid,
    qrData,
    reference,
    paymentRequest,
    txHash,
    error,
  };
}
