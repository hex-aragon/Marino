'use client';

import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ShipData, AgentAlert, WeatherData, Area } from '@/types';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const PORT_CENTERS: Record<Area, [number, number]> = {
  busan: [35.098, 129.035],
  incheon: [37.45, 126.6],
};

const PORT_LABELS: Record<Area, string> = {
  busan: '부산항',
  incheon: '인천항',
};

interface Props {
  ships: ShipData[];
  alerts: AgentAlert[];
  weather: WeatherData | null;
  area: Area;
  onAreaChange: (a: Area) => void;
  onShipClick?: (s: ShipData) => void;
  focusMmsi?: string;
}

function statusLabel(status: number, sog: number) {
  if (status === 1) return '정박';
  if (status === 5) return '계류';
  if (status === 0 && sog > 0) return '항해중';
  if (sog === 0) return '정지';
  return '항해중';
}

function riskLabel(level?: 'SAFE' | 'CAUTION' | 'DANGER') {
  if (level === 'DANGER') return '위험';
  if (level === 'CAUTION') return '주의';
  return '안전';
}

function riskVariant(level?: 'SAFE' | 'CAUTION' | 'DANGER') {
  if (level === 'DANGER') return 'danger' as const;
  if (level === 'CAUTION') return 'warning' as const;
  return 'success' as const;
}

