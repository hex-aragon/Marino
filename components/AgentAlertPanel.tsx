'use client';

import { useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn, timeAgo } from '@/lib/utils';
import { Bot, Loader2, MapPin, Sparkles } from 'lucide-react';
import type { AgentAlert } from '@/types';

interface Props {
  alerts: AgentAlert[];
  summary: string;
  isAnalyzing: boolean;
  lastUpdated?: string;
  onShipFocus?: (mmsi: string) => void;
  onPayClick?: () => void;
  isPremium?: boolean;
}

function levelRank(l: AgentAlert['level']) {
  return l === 'HIGH' ? 2 : l === 'MEDIUM' ? 1 : 0;
}

function maxLevel(alerts: AgentAlert[]): AgentAlert['level'] | null {
  if (alerts.length === 0) return null;
  return alerts.reduce<AgentAlert['level']>(
    (acc, a) => (levelRank(a.level) > levelRank(acc) ? a.level : acc),
    'LOW',
  );
}

function summaryTint(level: AgentAlert['level'] | null) {
  if (level === 'HIGH') return 'from-red-500/20 to-red-500/5 border-red-500/40';
  if (level === 'MEDIUM') return 'from-amber-500/20 to-amber-500/5 border-amber-500/40';
  if (level === 'LOW') return 'from-blue-500/20 to-blue-500/5 border-blue-500/40';
  return 'from-emerald-500/15 to-emerald-500/5 border-emerald-500/30';
}

function levelStyles(level: AgentAlert['level']) {
  if (level === 'HIGH') return 'border-l-red-500 bg-red-500/5';
  if (level === 'MEDIUM') return 'border-l-amber-500 bg-amber-500/5';
  return 'border-l-blue-500 bg-blue-500/5';
}

function levelBadgeVariant(level: AgentAlert['level']) {
  if (level === 'HIGH') return 'danger' as const;
  if (level === 'MEDIUM') return 'warning' as const;
  return 'secondary' as const;
}

function levelEmoji(level: AgentAlert['level']) {
  if (level === 'HIGH') return '⚠️';
  if (level === 'MEDIUM') return '🟠';
  return '🔵';
}

export default function AgentAlertPanel({
  alerts,
  summary,
  isAnalyzing,
  lastUpdated,
  onShipFocus,
  onPayClick,
  isPremium,
}: Props) {
  const top = useMemo(() => maxLevel(alerts), [alerts]);

  const sorted = useMemo(
    () => [...alerts].sort((a, b) => levelRank(b.level) - levelRank(a.level)),
    [alerts],
  );

  return (
    <div className="flex h-full w-full flex-col bg-card border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <div>
            <div className="text-sm font-semibold text-foreground">AI Maritime Agent</div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  <span>Analyzing…</span>
                </>
              ) : (
                <>
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
                  <span>{lastUpdated ? `Last analysis: ${timeAgo(lastUpdated)}` : 'Standby'}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px]">{alerts.length} alerts</Badge>
      </div>

      <div className="p-3">
        <Card className={cn('bg-gradient-to-br p-3 border', summaryTint(top))}>
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-xs leading-relaxed text-foreground/90">
              {summary || 'All monitored vessels are currently within safe range.'}
            </p>
          </div>
        </Card>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-2 pb-3">
          {sorted.length === 0 && (
            <div className="text-center text-xs text-muted-foreground py-8">
              No anomalies detected.
            </div>
          )}
          {sorted.map((a, i) => (
            <Card
              key={`${a.mmsi}-${i}`}
              className={cn(
                'p-3 border-l-4 transition-all hover:translate-x-0.5 hover:shadow-md',
                levelStyles(a.level),
                a.level === 'HIGH' && 'ring-1 ring-red-500/30 animate-pulse',
              )}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm">{levelEmoji(a.level)}</span>
                  <span className="text-sm font-semibold truncate text-foreground">
                    {a.shipname || 'Unknown'}
                  </span>
                </div>
                <Badge variant={levelBadgeVariant(a.level)} className="text-[9px] shrink-0">
                  {a.level}
                </Badge>
              </div>
              <div className="text-[10px] text-muted-foreground mb-1">MMSI: {a.mmsi}</div>
              <p className="text-xs text-foreground/90 leading-snug mb-1.5">{a.message}</p>
              <p className="text-[11px] text-muted-foreground mb-2">↳ {a.action}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">{timeAgo(a.createdAt)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[10px] text-primary hover:text-primary"
                  onClick={() => onShipFocus?.(a.mmsi)}
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  View on map
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t border-border p-3">
        {isPremium ? (
          <div className="text-center text-[11px] text-muted-foreground">
            Today: <span className="text-primary font-semibold">{alerts.length}</span> analyses
          </div>
        ) : (
          <Button onClick={onPayClick} className="w-full" size="sm">
            <Sparkles className="h-3.5 w-3.5" />
            Upgrade to Premium (29 USDC/mo)
          </Button>
        )}
      </div>
    </div>
  );
}
