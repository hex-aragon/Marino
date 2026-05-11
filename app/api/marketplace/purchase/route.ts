import { NextRequest, NextResponse } from 'next/server';
import { getItem } from '@/lib/marketplace';
import { createSolanaPayQR } from '@/lib/solana';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {}

  const itemId = String(body?.itemId || '');
  const buyerWallet = String(body?.buyerWallet || '');

  if (!itemId || !buyerWallet) {
    return NextResponse.json({ error: 'missing itemId or buyerWallet' }, { status: 400 });
  }

  const item = getItem(itemId);
  if (!item) {
    return NextResponse.json({ error: 'item not found' }, { status: 404 });
  }
  if (item.stock <= 0) {
    return NextResponse.json({ error: 'out of stock' }, { status: 409 });
  }

  const memo = `Marino market item=${item.id} buyer=${buyerWallet.slice(0, 8)}`;
  const payment = createSolanaPayQR(item.price, memo);

  return NextResponse.json({
    payment,
    escrowDraft: {
      itemId: item.id,
      sellerWallet: item.sellerWallet,
      buyerWallet,
      amount: item.price,
    },
    item,
  });
}
