'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn, timeAgo } from '@/lib/utils';
import { Compass, Gauge, MapPin, Navigation } from 'lucide-react';
import type { ShipData, AgentAlert } from '@/types';

interface Props {
  ship: ShipData;
  alert?: AgentAlert;
  onFocus?: (mmsi: string) => void;
  className?: string;
}

function statusLabel(status: number, sog: number) {
  if (status === 1) return 'At Anchor';
  if (status === 5) return 'Moored';
  if (status === 0 && sog > 0) return 'Sailing';
  if (sog === 0) return 'Stopped';
  return 'Sailing';
}

function statusVariant(status: number, sog: number) {
  if (status === 1 || status === 5) return 'secondary' as const;
  if (sog === 0) return 'warning' as const;
  return 'success' as const;
}

export default function ShipCard({ ship, alert, onFocus, className }: Props) {
  return (
    <Card className={cn('p-3 space-y-2.5', alert?.level === 'HIGH' && 'border-red-500/50 bg-red-500/5', className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-semibold text-foreground truncate">{ship.shipname || 'Unknown'}</div>
          <div className="text-[10px] text-muted-foreground font-mono">MMSI: {ship.mmsi}</div>
        </div>
        <Badge variant={statusVariant(ship.status, ship.sog)} className="text-[10px] shrink-0">
          {statusLabel(ship.status, ship.sog)}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Gauge className="h-3 w-3" />
          <span>Speed</span>
        </div>
        <div className="text-foreground text-right font-medium">{ship.sog.toFixed(1)} kn</div>

        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Compass className="h-3 w-3" />
          <span>Heading</span>
        </div>
        <div className="text-foreground text-right font-medium">{ship.cog.toFixed(0)}°</div>

        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Navigation className="h-3 w-3" />
          <span>Destination</span>
        </div>
        <div className="text-foreground text-right font-medium truncate">{ship.destination || '-'}</div>

        <div className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>Position</span>
        </div>
        <div className="text-foreground text-right font-mono text-[10px]">
          {ship.lat.toFixed(3)}, {ship.lon.toFixed(3)}
        </div>
      </div>

      {alert && (
        <div className="rounded-md border-l-2 border-red-500 bg-red-500/10 p-2 text-[11px] text-foreground/90">
          ⚠️ {alert.message}
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px] text-muted-foreground">{timeAgo(ship.timestamp)}</span>
        {onFocus && (
          <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" onClick={() => onFocus(ship.mmsi)}>
            View on map
          </Button>
        )}
      </div>
    </Card>
  );
}
