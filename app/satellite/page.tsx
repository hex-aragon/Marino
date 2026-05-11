'use client';

import dynamic from 'next/dynamic';
import { Waves, Thermometer, Wind } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
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
      Loading map...
    </div>
  ),
});

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

interface AreaCardProps {
  area: Area;
  weather: WeatherData | null;
}

function AreaCard({ area, weather }: AreaCardProps) {
  const portName = area === 'busan' ? 'Busan Port' : 'Incheon Port';
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
            <Waves className="h-3 w-3" /> Wave Height
          </div>
          <div className="mt-1 text-xl font-bold">
            {weather ? weather.waveHeight.toFixed(1) : '—'}
            <span className="ml-1 text-xs font-normal text-muted-foreground">m</span>
          </div>
        </div>
        <div className="rounded-lg bg-secondary/50 p-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Thermometer className="h-3 w-3" /> Sea Temp
          </div>
          <div className="mt-1 text-xl font-bold">
            —
            <span className="ml-1 text-xs font-normal text-muted-foreground">°C</span>
          </div>
        </div>
        <div className="rounded-lg bg-secondary/50 p-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Wind className="h-3 w-3" /> Wind Speed
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
      <SiteHeader
        rightSlot={
          <span className="hidden md:inline-flex items-center gap-1 text-xs text-muted-foreground">
            🛰️ Public Maritime Data
          </span>
        }
      />

      <main className="mx-auto w-full max-w-6xl space-y-10 px-4 py-8">
        <section>
          <h2 className="mb-4 text-xl font-semibold">🌊 Korean Maritime Conditions</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <AreaCard area="busan" weather={busanWeather.weather} />
            <AreaCard area="incheon" weather={incheonWeather.weather} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Source: Open-Meteo Marine API · Refreshed hourly
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">🗺️ Vessel Density Heatmap</h2>
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
            (Demo: heatmap needs leaflet.heat integration with react-leaflet) Currently visualizes
            cruising/moored vessels as markers.
          </p>
        </section>

        <SatelliteViewer />
      </main>
    </div>
  );
}
