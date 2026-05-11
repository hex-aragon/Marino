import { NextRequest, NextResponse } from 'next/server';
import { fetchPremiumWeather } from '@/lib/weather';
import { x402Middleware } from '@/lib/x402';
import type { Area } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const gate = await x402Middleware(req, 2);
  if (gate) return gate;

  const url = new URL(req.url);
  const areaParam = (url.searchParams.get('area') || 'busan').toLowerCase();
  const area: Area = areaParam === 'incheon' ? 'incheon' : 'busan';

  try {
    const forecast = await fetchPremiumWeather(area);
    return NextResponse.json(forecast);
  } catch (e: any) {
    return NextResponse.json(
      { error: 'forecast_failed', message: e?.message || 'unknown' },
      { status: 500 }
    );
  }
}