function shipDivIcon(ship: ShipData, alert?: AgentAlert) {
  const moving = ship.status === 0 && ship.sog > 0;
  const anchored = ship.status === 1 || ship.status === 5 || ship.sog === 0;

  let html = '';
  let className = 'ship-marker';

  if (alert?.level === 'HIGH') {
    className += ' danger';
    html = `<span style="color:#ff4757;font-size:22px;text-shadow:0 0 8px rgba(255,71,87,0.7)">⚠️</span>`;
  } else if (alert?.level === 'MEDIUM') {
    html = `<span style="color:#ffa502;font-size:20px;font-weight:bold;text-shadow:0 0 6px rgba(255,165,2,0.7)">!</span>`;
  } else if (anchored) {
    html = `<span style="color:#94a3b8;font-size:16px">●</span>`;
  } else if (moving) {
    html = `<span style="display:inline-block;color:#00d4aa;font-size:18px;transform:rotate(${ship.cog}deg);text-shadow:0 0 6px rgba(0,212,170,0.6)">▲</span>`;
  } else {
    html = `<span style="color:#94a3b8;font-size:16px">●</span>`;
  }

  return L.divIcon({
    html,
    className,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function portIcon(label: string) {
  return L.divIcon({
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:2px"><span style="font-size:22px;filter:drop-shadow(0 0 4px rgba(0,212,170,0.6))">⚓</span><span style="font-size:10px;color:#00d4aa;background:#0a1628cc;padding:1px 6px;border-radius:6px;white-space:nowrap;border:1px solid #00d4aa55">${label}</span></div>`,
    className: '',
    iconSize: [60, 40],
    iconAnchor: [30, 20],
  });
}

function FlyToShip({ ship }: { ship?: ShipData }) {
  const map = useMap();
  useEffect(() => {
    if (ship) map.flyTo([ship.lat, ship.lon], 13, { duration: 0.8 });
  }, [ship, map]);
  return null;
}

function CenterOnArea({ area }: { area: Area }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(PORT_CENTERS[area], 10, { duration: 0.8 });
  }, [area, map]);
  return null;
}

export default function MaritimeMap({
  ships,
  alerts,
  weather,
  area,
  onAreaChange,
  onShipClick,
  focusMmsi,
}: Props) {
  if (typeof window === 'undefined') return null;

  const mapRef = useRef<L.Map | null>(null);

  const alertByMmsi = useMemo(() => {
    const m = new Map<string, AgentAlert>();
    for (const a of alerts) {
      const prev = m.get(a.mmsi);
      if (!prev) m.set(a.mmsi, a);
      else {
        const rank = { LOW: 0, MEDIUM: 1, HIGH: 2 };
        if (rank[a.level] > rank[prev.level]) m.set(a.mmsi, a);
      }
    }
    return m;
  }, [alerts]);

  const focusShip = useMemo(
    () => (focusMmsi ? ships.find((s) => s.mmsi === focusMmsi) : undefined),
    [focusMmsi, ships],
  );

  const center = PORT_CENTERS[area];
  const portMarker = portIcon(PORT_LABELS[area]);

  const weatherColor = weather?.riskLevel === 'DANGER' ? '#ff4757' : weather?.riskLevel === 'CAUTION' ? '#ffa502' : null;
  const weatherFillOpacity = weather?.riskLevel === 'DANGER' ? 0.2 : 0.15;

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={center}
        zoom={10}
        scrollWheelZoom
        className="h-full w-full"
        ref={(m) => {
          if (m) mapRef.current = m;
        }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <CenterOnArea area={area} />
        <FlyToShip ship={focusShip} />

        <Marker position={center} icon={portMarker} />

        {weatherColor && (
          <Circle
            center={center}
            radius={8000}
            pathOptions={{
              color: weatherColor,
              fillColor: weatherColor,
              fillOpacity: weatherFillOpacity,
              weight: 1.5,
            }}
          />
        )}

        {ships.map((ship) => {
          const alert = alertByMmsi.get(ship.mmsi);
          return (
            <Marker
              key={ship.mmsi}
              position={[ship.lat, ship.lon]}
              icon={shipDivIcon(ship, alert)}
              eventHandlers={{
                click: () => onShipClick?.(ship),
              }}
            >
              <Popup>
                <div className="space-y-1 text-sm text-black">
                  <div className="font-semibold">{ship.shipname || '미상'}</div>
                  <div className="text-xs text-gray-600">MMSI: {ship.mmsi}</div>
                  <div className="text-xs">속도: {ship.sog.toFixed(1)} knots</div>
                  <div className="text-xs">방향: {ship.cog.toFixed(0)}°</div>
                  <div className="text-xs">목적지: {ship.destination || '-'}</div>
                  <div className="text-xs">상태: {statusLabel(ship.status, ship.sog)}</div>
                  {alert && (
                    <div className="mt-1 rounded bg-red-100 px-2 py-1 text-xs text-red-700">
                      {alert.level} · {alert.message}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <div className="pointer-events-none absolute inset-0 z-[400]">
        <div className="pointer-events-auto absolute left-3 top-3">
          <Tabs value={area} onValueChange={(v) => onAreaChange(v as Area)}>
            <TabsList className="bg-card/90 backdrop-blur border border-border">
              <TabsTrigger value="busan">부산</TabsTrigger>
              <TabsTrigger value="incheon">인천</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="pointer-events-auto absolute right-3 top-3 flex flex-col items-end gap-2">
          <Badge variant="secondary" className="bg-card/90 backdrop-blur border border-border">
            🚢 {ships.length}척
          </Badge>
          {weather && (
            <Badge variant={riskVariant(weather.riskLevel)} className="backdrop-blur">
              파고 {weather.waveHeight.toFixed(1)}m · {riskLabel(weather.riskLevel)}
            </Badge>
          )}
        </div>

        <div className="pointer-events-auto absolute bottom-3 left-3">
          <Card className="bg-card/90 backdrop-blur p-3 text-xs space-y-1.5">
            <div className="font-semibold text-foreground mb-1">범례</div>
            <div className="flex items-center gap-2"><span className="text-primary">▲</span> 항해중</div>
            <div className="flex items-center gap-2"><span className="text-muted-foreground">●</span> 정박/계류</div>
            <div className="flex items-center gap-2"><span className="text-warning">!</span> 주의 알림</div>
            <div className="flex items-center gap-2"><span>⚠️</span> 위험 알림</div>
          </Card>
        </div>
      </div>
    </div>
  );
}
