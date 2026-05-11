import { NextRequest, NextResponse } from 'next/server';
import { getMockShips, getShipsByArea, startAisStream } from '@/lib/ais';
import type { Area } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const areaParam = (url.searchParams.get('area') || 'busan').toLowerCase();
  const area: Area = areaParam;

  const hasKey = !!process.env.AISSTREAM_API_KEY;
  if (hasKey) {
    try {
      startAisStream();
    } catch {}
  }

  let ships = hasKey ? getShipsByArea(area) : [];
  let mock = false;
  if (!hasKey || ships.length === 0) {
    ships = getMockShips(area);
    mock = true;
  }

  return NextResponse.json({
    ships,
    area,
    updatedAt: new Date().toISOString(),
    mock,
  });
}
