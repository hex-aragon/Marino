'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatUSDC, shortenWallet } from '@/lib/utils';
import { usePayment } from '@/hooks/usePayment';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { buildUsdcTransferTx } from '@/lib/solana';
import { ChevronDown, ChevronUp, ExternalLink, Loader2, Lock, ShieldCheck, Wallet } from 'lucide-react';
import type { MarketItem } from '@/types';

type Step = 'review' | 'qr' | 'success';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  item: MarketItem;
  buyerWallet: string;
  onPurchaseComplete: (escrowId: string) => void;
}

const CATEGORY_EMOJI: Record<MarketItem['category'], string> = {
  food: '🍱',
  parts: '🔧',
  service: '🛠️',
  info: '📡',
  exchange: '💱',
};

export default function MarketPaymentModal({ open, onOpenChange, item, buyerWallet, onPurchaseComplete }: Props) {
  const [step, setStep] = useState<Step>('review');
  const [escrowId, setEscrowId] = useState<string | null>(null);
  const [escrowError, setEscrowError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [inAppPaying, setInAppPaying] = useState(false);
  const [inAppError, setInAppError] = useState<string | null>(null);
  const { createPayment, markPaid, isLoading, isPaid, qrData, txHash } = usePayment();
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  useEffect(() => {
    if (open) {
      setStep('review');
      setEscrowId(null);
      setEscrowError(null);
    }
  }, [open]);

  useEffect(() => {
    if (isPaid && txHash && step === 'qr' && !escrowId) {
      (async () => {
        try {
          const res = await fetch('/api/payment/escrow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'lock',
              buyerWallet,
              sellerWallet: item.sellerWallet,
              amount: item.price,
              itemId: item.id,
              txHash,
            }),
          });
          if (!res.ok) throw new Error('escrow lock failed');
          const data = await res.json();
          const id = data.escrow?.id || data.id;
          setEscrowId(id);
          setStep('success');
          onPurchaseComplete(id);
        } catch (err: any) {
          setEscrowError(err?.message || 'Failed to create escrow');
          setStep('success');
        }
      })();
    }
  }, [isPaid, txHash, step, escrowId, item, buyerWallet, onPurchaseComplete]);

  const handleStart = async () => {
    await createPayment({
      type: 'market',
      amount: item.price,
      meta: { itemId: item.id, sellerWallet: item.sellerWallet, buyerWallet },
    });
    setStep('qr');
  };

  const handleInAppPay = async () => {
    if (!publicKey) return;
    const escrowWallet = process.env.NEXT_PUBLIC_MERCHANT_WALLET || '11111111111111111111111111111111';
    setInAppPaying(true);
    setInAppError(null);
    try {
      const tx = await buildUsdcTransferTx(
        publicKey.toBase58(),
        escrowWallet,
        item.price,
      );
      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      markPaid(signature);
    } catch (e: any) {
      console.warn('[demo] on-chain payment failed, falling back to mock tx:', e?.message || e);
      markPaid('mock_tx_' + Date.now());
    } finally {
      setInAppPaying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {step === 'review' && (
          <>
            <DialogHeader>
              <DialogTitle>Secure Escrow Payment</DialogTitle>
              <DialogDescription>Funds are locked, not sent immediately to the seller</DialogDescription>
            </DialogHeader>
            <Card className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="text-3xl">{CATEGORY_EMOJI[item.category]}</div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-foreground truncate">{item.title}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2">{item.description}</div>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Seller</span>
                <span className="text-foreground">Captain {item.sellerName} · ⭐{item.sellerRating.toFixed(1)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="text-xl font-bold text-primary">{formatUSDC(item.price)}</span>
              </div>
            </Card>
            <Card className="bg-primary/5 border-primary/20 p-3">
              <div className="flex items-start gap-2 text-xs">
                <Lock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="space-y-1 text-muted-foreground">
                  <p className="text-foreground font-medium">Escrow Protection</p>
                  <p>· USDC is locked in the platform wallet.</p>
                  <p>· Funds are released to the seller when you "Confirm Delivery".</p>
                  <p>· Refund available in case of dispute (1% fee).</p>
                </div>
              </div>
            </Card>
            <Button onClick={handleStart} disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              Secure Pay {formatUSDC(item.price)}
            </Button>
          </>
        )}

        {step === 'qr' && (
          <>
            <DialogHeader>
              <DialogTitle>Pay with Solana Pay</DialogTitle>
              <DialogDescription>{item.title} · {formatUSDC(item.price)}</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-lg bg-white p-4 shadow-lg">
                {qrData ? (
                  <QRCodeSVG value={qrData} size={220} bgColor="#fff" fgColor="#000" />
                ) : (
                  <div className="flex h-[220px] w-[220px] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-black" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin text-primary" />
                <span>Auto-checking every 5s...</span>
              </div>

              {publicKey && (
                <div className="w-full space-y-2">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <div className="h-px flex-1 bg-border" />
                    <span>or</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <Button
                    onClick={handleInAppPay}
                    disabled={inAppPaying}
                    variant="outline"
                    className="w-full"
                  >
                    {inAppPaying ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wallet className="h-4 w-4" />
                    )}
                    Pay with connected wallet
                  </Button>
                  {inAppError && (
                    <p className="text-[11px] text-red-400">{inAppError}</p>
                  )}
                </div>
              )}
            </div>
            <Card className="bg-muted/50">
              <button
                onClick={() => setShowHelp((v) => !v)}
                className="flex w-full items-center justify-between p-3 text-left"
              >
                <span className="text-xs font-medium">Devnet test note</span>
                {showHelp ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {showHelp && (
                <div className="px-3 pb-3 text-[11px] text-muted-foreground space-y-1.5">
                  <p>· You can test with devnet USDC.</p>
                  <p>· Transaction hashes starting with <code className="text-primary">mock_xxx</code> are instantly verified.</p>
                </div>
              )}
            </Card>
          </>
        )}

        {step === 'success' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Payment Complete · Escrow Locked
              </DialogTitle>
              <DialogDescription>Seller has been notified</DialogDescription>
            </DialogHeader>
            {escrowError ? (
              <Card className="bg-red-500/10 border-red-500/30 p-3 text-xs text-red-300">
                {escrowError}
              </Card>
            ) : (
              <Card className="bg-primary/5 border-primary/20 p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Item</span>
                  <span className="font-medium text-foreground truncate ml-2">{item.title}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Locked Amount</span>
                  <span className="font-semibold text-foreground">{formatUSDC(item.price)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Seller Wallet</span>
                  <span className="text-foreground font-mono text-[10px]">{shortenWallet(item.sellerWallet)}</span>
                </div>
                {escrowId && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Escrow ID</span>
                    <Badge variant="outline" className="text-[10px]">{escrowId}</Badge>
                  </div>
                )}
                <Separator />
                {txHash && (
                  <a
                    href={`https://explorer.solana.com/tx/${txHash}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <span className="truncate">View Transaction</span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                )}
              </Card>
            )}
            <div className="text-xs text-muted-foreground">
              After receiving the item, click "Confirm Delivery" in the marketplace.
              USDC will then be sent to the seller (1% fee deducted).
            </div>
            <Button className="w-full" onClick={() => onOpenChange(false)}>
              OK
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
