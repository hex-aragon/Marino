'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import type { Area, ShipData } from '@/types';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('fetch failed');
  return res.json();
};

export function useShips(initialArea: Area = 'busan') {
  const [area, setArea] = useState<Area>(initialArea);

  const { data, isLoading, mutate } = useSWR<{ ships: ShipData[]; mock: boolean }>(
    `/api/ais?area=${area}`,
    fetcher,
    {
      refreshInterval: 30_000,
      revalidateOnFocus: false,
    }
  );

  const ships = data?.ships ?? [];

  const stoppedShips = useMemo(
    () => ships.filter((s) => s.sog === 0 && s.status === 0),
    [ships]
  );

  return {
    ships,
    isLoading,
    area,
    setArea,
    stoppedShips,
    refresh: mutate,
    isMock: data?.mock ?? false,
  };
}
