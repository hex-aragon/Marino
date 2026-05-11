import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { kv } from '@vercel/kv';
import { verifyPaymentHeader } from '@/lib/x402';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  txHash: z.string().min(1),
  expectedAmount: z.number().positive(),
});

export async function POST(req: NextRequest) {
  let json: any;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ valid: false, reason: 'invalid_json' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ valid: false, reason: 'invalid_body' }, { status: 400 });
  }

  const { txHash, expectedAmount } = parsed.data;

  try {
    const existing = await kv.get(`x402:tx:${txHash}`);
    if (existing) {
      return NextResponse.json({ valid: false, reason: 'replay' });
    }
  } catch {}

  const valid = await verifyPaymentHeader(txHash, expectedAmount);
  if (!valid) {
    return NextResponse.json({ valid: false, reason: 'verification_failed' });
  }

  try {
    await kv.set(
      `x402:tx:${txHash}`,
      { used: true, amount: expectedAmount, at: new Date().toISOString() },
      { ex: 300 }
    );
  } catch {}

  return NextResponse.json({ valid: true });
}
