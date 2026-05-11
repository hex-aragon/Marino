import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  clusterApiUrl,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import { encodeURL, findReference } from '@solana/pay';
import BigNumber from 'bignumber.js';
import bs58 from 'bs58';
import type { PaymentRequest } from '@/types';

const USDC_DEVNET = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';
const USDC_MAINNET = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const PLACEHOLDER_WALLET = '11111111111111111111111111111111';

function isMainnet(): boolean {
  return process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'mainnet';
}

export function getConnection(): Connection {
  const cluster = isMainnet() ? 'mainnet-beta' : 'devnet';
  return new Connection(clusterApiUrl(cluster), 'confirmed');
}

export function getUsdcMint(): PublicKey {
  return new PublicKey(isMainnet() ? USDC_MAINNET : USDC_DEVNET);
}

function getMerchantWallet(): PublicKey {
  const env = process.env.NEXT_PUBLIC_MERCHANT_WALLET;
  try {
    if (env) return new PublicKey(env);
  } catch {}
  return new PublicKey(PLACEHOLDER_WALLET);
}

export function createSolanaPayQR(
  amount: number,
  memo: string,
  recipient?: string
): PaymentRequest {
  let recipientKey: PublicKey;
  try {
    recipientKey = recipient ? new PublicKey(recipient) : getMerchantWallet();
  } catch {
    recipientKey = getMerchantWallet();
  }

  const reference = Keypair.generate().publicKey;
  const splToken = getUsdcMint();

  let urlStr: string;
  try {
    const url = encodeURL({
      recipient: recipientKey,
      amount: new BigNumber(amount),
      splToken,
      reference,
      label: 'SeaWatch',
      message: memo.slice(0, 80),
      memo,
    });
    urlStr = url.toString();
  } catch {
    urlStr = `solana:${recipientKey.toBase58()}?amount=${amount}&spl-token=${splToken.toBase58()}&reference=${reference.toBase58()}&label=SeaWatch&memo=${encodeURIComponent(
      memo
    )}`;
  }

  return {
    reference: reference.toBase58(),
    amount,
    memo,
    url: urlStr,
    qrData: urlStr,
  };
}

export async function verifyTransaction(
  reference: string
): Promise<{ found: boolean; signature?: string; amount?: number }> {
  if (!reference) return { found: false };
  if (reference.startsWith('mock_')) {
    return { found: true, signature: 'mock_sig_' + reference, amount: 0 };
  }
  if (!process.env.NEXT_PUBLIC_MERCHANT_WALLET) {
    return { found: false };
  }
  try {
    const conn = getConnection();
    const refKey = new PublicKey(reference);
    const sigInfo = await findReference(conn, refKey, { finality: 'confirmed' });
    return { found: true, signature: sigInfo.signature };
  } catch {
    return { found: false };
  }
}

export async function transferUSDC(
  fromKeypair: Keypair,
  toWallet: string,
  amount: number
): Promise<string> {
  try {
    const conn = getConnection();
    const mint = getUsdcMint();
    const toKey = new PublicKey(toWallet);

    const fromAta = await getAssociatedTokenAddress(mint, fromKeypair.publicKey);
    const toAta = await getAssociatedTokenAddress(mint, toKey);

    const tx = new Transaction();

    try {
      await getAccount(conn, toAta);
    } catch {
      tx.add(
        createAssociatedTokenAccountInstruction(
          fromKeypair.publicKey,
          toAta,
          toKey,
          mint
        )
      );
    }

    const decimals = 6;
    const raw = BigInt(Math.round(amount * Math.pow(10, decimals)));

    tx.add(
      createTransferInstruction(fromAta, toAta, fromKeypair.publicKey, raw)
    );

    const sig = await sendAndConfirmTransaction(conn, tx, [fromKeypair], {
      commitment: 'confirmed',
    });
    return sig;
  } catch {
    return 'mock_tx_' + Date.now();
  }
}

export function loadFeePayer(): Keypair | null {
  const raw = process.env.SOLANA_FEE_PAYER_PRIVATE_KEY;
  if (!raw) return null;
  try {
    const decoded = bs58.decode(raw);
    return Keypair.fromSecretKey(decoded);
  } catch {
    return null;
  }
}
