'use client';

import useSWR from 'swr';
import type { Area, WeatherData } from '@/types';

const fetcher = async (url: string): Promise<WeatherData | null> => {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return null;
  const data = await res.json();
  if (data && typeof data.waveHeight === 'number') return data as WeatherData;
  if (data?.weather && typeof data.weather.waveHeight === 'number') return data.weather as WeatherData;
  return null;
};

export function useWeather(area: Area) {
  const { data, isLoading } = useSWR<WeatherData | null>(
    `/api/weather?area=${area}`,
    fetcher,
    {
      refreshInterval: 60_000,
      revalidateOnFocus: false,
      keepPreviousData: true,
    },
  );

  return {
    weather: data ?? null,
    isLoading,
  };
}
