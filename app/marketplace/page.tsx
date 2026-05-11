'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import MarketItem from '@/components/MarketItem';
import MarketPaymentModal from '@/components/MarketPaymentModal';
import EscrowStatus from '@/components/EscrowStatus';
import { useMarket } from '@/hooks/useMarket';
import { cn } from '@/lib/utils';
import { ArrowLeft, Loader2, Plus, Search, ShoppingBag } from 'lucide-react';
import type { MarketItem as MarketItemT, Escrow } from '@/types';

type Category = 'all' | MarketItemT['category'];
type Port = 'all' | 'busan' | 'incheon';

const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: 'all', label: '전체', emoji: '✨' },
  { value: 'food', label: '식품', emoji: '🍱' },
  { value: 'parts', label: '부품', emoji: '🔧' },
  { value: 'service', label: '서비스', emoji: '🛠️' },
  { value: 'info', label: '정보', emoji: '📡' },
  { value: 'exchange', label: '환전', emoji: '💱' },
];

const DEMO_BUYER_WALLET = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';

export default function MarketplacePage() {
  const [port, setPort] = useState<Port>('all');
  const [category, setCategory] = useState<Category>('all');
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [buyTarget, setBuyTarget] = useState<MarketItemT | null>(null);
  const [localEscrows, setLocalEscrows] = useState<Escrow[]>([]);
  const [busyEscrow, setBusyEscrow] = useState<string | null>(null);

  const { items, isLoading, createItem } = useMarket();

  const filtered = useMemo(() => {
    const list = items || [];
    const q = search.trim().toLowerCase();
    return list.filter((i) => {
      if (port !== 'all' && i.port !== port && i.port !== 'any') return false;
      if (category !== 'all' && i.category !== category) return false;
      if (q && !(i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.sellerName.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [items, search, port, category]);

  const handlePurchaseComplete = (escrowId: string) => {
    if (!buyTarget) return;
    setLocalEscrows((prev) => [
      {
        id: escrowId,
        itemId: buyTarget.id,
        buyerWallet: DEMO_BUYER_WALLET,
        sellerWallet: buyTarget.sellerWallet,
        amount: buyTarget.price,
        txHash: '',
        status: 'locked',
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const handleConfirm = async (escrowId: string) => {
    setBusyEscrow(escrowId);
    try {
      const res = await fetch('/api/payment/escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'release', escrowId }),
      });
      if (res.ok) {
        setLocalEscrows((prev) =>
          prev.map((e) => (e.id === escrowId ? { ...e, status: 'released' } : e)),
        );
      }
    } finally {
      setBusyEscrow(null);
    }
  };

  const handleRefund = async (escrowId: string) => {
    setBusyEscrow(escrowId);
    try {
      const res = await fetch('/api/payment/escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refund', escrowId }),
      });
      if (res.ok) {
        setLocalEscrows((prev) =>
          prev.map((e) => (e.id === escrowId ? { ...e, status: 'refunded' } : e)),
        );
      }
    } finally {
      setBusyEscrow(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
                대시보드
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <h1 className="text-xl font-bold flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              항구 마켓
            </h1>
          </div>
          <Badge variant="outline" className="text-[10px]">
            {filtered.length}개 상품
          </Badge>
        </div>

        <div className="container pb-3 space-y-3">
          <Tabs value={port} onValueChange={(v) => setPort(v as Port)}>
            <TabsList>
              <TabsTrigger value="all">전체</TabsTrigger>
              <TabsTrigger value="busan">⚓ 부산</TabsTrigger>
              <TabsTrigger value="incheon">⚓ 인천</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="상품 또는 판매자 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors',
                    category === c.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
                  )}
                >
                  <span>{c.emoji}</span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {localEscrows.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-foreground mb-2">진행 중인 주문</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {localEscrows.map((e) => (
                <EscrowStatus
                  key={e.id}
                  escrow={e}
                  isLoading={busyEscrow === e.id}
                  onConfirm={handleConfirm}
                  onRefund={handleRefund}
                />
              ))}
            </div>
          </section>
        )}

        <section>
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <Card className="py-16 text-center text-muted-foreground text-sm">
              조건에 맞는 상품이 없습니다.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((item) => (
                <MarketItem key={item.id} item={item} onBuy={setBuyTarget} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button
            size="lg"
            className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg shadow-primary/30 p-0"
          >
            <Plus className="h-6 w-6" />
            <span className="sr-only">판매 등록</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>판매 등록</SheetTitle>
            <SheetDescription>다른 선원에게 USDC로 판매하세요</SheetDescription>
          </SheetHeader>
          <NewItemForm
            onSubmit={async (data) => {
              await createItem(data);
              setSheetOpen(false);
            }}
          />
        </SheetContent>
      </Sheet>

      {buyTarget && (
        <MarketPaymentModal
          open={!!buyTarget}
          onOpenChange={(o) => !o && setBuyTarget(null)}
          item={buyTarget}
          buyerWallet={DEMO_BUYER_WALLET}
          onPurchaseComplete={handlePurchaseComplete}
        />
      )}
    </div>
  );
}

interface FormData {
  title: string;
  description: string;
  category: MarketItemT['category'];
  price: number;
  port: MarketItemT['port'];
  deliveryTime: string;
  sellerName: string;
  sellerWallet: string;
  stock: number;
}

function NewItemForm({ onSubmit }: { onSubmit: (d: FormData) => Promise<void> | void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<MarketItemT['category']>('food');
  const [price, setPrice] = useState('');
  const [port, setPort] = useState<MarketItemT['port']>('busan');
  const [deliveryTime, setDeliveryTime] = useState('당일 항구 픽업');
  const [sellerName, setSellerName] = useState('');
  const [sellerWallet, setSellerWallet] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const cats: { v: MarketItemT['category']; l: string; e: string }[] = [
    { v: 'food', l: '식품', e: '🍱' },
    { v: 'parts', l: '부품', e: '🔧' },
    { v: 'service', l: '서비스', e: '🛠️' },
    { v: 'info', l: '정보', e: '📡' },
    { v: 'exchange', l: '환전', e: '💱' },
  ];

  const ports: { v: MarketItemT['port']; l: string }[] = [
    { v: 'busan', l: '부산' },
    { v: 'incheon', l: '인천' },
    { v: 'any', l: '전체' },
  ];

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit({
        title,
        description,
        category,
        price: parseFloat(price) || 0,
        port,
        deliveryTime,
        sellerName,
        sellerWallet,
        stock: 99,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const valid = title && description && price && sellerName && sellerWallet;

  return (
    <div className="mt-4 space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">상품명</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 김치찌개 도시락" />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">설명</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="상품 설명을 자세히 적어주세요"
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">카테고리</label>
        <div className="flex flex-wrap gap-1.5">
          {cats.map((c) => (
            <button
              key={c.v}
              onClick={() => setCategory(c.v)}
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors',
                category === c.v
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/40',
              )}
            >
              <span>{c.e}</span>
              <span>{c.l}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">가격 (USDC)</label>
          <Input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="9.99"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">배달 시간</label>
          <Input
            value={deliveryTime}
            onChange={(e) => setDeliveryTime(e.target.value)}
            placeholder="1시간 내"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">항구</label>
        <div className="flex gap-1.5">
          {ports.map((p) => (
            <button
              key={p.v}
              onClick={() => setPort(p.v)}
              className={cn(
                'flex-1 rounded-md border px-3 py-2 text-xs transition-colors',
                port === p.v
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/40',
              )}
            >
              {p.l}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">판매자 이름</label>
        <Input value={sellerName} onChange={(e) => setSellerName(e.target.value)} placeholder="박선장" />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Solana 지갑 주소</label>
        <Input
          value={sellerWallet}
          onChange={(e) => setSellerWallet(e.target.value)}
          placeholder="7xKX...sgAsU"
          className="font-mono text-xs"
        />
      </div>

      <Button onClick={handleSubmit} disabled={!valid || submitting} className="w-full">
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        상품 등록
      </Button>
    </div>
  );
}
