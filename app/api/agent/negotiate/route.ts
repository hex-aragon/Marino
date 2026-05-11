import { NextRequest } from 'next/server';
import { runNegotiation } from '@/lib/agentNegotiation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {}

  const userMessage = String(body?.message || '').slice(0, 500);
  const area = body?.area === 'incheon' ? 'incheon' : 'busan';
  const walletAddress = body?.walletAddress ? String(body.walletAddress) : undefined;

  if (!userMessage.trim()) {
    return new Response(JSON.stringify({ error: 'empty_message' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const ev of runNegotiation({ userMessage, area, walletAddress })) {
          controller.enqueue(encoder.encode(JSON.stringify(ev) + '\n'));
        }
      } catch (e: any) {
        controller.enqueue(
          encoder.encode(JSON.stringify({ type: 'error', message: String(e?.message || e) }) + '\n')
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Accel-Buffering': 'no',
    },
  });
}
