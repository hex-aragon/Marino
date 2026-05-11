import { NextRequest, NextResponse } from 'next/server';
import { getEscrow, lockFunds, refundFunds, releaseFunds } from '@/lib/escrow';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'missing id' }, { status: 400 });
  }
  const escrow = await getEscrow(id);
  if (!escrow) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
  return NextResponse.json(escrow);
}

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {}

  const action = String(body?.action || '');

  try {
    if (action === 'lock') {
      const { buyerWallet, sellerWallet, amount, itemId, txHash } = body;
      if (!buyerWallet || !sellerWallet || !amount || !itemId || !txHash) {
        return NextResponse.json({ error: 'missing fields' }, { status: 400 });
      }
      const escrow = await lockFunds({
        buyerWallet,
        sellerWallet,
        amount: Number(amount),
        itemId,
        txHash,
      });
      return NextResponse.json(escrow);
    }

    if (action === 'release') {
      const { escrowId } = body;
      if (!escrowId) return NextResponse.json({ error: 'missing escrowId' }, { status: 400 });
      const { escrow, txHash } = await releaseFunds(escrowId);
      return NextResponse.json({ ...escrow, releaseTxHash: txHash });
    }

    if (action === 'refund') {
      const { escrowId } = body;
      if (!escrowId) return NextResponse.json({ error: 'missing escrowId' }, { status: 400 });
      const { escrow, txHash } = await refundFunds(escrowId);
      return NextResponse.json({ ...escrow, refundTxHash: txHash });
    }

    return NextResponse.json({ error: 'invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'escrow error' }, { status: 500 });
  }
}
