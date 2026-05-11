'use client';

import { Ship, Waves, MapPin, Zap } from 'lucide-react';
import AgentChat from '@/components/AgentChat';
import SiteHeader from '@/components/SiteHeader';
import { useShips } from '@/hooks/useShips';
import { useWeather } from '@/hooks/useWeather';
import { Badge } from '@/components/ui/badge';
import { getPort } from '@/lib/ports';

const RISK_VARIANT = {
  SAFE: 'success',
  CAUTION: 'warning',
  DANGER: 'danger',
} as const;

const RISK_LABEL = {
  SAFE: 'Safe',
  CAUTION: 'Caution',
  DANGER: 'Danger',
} as const;

export default function AgentPage() {
  const { ships, area } = useShips();
  const { weather } = useWeather(area);

  const portName = getPort(area)?.label ? `${getPort(area)!.label} Port` : 'Port';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader
        rightSlot={
          <span className="hidden md:inline-flex items-center gap-1 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Agent Online
          </span>
        }
      />

      <main className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-4 lg:grid-cols-[1fr_300px]">
        <section className="h-[calc(100vh-56px-2rem)]">
          <AgentChat area={area} ships={ships} weather={weather} />
        </section>

        <aside className="hidden lg:flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border bg-card p-3">
              <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                <MapPin className="h-3 w-3" /> Port
              </div>
              <div className="mt-1 text-sm font-semibold">{portName}</div>
            </div>
            <div className="rounded-xl border bg-card p-3">
              <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                <Ship className="h-3 w-3" /> Ships
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-bold text-primary">{ships.length}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-3">
            <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
              <Waves className="h-3 w-3" /> Wave Height
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                {weather ? weather.waveHeight.toFixed(1) : '—'}
              </span>
              <span className="text-xs text-muted-foreground">m</span>
              {weather && (
                <Badge variant={RISK_VARIANT[weather.riskLevel]} className="ml-auto text-[9px]">
                  {RISK_LABEL[weather.riskLevel]}
                </Badge>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs text-muted-foreground">
            <div className="mb-1.5 flex items-center gap-1.5 text-primary">
              <Zap className="h-3.5 w-3.5" />
              <span className="text-sm font-semibold">Agent-to-Agent x402</span>
            </div>
            <p className="leading-relaxed">
              Type a purchase request like
              <span className="text-foreground"> "라면 박스 12 USDC 안에 구해줘"</span>.
              The buyer agent and seller agent negotiate, then settle via x402 USDC autopay.
            </p>
            <ul className="mt-2 space-y-0.5 text-[10px]">
              <li>① 요청 파싱 + 마켓 검색</li>
              <li>② 판매 에이전트 견적</li>
              <li>③ 자동 협상 (가격·배송)</li>
              <li>④ x402: 402 → USDC 결제 → 200</li>
              <li>⑤ 에스크로 잠금 + 영수증</li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}
