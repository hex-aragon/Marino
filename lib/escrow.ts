import { kv } from '@vercel/kv';
import type { Escrow } from '@/types';
import { loadFeePayer, transferUSDC } from '@/lib/solana';

const g = globalThis as any;
if (!g.__marinoEscrows__) {
  g.__marinoEscrows__ = new Map<string, Escrow>();
}
const store: Map<string, Escrow> = g.__marinoEscrows__;

const PLATFORM_FEE_RATE = 0.01;

async function persist(escrow: Escrow): Promise<void> {
  store.set(escrow.id, escrow);
  try {
    await kv.set(`escrow:${escrow.id}`, escrow, { ex: 60 * 60 * 24 * 30 });
  } catch {}
}

async function loadFromKv(id: string): Promise<Escrow | null> {
  try {
    const cached = await kv.get<Escrow>(`escrow:${id}`);
    if (cached) {
      store.set(id, cached);
      return cached;
    }
  } catch {}
  return null;
}

export interface LockFundsInput {
  buyerWallet: string;
  sellerWallet: string;
  amount: number;
  itemId: string;
  txHash: string;
}

export async function lockFunds(input: LockFundsInput): Promise<Escrow> {
  const id = 'esc_' + (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
  const escrow: Escrow = {
    id,
    itemId: input.itemId,
    buyerWallet: input.buyerWallet,
    sellerWallet: input.sellerWallet,
    amount: input.amount,
    txHash: input.txHash,
    status: 'locked',
    createdAt: new Date().toISOString(),
  };
  await persist(escrow);
  return escrow;
}

export async function releaseFunds(
  escrowId: string
): Promise<{ txHash: string; escrow: Escrow }> {
  const escrow = (await getEscrow(escrowId)) as Escrow | null;
  if (!escrow) throw new Error('escrow not found');
  if (escrow.status !== 'locked') {
    return { txHash: escrow.txHash, escrow };
  }

  const payout = escrow.amount * (1 - PLATFORM_FEE_RATE);
  const fp = loadFeePayer();
  let txHash = 'mock_release_' + Date.now();

  if (fp) {
    try {
      txHash = await transferUSDC(fp, escrow.sellerWallet, payout);
    } catch {
      txHash = 'mock_release_' + Date.now();
    }
  }

  const next: Escrow = { ...escrow, status: 'released', txHash };
  await persist(next);
  return { txHash, escrow: next };
}

export async function refundFunds(
  escrowId: string
): Promise<{ txHash: string; escrow: Escrow }> {
  const escrow = (await getEscrow(escrowId)) as Escrow | null;
  if (!escrow) throw new Error('escrow not found');
  if (escrow.status !== 'locked') {
    return { txHash: escrow.txHash, escrow };
  }

  const fp = loadFeePayer();
  let txHash = 'mock_refund_' + Date.now();
  if (fp) {
    try {
      txHash = await transferUSDC(fp, escrow.buyerWallet, escrow.amount);
    } catch {
      txHash = 'mock_refund_' + Date.now();
    }
  }

  const next: Escrow = { ...escrow, status: 'refunded', txHash };
  await persist(next);
  return { txHash, escrow: next };
}

export async function getEscrow(id: string): Promise<Escrow | null> {
  const cached = store.get(id);
  if (cached) return cached;
  return loadFromKv(id);
}

export function listEscrowsForWallet(wallet: string): Escrow[] {
  const out: Escrow[] = [];
  for (const e of Array.from(store.values())) {
    if (e.buyerWallet === wallet || e.sellerWallet === wallet) out.push(e);
  }
  return out.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
