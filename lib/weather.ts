import { kv } from '@vercel/kv';
import type { Area, PremiumWeatherForecast, WeatherData } from '@/types';

const COORDS: Record<Area, { lat: number; lon: number }> = {
  busan: { lat: 35.1, lon: 129.0 },
  incheon: { lat: 37.45, lon: 126.6 },
};

const MARINE_URL = 'https://marine-api.open-meteo.com/v1/marine';

function riskFor(h: number): WeatherData['riskLevel'] {
  if (h > 2.5) return 'DANGER';
  if (h >= 1.5) return 'CAUTION';
  return 'SAFE';
}

interface MarineResponse {
  hourly?: {
    time: string[];
    wave_height: number[];
    wave_direction: number[];
    wave_period: number[];
    wind_wave_height: number[];
    swell_wave_height: number[];
  };
}

function pickCurrentIndex(times: string[]): number {
  const now = Date.now();
  let best = 0;
  let bestDiff = Infinity;
  for (let i = 0; i < times.length; i++) {
    const t = new Date(times[i]).getTime();
    const diff = Math.abs(t - now);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  }
  return best;
}

async function fetchFromOpenMeteo(area: Area): Promise<MarineResponse> {
  const { lat, lon } = COORDS[area];
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    hourly: 'wave_height,wave_direction,wave_period,wind_wave_height,swell_wave_height',
    timezone: 'Asia/Seoul',
    forecast_days: '3',
  });
  const res = await fetch(`${MARINE_URL}?${params}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`open-meteo ${res.status}`);
  return (await res.json()) as MarineResponse;
}

export async function fetchWeather(area: Area): Promise<WeatherData> {
  const cacheKey = `weather:${area}`;
  try {
    const cached = await kv.get<WeatherData>(cacheKey);
    if (cached) return cached;
  } catch {}

  try {
    const data = await fetchFromOpenMeteo(area);
    const hourly = data.hourly;
    if (!hourly || !hourly.time?.length) throw new Error('empty');
    const idx = pickCurrentIndex(hourly.time);
    const waveHeight = hourly.wave_height[idx] ?? 0;
    const weather: WeatherData = {
      area,
      waveHeight,
      waveDirection: hourly.wave_direction[idx] ?? 0,
      wavePeriod: hourly.wave_period[idx] ?? 0,
      windWaveHeight: hourly.wind_wave_height[idx],
      swellWaveHeight: hourly.swell_wave_height[idx],
      riskLevel: riskFor(waveHeight),
      updatedAt: new Date().toISOString(),
    };
    try {
      await kv.set(cacheKey, weather, { ex: 3600 });
    } catch {}
    return weather;
  } catch {
    return getMockWeather(area);
  }
}

function formatHourLabel(iso: string): string {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}시`;
}

function buildRouteAnalysis(
  area: Area,
  hourly: PremiumWeatherForecast['hourly']
): string {
  const portName = area === 'busan' ? '부산항' : '인천항';
  const dangerWindows: Array<{ start: string; end: string; peak: number }> = [];
  let cur: { startIdx: number; endIdx: number; peak: number } | null = null;
  hourly.forEach((h, i) => {
    if (h.waveHeight > 2.5) {
      if (!cur) cur = { startIdx: i, endIdx: i, peak: h.waveHeight };
      else {
        cur.endIdx = i;
        if (h.waveHeight > cur.peak) cur.peak = h.waveHeight;
      }
    } else if (cur) {
      dangerWindows.push({
        start: hourly[cur.startIdx].time,
        end: hourly[cur.endIdx].time,
        peak: cur.peak,
      });
      cur = null;
    }
  });
  if (cur) {
    const c = cur as { startIdx: number; endIdx: number; peak: number };
    dangerWindows.push({
      start: hourly[c.startIdx].time,
      end: hourly[c.endIdx].time,
      peak: c.peak,
    });
  }

  if (dangerWindows.length === 0) {
    const maxWave = hourly.reduce((m, h) => (h.waveHeight > m ? h.waveHeight : m), 0);
    return `${portName} 향후 72시간 항해 안전 구간입니다. 최대 예상 파고는 ${maxWave.toFixed(1)}m입니다.`;
  }

  const parts = dangerWindows.slice(0, 3).map(
    (w) =>
      `${formatHourLabel(w.start)}~${formatHourLabel(w.end)} 사이 파고 ${w.peak.toFixed(
        1
      )}m로 항해 위험 구간이 있습니다`
  );
  return `${portName} 향후 72시간 중 ${parts.join(', ')}.`;
}

export async function fetchPremiumWeather(area: Area): Promise<PremiumWeatherForecast> {
  try {
    const data = await fetchFromOpenMeteo(area);
    const hourly = data.hourly;
    if (!hourly || !hourly.time?.length) throw new Error('empty');
    const idx = pickCurrentIndex(hourly.time);
    const waveHeight = hourly.wave_height[idx] ?? 0;
    const series = hourly.time.slice(0, 72).map((t, i) => ({
      time: t,
      waveHeight: hourly.wave_height[i] ?? 0,
      waveDirection: hourly.wave_direction[i] ?? 0,
      wavePeriod: hourly.wave_period[i] ?? 0,
    }));
    const routeAnalysis = buildRouteAnalysis(area, series);
    return {
      area,
      waveHeight,
      waveDirection: hourly.wave_direction[idx] ?? 0,
      wavePeriod: hourly.wave_period[idx] ?? 0,
      windWaveHeight: hourly.wind_wave_height[idx],
      swellWaveHeight: hourly.swell_wave_height[idx],
      riskLevel: riskFor(waveHeight),
      updatedAt: new Date().toISOString(),
      hourly: series,
      routeAnalysis,
    };
  } catch {
    const base = getMockWeather(area);
    const now = Date.now();
    const series = Array.from({ length: 72 }, (_, i) => {
      const variance = Math.sin(i / 6) * 0.4;
      const wh = Math.max(0.3, base.waveHeight + variance + (i > 36 && i < 48 ? 1.2 : 0));
      return {
        time: new Date(now + i * 3_600_000).toISOString(),
        waveHeight: Math.round(wh * 10) / 10,
        waveDirection: (base.waveDirection + i * 3) % 360,
        wavePeriod: base.wavePeriod,
      };
    });
    return {
      ...base,
      hourly: series,
      routeAnalysis: buildRouteAnalysis(area, series),
    };
  }
}

export function getMockWeather(area: Area): WeatherData {
  if (area === 'busan') {
    return {
      area: 'busan',
      waveHeight: 1.2,
      waveDirection: 135,
      wavePeriod: 6.5,
      windWaveHeight: 0.8,
      swellWaveHeight: 0.9,
      riskLevel: 'SAFE',
      updatedAt: new Date().toISOString(),
    };
  }
  return {
    area: 'incheon',
    waveHeight: 1.8,
    waveDirection: 270,
    wavePeriod: 5.8,
    windWaveHeight: 1.1,
    swellWaveHeight: 1.2,
    riskLevel: 'CAUTION',
    updatedAt: new Date().toISOString(),
  };
}
