'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn, formatUSDC } from '@/lib/utils';
import { Check, Lock, RefreshCcw, ShieldCheck } from 'lucide-react';
import type { Escrow } from '@/types';

interface Props {
  escrow: Escrow;
  onConfirm?: (escrowId: string) => void;
  onRefund?: (escrowId: string) => void;
  isLoading?: boolean;
  className?: string;
}

function statusMeta(status: Escrow['status']) {
  if (status === 'locked') {
    return {
      label: 'Escrow Locked',
      variant: 'warning' as const,
      icon: Lock,
      bg: 'bg-amber-500/5 border-amber-500/30',
    };
  }
  if (status === 'released') {
    return {
      label: 'Purchase Complete',
      variant: 'success' as const,
      icon: ShieldCheck,
      bg: 'bg-emerald-500/5 border-emerald-500/30',
    };
  }
  return {
    label: 'Refunded',
    variant: 'secondary' as const,
    icon: RefreshCcw,
    bg: 'bg-muted/40 border-border',
  };
}

export default function EscrowStatus({ escrow, onConfirm, onRefund, isLoading, className }: Props) {
  const meta = statusMeta(escrow.status);
  const Icon = meta.icon;

  return (
    <Card className={cn('p-3 border', meta.bg, className)}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className="h-4 w-4 text-foreground/80 shrink-0" />
          <div className="min-w-0">
            <div className="text-xs font-semibold text-foreground">{meta.label}</div>
            <div className="text-[10px] text-muted-foreground font-mono truncate">
              ID: {escrow.id}
            </div>
          </div>
        </div>
        <Badge variant={meta.variant} className="text-[10px] shrink-0">
          {formatUSDC(escrow.amount)}
        </Badge>
      </div>

      {escrow.status === 'locked' && (
        <div className="flex items-center gap-2">
          {onConfirm && (
            <Button
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={() => onConfirm(escrow.id)}
              disabled={isLoading}
            >
              <Check className="h-3.5 w-3.5" />
              Confirm Delivery
            </Button>
          )}
          {onRefund && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={() => onRefund(escrow.id)}
              disabled={isLoading}
            >
              Refund
            </Button>
          )}
        </div>
      )}

      {escrow.status === 'released' && (
        <p className="text-[11px] text-muted-foreground">
          Sent {formatUSDC(escrow.amount * 0.99)} to seller (1% fee deducted)
        </p>
      )}
    </Card>
  );
}
