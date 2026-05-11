import { NextRequest } from 'next/server';
import { z } from 'zod';
import { streamChat } from '@/lib/agent';
import type { AgentAlert, Area, ChatMessage, ShipData, WeatherData } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 30;
export const dynamic = 'force-dynamic';

const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  createdAt: z.string().optional().default(() => new Date().toISOString()),
});

const bodySchema = z.object({
  messages: z.array(messageSchema).min(1),
  area: z.enum(['busan', 'incheon']).default('busan'),
  recentAlerts: z.array(z.any()).optional().default([]),
});

async function fetchShips(origin: string, area: Area): Promise<ShipData[]> {
  try {
    const res = await fetch(`${origin}/api/ais?area=${area}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.ships) ? (data.ships as ShipData[]) : [];
  } catch {
    return [];
  }
}

async function fetchWeather(origin: string, area: Area): Promise<WeatherData | null> {
  try {
    const res = await fetch(`${origin}/api/weather?area=${area}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && typeof data.waveHeight === 'number') return data as WeatherData;
    if (data?.weather && typeof data.weather.waveHeight === 'number') return data.weather as WeatherData;
    return null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  let json: any;
  try {
    json = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_json' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'invalid_body', issues: parsed.error.issues }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { messages, area, recentAlerts } = parsed.data;
  const origin = new URL(req.url).origin;

  const [ships, weather] = await Promise.all([fetchShips(origin, area), fetchWeather(origin, area)]);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        const generator = streamChat({
          messages: messages as ChatMessage[],
          context: {
            ships,
            weather,
            recentAlerts: recentAlerts as AgentAlert[],
            area,
          },
        });
        for await (const chunk of generator) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (err) {
        console.error('[chat] stream error', err);
        controller.enqueue(encoder.encode('\n[Error] A problem occurred while generating the response.'));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}
