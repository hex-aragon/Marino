'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, Waves, Thermometer, Wind } from 'lucide-react';
import { useShips } from '@/hooks/useShips';
import { useWeather } from '@/hooks/useWeather';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SatelliteViewer from '@/components/SatelliteViewer';
import type { Area, WeatherData } from '@/types';

const MaritimeMap = dynamic(() => import('@/components/MaritimeMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full grid place-items-center text-muted-foreground text-sm">
      지도 로딩 중...
    </div>
  ),
});

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

interface AreaCardProps {
  area: Area;
  weather: WeatherData | null;
}

function AreaCard({ area, weather }: AreaCardProps) {
  const portName = area === 'busan' ? '부산항' : '인천항';
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>⚓ {portName}</span>
          {weather && (
            <Badge variant={RISK_VARIANT[weather.riskLevel]}>{RISK_LABEL[weather.riskLevel]}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-lg bg-secondary/50 p-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Waves className="h-3 w-3" /> 파고
          </div>
          <div className="mt-1 text-xl font-bold">
            {weather ? weather.waveHeight.toFixed(1) : '—'}
            <span className="ml-1 text-xs font-normal text-muted-foreground">m</span>
          </div>
        </div>
        <div className="rounded-lg bg-secondary/50 p-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Thermometer className="h-3 w-3" /> 수온
          </div>
          <div className="mt-1 text-xl font-bold">
            —
            <span className="ml-1 text-xs font-normal text-muted-foreground">°C</span>
          </div>
        </div>
        <div className="rounded-lg bg-secondary/50 p-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Wind className="h-3 w-3" /> 풍속
          </div>
          <div className="mt-1 text-xl font-bold">
            —
            <span className="ml-1 text-xs font-normal text-muted-foreground">m/s</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SatellitePage() {
  const busan = useShips();
  const busanWeather = useWeather('busan');
  const incheonWeather = useWeather('incheon');

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
          <h1 className="text-base font-semibold tracking-tight">🛰️ 위성·공공 해양 데이터</h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-10 px-4 py-8">
        <section>
          <h2 className="mb-4 text-xl font-semibold">🌊 한국 해역 현황</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <AreaCard area="busan" weather={busanWeather.weather} />
            <AreaCard area="incheon" weather={incheonWeather.weather} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            출처: Open-Meteo Marine API · 1시간 단위 갱신
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">🗺️ 선박 밀집도 히트맵</h2>
          <div className="h-[500px] overflow-hidden rounded-xl border">
            <MaritimeMap
              ships={busan.ships}
              alerts={[]}
              weather={busanWeather.weather}
              area={busan.area}
              onAreaChange={busan.setArea}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            데모: 히트맵은 react-leaflet에 leaflet.heat 통합이 필요합니다. 현재는 항해/정박 선박을
            마커로 시각화합니다.
          </p>
        </section>

        <SatelliteViewer />
      </main>
    </div>
  );
}
