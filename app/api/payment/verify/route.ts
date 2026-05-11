import { NextRequest, NextResponse } from 'next/server';
import { verifyTransaction } from '@/lib/solana';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const reference = url.searchParams.get('reference') || '';
  if (!reference) {
    return NextResponse.json({ verified: false, error: 'missing reference' }, { status: 400 });
  }

  const result = await verifyTransaction(reference);
  return NextResponse.json({
    verified: result.found,
    signature: result.signature,
  });
}
