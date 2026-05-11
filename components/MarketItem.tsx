'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatUSDC, timeAgo } from '@/lib/utils';
import { Anchor, Clock, Star } from 'lucide-react';
import { getPort } from '@/lib/ports';
import type { MarketItem as MarketItemT } from '@/types';

interface Props {
  item: MarketItemT;
  onBuy: (item: MarketItemT) => void;
  disabled?: boolean;
}

const CATEGORY_EMOJI: Record<MarketItemT['category'], string> = {
  food: '🍱',
  parts: '🔧',
  service: '🛠️',
  info: '📡',
  exchange: '💱',
};

const CATEGORY_LABEL: Record<MarketItemT['category'], string> = {
  food: 'Food',
  parts: 'Parts',
  service: 'Service',
  info: 'Info',
  exchange: 'Exchange',
};

function portLabel(p: string): string {
  if (p === 'any') return 'All';
  const port = getPort(p);
  return port ? `${port.flag} ${port.label}` : p;
}

export default function MarketItem({ item, onBuy, disabled = false }: Props) {
  return (
    <Card className="group flex flex-col p-4 transition-all hover:border-primary/50 hover:shadow-[0_0_20px_-8px_hsl(var(--primary)/0.5)] hover:-translate-y-0.5">
      <div className="flex items-start gap-3 mb-3">
        <div className="text-3xl shrink-0 transition-transform group-hover:scale-110">
          {CATEGORY_EMOJI[item.category]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground leading-tight line-clamp-2">
              {item.title}
            </h3>
            <Badge variant="outline" className="text-[10px] shrink-0">
              {CATEGORY_LABEL[item.category]}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{item.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-3">
        <span>Captain {item.sellerName}</span>
        <span className="inline-flex items-center gap-0.5">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          {item.sellerRating.toFixed(1)}
        </span>
        <span className="text-border">·</span>
        <span>{timeAgo(item.createdAt)}</span>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="text-2xl font-bold text-primary">{formatUSDC(item.price)}</div>
        <div className="flex flex-col items-end gap-1 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {item.deliveryTime}
          </span>
          <span className="inline-flex items-center gap-1">
            <Anchor className="h-3 w-3" />
            {portLabel(item.port)}
          </span>
        </div>
      </div>

      <Button
        onClick={() => onBuy(item)}
        disabled={item.stock <= 0 || disabled}
        className="w-full mt-auto"
      >
        {item.stock <= 0 ? 'Sold Out' : disabled ? 'Connect Wallet' : 'Buy with USDC'}
      </Button>
    </Card>
  );
}
