'use client';

import Link from 'next/link';
import { ArrowLeft, Ship, Waves, MapPin } from 'lucide-react';
import AgentChat from '@/components/AgentChat';
import { useShips } from '@/hooks/useShips';
import { useWeather } from '@/hooks/useWeather';
import { Badge } from '@/components/ui/badge';

const RISK_VARIANT = {
  SAFE: 'success',
  CAUTION: 'warning',
  DANGER: 'danger',
} as const;

const RISK_LABEL = {
  SAFE: '안전',
  CAUTION: '주의',
  DANGER: '위험',
} as const;

export default function AgentPage() {
  const { ships, area } = useShips();
  const { weather } = useWeather(area);

  const portName = area === 'busan' ? '부산항' : '인천항';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> 대시보드
          </Link>
          <div className="h-5 w-px bg-border" />
          <h1 className="text-base font-semibold tracking-tight">
            <span className="mr-1">🤖</span> SeaWatch 에이전트
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> 온라인
          </span>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-4 lg:grid-cols-[1fr_280px]">
        <section className="h-[calc(100vh-80px-2rem)]">
          <AgentChat area={area} ships={ships} weather={weather} />
        </section>

        <aside className="hidden lg:flex flex-col gap-3">
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" /> 모니터링 항구
            </div>
            <div className="mt-2 text-xl font-semibold">{portName}</div>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <Ship className="h-3.5 w-3.5" /> 선박 수
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-primary">{ships.length}</span>
              <span className="text-sm text-muted-foreground">척</span>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <Waves className="h-3.5 w-3.5" /> 파고
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                {weather ? weather.waveHeight.toFixed(1) : '—'}
              </span>
              <span className="text-sm text-muted-foreground">m</span>
              {weather && (
                <Badge variant={RISK_VARIANT[weather.riskLevel]} className="ml-auto">
                  {RISK_LABEL[weather.riskLevel]}
                </Badge>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-xs text-muted-foreground">
            <p className="mb-1 font-medium text-primary">에이전트 능력</p>
            <ul className="space-y-1">
              <li>• 선박·기상 실시간 분석</li>
              <li>• 마켓 자동 주문 (USDC)</li>
              <li>• x402 유료 데이터 자율 결제</li>
              <li>• 항로 이탈 정밀 분석</li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}
