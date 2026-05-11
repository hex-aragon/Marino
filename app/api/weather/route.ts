import { NextRequest, NextResponse } from 'next/server';
import { fetchWeather, getMockWeather } from '@/lib/weather';
import type { Area } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const areaParam = (url.searchParams.get('area') || 'busan').toLowerCase();
  const area: Area = areaParam === 'incheon' ? 'incheon' : 'busan';

  try {
    const weather = await fetchWeather(area);
    return NextResponse.json(weather);
  } catch {
    return NextResponse.json(getMockWeather(area));
  }
}
