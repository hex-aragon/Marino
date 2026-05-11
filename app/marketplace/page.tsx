'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { PORTS } from '@/lib/ports';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import MarketItem from '@/components/MarketItem';
import MarketPaymentModal from '@/components/MarketPaymentModal';
import EscrowStatus from '@/components/EscrowStatus';
import SiteHeader from '@/components/SiteHeader';
import { useMarket } from '@/hooks/useMarket';
import { useWallet } from '@solana/wallet-adapter-react';
import { cn } from '@/lib/utils';
import { Loader2, Plus, Search, ShoppingBag, Wallet } from 'lucide-react';
import type { MarketItem as MarketItemT, Escrow } from '@/types';

type Category = 'all' | MarketItemT['category'];
type Port = 'all' | string;

const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: 'all', label: 'All', emoji: '✨' },
  { value: 'food', label: 'Food', emoji: '🍱' },
  { value: 'parts', label: 'Parts', emoji: '🔧' },
  { value: 'service', label: 'Service', emoji: '🛠️' },
  { value: 'info', label: 'Info', emoji: '📡' },
  { value: 'exchange', label: 'Exchange', emoji: '💱' },
];

export default function MarketplacePage() {
  const { publicKey, connected } = useWallet();
  const buyerWallet = publicKey?.toBase58() ?? '';

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
        buyerWallet,
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
      <SiteHeader
        rightSlot={
          <Badge variant="outline" className="hidden sm:inline-flex text-[10px]">
            {filtered.length} items
          </Badge>
        }
      />
      <div className="sticky top-14 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="container flex items-center gap-2 pt-3 pb-2">
          <ShoppingBag className="h-4 w-4 text-primary" />
          <h1 className="text-base font-semibold">Port Market</h1>
        </div>
        <div className="container pb-3 space-y-3">
          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 scrollbar-thin">
            <button
              onClick={() => setPort('all')}
              className={cn(
                'shrink-0 rounded-full border px-3 py-1 text-xs transition-colors',
                port === 'all'
                  ? 'border-primary bg-primary/15 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
              )}
            >
              🌍 All Ports
            </button>
            {PORTS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPort(p.id)}
                className={cn(
                  'shrink-0 rounded-full border px-3 py-1 text-xs transition-colors',
                  port === p.id
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
                )}
              >
                <span className="mr-1">{p.flag}</span>
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items or sellers..."
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
      </div>

      <main className="container py-6 space-y-6">
        {!connected && (
          <Card className="flex items-center gap-3 border-primary/30 bg-primary/5 px-4 py-3 text-sm">
            <Wallet className="h-4 w-4 text-primary" />
            <span className="flex-1 text-muted-foreground">
              Connect your Solana wallet to buy items in this marketplace.
            </span>
          </Card>
        )}

        {localEscrows.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-foreground mb-2">Active Orders</h2>
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
              No items match your filters.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((item) => (
                <MarketItem
                  key={item.id}
                  item={item}
                  onBuy={(i) => {
                    if (!connected) return;
                    setBuyTarget(i);
                  }}
                  disabled={!connected}
                />
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
            <span className="sr-only">Sell Item</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Sell Item</SheetTitle>
            <SheetDescription>Sell to other sailors in USDC</SheetDescription>
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
          buyerWallet={buyerWallet}
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
  const [deliveryTime, setDeliveryTime] = useState('Same-day port pickup');
  const [sellerName, setSellerName] = useState('');
  const [sellerWallet, setSellerWallet] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const cats: { v: MarketItemT['category']; l: string; e: string }[] = [
    { v: 'food', l: 'Food', e: '🍱' },
    { v: 'parts', l: 'Parts', e: '🔧' },
    { v: 'service', l: 'Service', e: '🛠️' },
    { v: 'info', l: 'Info', e: '📡' },
    { v: 'exchange', l: 'Exchange', e: '💱' },
  ];

  const ports: { v: string; l: string; flag: string }[] = [
    ...PORTS.map((p) => ({ v: p.id, l: p.label, flag: p.flag })),
    { v: 'any', l: 'All Ports', flag: '🌍' },
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
        <label className="text-xs font-medium text-muted-foreground">Title</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Hot lunchbox" />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the item in detail"
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Category</label>
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
          <label className="text-xs font-medium text-muted-foreground">Price (USDC)</label>
          <Input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="9.99"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Delivery Time</label>
          <Input
            value={deliveryTime}
            onChange={(e) => setDeliveryTime(e.target.value)}
            placeholder="Within 1 hour"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Port</label>
        <div className="grid grid-cols-3 gap-1.5">
          {ports.map((p) => (
            <button
              key={p.v}
              onClick={() => setPort(p.v)}
              className={cn(
                'inline-flex items-center justify-center gap-1 rounded-md border px-2 py-1.5 text-[11px] transition-colors',
                port === p.v
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/40',
              )}
            >
              <span>{p.flag}</span>
              <span className="truncate">{p.l}</span>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Seller Name</label>
        <Input value={sellerName} onChange={(e) => setSellerName(e.target.value)} placeholder="Captain Smith" />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Solana Wallet Address</label>
        <Input
          value={sellerWallet}
          onChange={(e) => setSellerWallet(e.target.value)}
          placeholder="7xKX...sgAsU"
          className="font-mono text-xs"
        />
      </div>

      <Button onClick={handleSubmit} disabled={!valid || submitting} className="w-full">
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        Submit Listing
      </Button>
    </div>
  );
}
