import { NextRequest, NextResponse } from 'next/server';
import { createSolanaPayQR } from '@/lib/solana';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PLAN_PRICES: Record<string, number> = {
  basic: 9,
  premium: 29,
};

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {}

  const type = body?.type === 'market' ? 'market' : 'subscription';
  let amount = Number(body?.amount);
  const meta = body?.meta || {};

  if (type === 'subscription') {
    const planKey = String(meta.plan || (amount === 29 ? 'premium' : 'basic')).toLowerCase();
    amount = PLAN_PRICES[planKey] ?? (amount > 0 ? amount : 9);
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: 'invalid amount' }, { status: 400 });
  }

  const memoParts: string[] = [`type=${type}`];
  if (meta.itemId) memoParts.push(`item=${meta.itemId}`);
  if (meta.plan) memoParts.push(`plan=${meta.plan}`);
  if (meta.email) memoParts.push(`email=${String(meta.email).slice(0, 40)}`);
  const memo = `SeaWatch ${memoParts.join(' ')}`;

  const recipient = meta.sellerWallet || undefined;
  const payment = createSolanaPayQR(amount, memo, recipient);

  return NextResponse.json(payment);
}
