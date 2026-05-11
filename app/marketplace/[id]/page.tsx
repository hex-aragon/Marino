'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import MarketPaymentModal from '@/components/MarketPaymentModal';
import EscrowStatus from '@/components/EscrowStatus';
import { ConnectWalletButton } from '@/components/ConnectWalletButton';
import { useWallet } from '@solana/wallet-adapter-react';
import { formatUSDC, shortenWallet, timeAgo } from '@/lib/utils';
import { Anchor, ArrowLeft, Clock, Loader2, Star, Wallet } from 'lucide-react';
import type { MarketItem, Escrow } from '@/types';

const CATEGORY_EMOJI: Record<MarketItem['category'], string> = {
  food: '🍱',
  parts: '🔧',
  service: '🛠️',
  info: '📡',
  exchange: '💱',
};

const CATEGORY_LABEL: Record<MarketItem['category'], string> = {
  food: 'Food',
  parts: 'Parts',
  service: 'Service',
  info: 'Info',
  exchange: 'Exchange',
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function MarketItemDetail() {
  const { publicKey, connected } = useWallet();
  const buyerWallet = publicKey?.toBase58() ?? '';
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { data, isLoading, error } = useSWR<{ item: MarketItem } | MarketItem>(
    id ? `/api/marketplace/items?id=${id}` : null,
    fetcher,
  );

  const item: MarketItem | undefined = (data as any)?.item ?? (data as MarketItem | undefined);

  const [buyOpen, setBuyOpen] = useState(false);
  const [escrow, setEscrow] = useState<Escrow | null>(null);
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    if (!escrow) return;
    setBusy(true);
    try {
      const res = await fetch('/api/payment/escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'release', escrowId: escrow.id }),
      });
      if (res.ok) setEscrow({ ...escrow, status: 'released' });
    } finally {
      setBusy(false);
    }
  };

  const handleRefund = async () => {
    if (!escrow) return;
    setBusy(true);
    try {
      const res = await fetch('/api/payment/escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refund', escrowId: escrow.id }),
      });
      if (res.ok) setEscrow({ ...escrow, status: 'refunded' });
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="container py-4">
            <Link href="/marketplace">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
                Marketplace
              </Button>
            </Link>
          </div>
        </header>
        <main className="container py-20 text-center">
          <Card className="p-10">
            <p className="text-muted-foreground">Item not found.</p>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="container flex items-center justify-between py-4">
          <Link href="/marketplace">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Marketplace
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Badge variant="outline">{CATEGORY_LABEL[item.category]}</Badge>
            <ConnectWalletButton />
          </div>
        </div>
      </header>

      <main className="container max-w-3xl py-8 space-y-6">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-center bg-gradient-to-br from-primary/10 to-background py-16">
            <span className="text-7xl">{CATEGORY_EMOJI[item.category]}</span>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h1 className="text-2xl font-bold text-foreground">{item.title}</h1>
                <Badge variant="secondary">{CATEGORY_LABEL[item.category]}</Badge>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{item.description}</p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Seller</div>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-foreground">Captain {item.sellerName}</span>
                  <span className="inline-flex items-center gap-0.5 text-amber-400">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    {item.sellerRating.toFixed(1)}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Wallet</div>
                <div className="font-mono text-xs">{shortenWallet(item.sellerWallet)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Anchor className="h-3 w-3" />Port
                </div>
                <div className="font-medium text-foreground">
                  {item.port === 'busan' ? 'Busan' : item.port === 'incheon' ? 'Incheon' : 'All'}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />Delivery
                </div>
                <div className="font-medium text-foreground">{item.deliveryTime}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Stock</div>
                <div className="font-medium text-foreground">{item.stock}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Listed</div>
                <div className="font-medium text-foreground">{timeAgo(item.createdAt)}</div>
              </div>
            </div>

            <Separator />

            <div className="flex items-end justify-between">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Price</div>
                <div className="text-3xl font-bold text-primary">{formatUSDC(item.price)}</div>
              </div>
              <Button
                size="lg"
                onClick={() => setBuyOpen(true)}
                disabled={item.stock <= 0 || !connected}
              >
                {item.stock <= 0
                  ? 'Sold Out'
                  : !connected
                  ? 'Connect Wallet to Buy'
                  : 'Secure Escrow Payment'}
              </Button>
            </div>
          </div>
        </Card>

        {escrow && (
          <EscrowStatus
            escrow={escrow}
            isLoading={busy}
            onConfirm={handleConfirm}
            onRefund={handleRefund}
          />
        )}

        <Card className="bg-primary/5 border-primary/20 p-4 text-xs text-muted-foreground space-y-1.5">
          <p className="font-semibold text-foreground">Secure Escrow Trading</p>
          <p>· USDC is locked in the platform wallet instead of going directly to the seller.</p>
          <p>· Funds are released to the seller when you click "Confirm Delivery".</p>
          <p>· A 1% transaction fee applies.</p>
        </Card>
      </main>

      <MarketPaymentModal
        open={buyOpen}
        onOpenChange={setBuyOpen}
        item={item}
        buyerWallet={buyerWallet}
        onPurchaseComplete={(escrowId) => {
          setEscrow({
            id: escrowId,
            itemId: item.id,
            buyerWallet,
            sellerWallet: item.sellerWallet,
            amount: item.price,
            txHash: '',
            status: 'locked',
            createdAt: new Date().toISOString(),
          });
        }}
      />
    </div>
  );
}
