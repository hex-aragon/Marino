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
import { formatUSDC, shortenWallet, timeAgo } from '@/lib/utils';
import { Anchor, ArrowLeft, Clock, Loader2, Star } from 'lucide-react';
import type { MarketItem, Escrow } from '@/types';

const CATEGORY_EMOJI: Record<MarketItem['category'], string> = {
  food: '🍱',
  parts: '🔧',
  service: '🛠️',
  info: '📡',
  exchange: '💱',
};

const CATEGORY_LABEL: Record<MarketItem['category'], string> = {
  food: '식품',
  parts: '부품',
  service: '서비스',
  info: '정보',
  exchange: '환전',
};

const DEMO_BUYER_WALLET = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function MarketItemDetail() {
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
                마켓플레이스
              </Button>
            </Link>
          </div>
        </header>
        <main className="container py-20 text-center">
          <Card className="p-10">
            <p className="text-muted-foreground">상품을 찾을 수 없습니다.</p>
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
              마켓플레이스
            </Button>
          </Link>
          <Badge variant="outline">{CATEGORY_LABEL[item.category]}</Badge>
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
                <div className="text-xs text-muted-foreground mb-1">판매자</div>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-foreground">선장 {item.sellerName}</span>
                  <span className="inline-flex items-center gap-0.5 text-amber-400">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    {item.sellerRating.toFixed(1)}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">지갑</div>
                <div className="font-mono text-xs">{shortenWallet(item.sellerWallet)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Anchor className="h-3 w-3" />항구
                </div>
                <div className="font-medium text-foreground">
                  {item.port === 'busan' ? '부산' : item.port === 'incheon' ? '인천' : '전체'}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />배달
                </div>
                <div className="font-medium text-foreground">{item.deliveryTime}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">재고</div>
                <div className="font-medium text-foreground">{item.stock}개</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">등록</div>
                <div className="font-medium text-foreground">{timeAgo(item.createdAt)}</div>
              </div>
            </div>

            <Separator />

            <div className="flex items-end justify-between">
              <div>
                <div className="text-xs text-muted-foreground mb-1">가격</div>
                <div className="text-3xl font-bold text-primary">{formatUSDC(item.price)}</div>
              </div>
              <Button size="lg" onClick={() => setBuyOpen(true)} disabled={item.stock <= 0}>
                {item.stock <= 0 ? '품절' : '에스크로 안전 결제'}
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
          <p className="font-semibold text-foreground">에스크로 안전 거래</p>
          <p>· 결제 USDC는 즉시 판매자에게 가지 않고 플랫폼 지갑에 잠금됩니다.</p>
          <p>· 상품 수령 후 "수령 확인"을 누르면 판매자에게 전송됩니다.</p>
          <p>· 수수료는 거래액의 1%입니다.</p>
        </Card>
      </main>

      <MarketPaymentModal
        open={buyOpen}
        onOpenChange={setBuyOpen}
        item={item}
        buyerWallet={DEMO_BUYER_WALLET}
        onPurchaseComplete={(escrowId) => {
          setEscrow({
            id: escrowId,
            itemId: item.id,
            buyerWallet: DEMO_BUYER_WALLET,
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
