import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { kv } from '@vercel/kv';
import { analyzeShips } from '@/lib/agent';
import type { AgentAnalysisResult, Area } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 30;
export const dynamic = 'force-dynamic';

const shipSchema = z
  .object({
    mmsi: z.union([z.string(), z.number()]).transform((v) => String(v)),
    shipname: z.string().optional().default(''),
    lat: z.number().optional().default(0),
    lon: z.number().optional().default(0),
    sog: z.number().optional().default(0),
    cog: z.number().optional().default(0),
    destination: z.string().optional().default(''),
    shiptype: z.number().optional().default(0),
    timestamp: z.string().optional().default(() => new Date().toISOString()),
    status: z.number().optional().default(0),
  })
  .passthrough();

const weatherSchema = z
  .object({
    area: z.enum(['busan', 'incheon']),
    waveHeight: z.number(),
    waveDirection: z.number(),
    wavePeriod: z.number(),
    riskLevel: z.enum(['SAFE', 'CAUTION', 'DANGER']),
    updatedAt: z.string(),
  })
  .passthrough()
  .nullable()
  .optional();

const bodySchema = z.object({
  ships: z.array(shipSchema).default([]),
  weather: weatherSchema,
  area: z.enum(['busan', 'incheon']).default('busan'),
});

async function getCached(area: Area): Promise<AgentAnalysisResult | null> {
  try {
    const cached = await kv.get<AgentAnalysisResult>(`agent:analysis:${area}`);
    return cached ?? null;
  } catch {
    return null;
  }
}

async function setCached(area: Area, result: AgentAnalysisResult): Promise<void> {
  try {
    await kv.set(`agent:analysis:${area}`, result, { ex: 60 });
  } catch {}
}

export async function POST(req: NextRequest) {
  let json: any;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_body', issues: parsed.error.issues }, { status: 400 });
  }

  const { ships, weather, area } = parsed.data;

  const cached = await getCached(area);
  if (cached) {
    return NextResponse.json({ ...cached, cached: true, area });
  }

  const result = await analyzeShips({
    ships: ships as any,
    weather: (weather as any) ?? null,
    area,
  });

  await setCached(area, result);
  return NextResponse.json({ ...result, cached: false, area });
}
