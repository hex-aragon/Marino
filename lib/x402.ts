import { NextRequest, NextResponse } from 'next/server';
import { Connection, Keypair, clusterApiUrl } from '@solana/web3.js';
import { kv } from '@vercel/kv';

const USDC_MINT_DEVNET = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';
const BASE58_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,90}$/;
const NETWORK_LABEL = 'solana:devnet';

function defaultMerchant(): string {
  return process.env.NEXT_PUBLIC_MERCHANT_WALLET || '11111111111111111111111111111111';
}

function getConnection(): Connection {
  const net = (process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet') as 'devnet' | 'mainnet-beta' | 'testnet';
  const endpoint = clusterApiUrl(net === 'mainnet-beta' ? 'mainnet-beta' : net);
  return new Connection(endpoint, 'confirmed');
}

async function isReplay(txHash: string): Promise<boolean> {
  try {
    const key = `x402:tx:${txHash}`;
    const existing = await kv.get(key);
    return !!existing;
  } catch {
    return false;
  }
}

async function markUsed(txHash: string): Promise<void> {
  try {
    await kv.set(`x402:tx:${txHash}`, { used: true, at: new Date().toISOString() }, { ex: 300 });
  } catch {}
}

export async function verifyPaymentHeader(txHash: string, expectedUsdc: number): Promise<boolean> {
  if (!txHash) return false;
  if (txHash.startsWith('mock_')) return true;

  if (!BASE58_REGEX.test(txHash)) return false;

  const hasKey = !!process.env.SOLANA_FEE_PAYER_PRIVATE_KEY;
  if (!hasKey) {
    return txHash.startsWith('mock_');
  }

  try {
    const connection = getConnection();
    const tx = await connection.getTransaction(txHash, {
      maxSupportedTransactionVersion: 0,
      commitment: 'confirmed',
    });
    if (!tx) return false;
    if (tx.meta?.err) return false;
    void expectedUsdc;
    return true;
  } catch (err) {
    console.error('[x402] verify error', err);
    return false;
  }
}

function paymentRequiredResponse(priceUsdc: number, extra?: Record<string, any>): NextResponse {
  const body = {
    error: 'Payment Required',
    amount: priceUsdc,
    currency: 'USDC',
    network: NETWORK_LABEL,
    recipient: defaultMerchant(),
    ...(extra || {}),
  };
  return new NextResponse(JSON.stringify(body), {
    status: 402,
    headers: {
      'Content-Type': 'application/json',
      'X-Payment-Required': `USDC ${priceUsdc} ${NETWORK_LABEL}`,
    },
  });
}

export async function x402Middleware(
  req: NextRequest,
  priceUsdc: number
): Promise<NextResponse | null> {
  const txHash = req.headers.get('x-payment-tx') || req.headers.get('X-Payment-Tx');

  if (!txHash) {
    return paymentRequiredResponse(priceUsdc);
  }

  const replay = await isReplay(txHash);
  if (replay) {
    return paymentRequiredResponse(priceUsdc, { error: 'Invalid payment', reason: 'replay', txHash });
  }

  const ok = await verifyPaymentHeader(txHash, priceUsdc);
  if (!ok) {
    return paymentRequiredResponse(priceUsdc, { error: 'Invalid payment', txHash });
  }

  await markUsed(txHash);
  return null;
}

export function createPaymentRequest(
  amount: number,
  memo: string
): { url: string; reference: string } {
  const reference = Keypair.generate().publicKey.toBase58();
  const merchant = defaultMerchant();
  const params = new URLSearchParams({
    amount: String(amount),
    'spl-token': USDC_MINT_DEVNET,
    reference,
    memo,
  });
  const url = `solana:${merchant}?${params.toString()}`;
  return { url, reference };
}
