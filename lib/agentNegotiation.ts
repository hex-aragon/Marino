import { listItems } from './marketplace';
import type { MarketItem } from '@/types';

export type NegEvent =
  | { type: 'buyer_intent'; content: string; budget?: number; query: string }
  | { type: 'market_search'; query: string; matches: number }
  | { type: 'seller_offer'; item: MarketItem; quote: number; etaMin: number; content: string }
  | { type: 'buyer_negotiate'; targetPrice: number; content: string }
  | { type: 'seller_decision'; accepted: boolean; finalPrice: number; content: string }
  | { type: 'buyer_accept'; finalPrice: number; content: string }
  | { type: 'x402_init'; endpoint: string; priceUsdc: number; recipient: string; itemTitle: string }
  | { type: 'x402_402'; headers: Record<string, string> }
  | { type: 'x402_paying'; txHash: string; payer: string }
  | { type: 'x402_settled'; txHash: string; amount: number; itemId: string; itemTitle: string; sellerName: string; sellerWallet: string; etaMin: number }
  | { type: 'done' }
  | { type: 'error'; message: string };

export interface NegotiateParams {
  userMessage: string;
  area: 'busan' | 'incheon';
  walletAddress?: string;
}

const PURCHASE_KEYWORDS = [
  '사줘', '사 줘', '사 주세요', '구매', '구해', '주문', '예약', '결제',
  'buy', 'purchase', 'order', 'reserve', 'get me', 'find me',
];

export function isPurchaseIntent(text: string): boolean {
  const lower = text.toLowerCase();
  return PURCHASE_KEYWORDS.some((k) => lower.includes(k));
}

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'for', 'me', 'please', 'with', 'and', 'or', 'usdc', 'usd',
  '좀', '주세요', '해줘', '해주세요', '를', '을', '이', '가', '에', '에서', '으로', '로',
  '있나', '있어', '있어요', '있을까', '돈', '예산',
  '구해', '구해줘', '사줘', '구매', '주문',
]);

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,.!?·]+/)
    .map((w) => w.replace(/[()\[\]"']/g, ''))
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w) && !/^\d+$/.test(w));
}

function extractMaxPrice(text: string): number | undefined {
  const m = text.match(/(\d+)\s*(usdc|usd|달러|원|usdt)?/i);
  if (m) {
    const n = Number(m[1]);
    if (n > 0 && n < 10000) return n;
  }
  return undefined;
}

function topMatch(query: string, area: 'busan' | 'incheon', maxPrice?: number): MarketItem | null {
  const all = listItems({});
  const keywords = extractKeywords(query);
  const inArea = all.filter((it) => it.port === area || it.port === 'any');

  const scored = inArea
    .map((it) => {
      const text = `${it.title} ${it.description} ${it.category} ${it.sellerName}`.toLowerCase();
      const score = keywords.reduce((s, k) => s + (text.includes(k) ? 1 : 0), 0);
      return { it, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.it.price - b.it.price);

  const withinBudget = (maxPrice == null) ? scored : scored.filter((x) => x.it.price <= maxPrice * 1.5);
  if (withinBudget.length > 0) return withinBudget[0].it;

  // Fallback: cheapest in-area item
  return inArea.sort((a, b) => a.price - b.price)[0] ?? null;
}

function parseEtaMin(deliveryTime: string): number {
  if (!deliveryTime) return 120;
  if (deliveryTime.includes('즉시')) return 1;
  if (deliveryTime.includes('30분')) return 30;
  const hourMatch = deliveryTime.match(/(\d+)\s*시간/);
  if (hourMatch) return Number(hourMatch[1]) * 60;
  if (deliveryTime.includes('당일')) return 240;
  if (deliveryTime.includes('익일')) return 1440;
  if (deliveryTime.toLowerCase().includes('24시간') || deliveryTime.includes('24h')) return 1440;
  return 120;
}

function fakeTxHash(): string {
  const r = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  return `mock_neg_${r}`;
}

function shortWallet(w?: string): string {
  if (!w) return 'agent-wallet';
  return `${w.slice(0, 4)}…${w.slice(-4)}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function* runNegotiation(params: NegotiateParams): AsyncGenerator<NegEvent> {
  const { userMessage, area, walletAddress } = params;

  const maxPrice = extractMaxPrice(userMessage);
  const keywords = extractKeywords(userMessage);
  const query = keywords.join(' ') || userMessage.slice(0, 30);

  yield {
    type: 'buyer_intent',
    content: maxPrice
      ? `요청 분석 완료. 검색어: "${query}", 예산: ${maxPrice} USDC. 마켓 조회 시작.`
      : `요청 분석 완료. 검색어: "${query}". 마켓 조회 시작.`,
    budget: maxPrice,
    query,
  };
  await sleep(700);

  const item = topMatch(userMessage, area, maxPrice);

  yield {
    type: 'market_search',
    query,
    matches: item ? 1 : 0,
  };
  await sleep(500);

  if (!item) {
    yield { type: 'error', message: '조건에 맞는 상품을 찾지 못했습니다. 다른 키워드로 시도해보세요.' };
    return;
  }

  const initialQuote = item.price;
  const etaMin = parseEtaMin(item.deliveryTime);

  yield {
    type: 'seller_offer',
    item,
    quote: initialQuote,
    etaMin,
    content: `안녕하세요, ${item.sellerName}입니다. "${item.title}"을 ${initialQuote} USDC에 ${item.deliveryTime} 내 제공 가능합니다.`,
  };
  await sleep(1100);

  let finalPrice = initialQuote;
  const buyerTarget = maxPrice ?? Math.max(1, Math.floor(initialQuote * 0.85));

  if (buyerTarget < initialQuote) {
    yield {
      type: 'buyer_negotiate',
      targetPrice: buyerTarget,
      content: `구매 에이전트입니다. ${buyerTarget} USDC로 가능할까요? 단골이 될 수 있고 즉시 결제 가능합니다.`,
    };
    await sleep(1100);

    const midPrice = Math.max(buyerTarget, Math.ceil((initialQuote + buyerTarget) / 2));
    const willAccept = buyerTarget >= Math.floor(initialQuote * 0.7);
    const sellerCounter = willAccept ? buyerTarget : midPrice;

    yield {
      type: 'seller_decision',
      accepted: willAccept,
      finalPrice: sellerCounter,
      content: willAccept
        ? `좋습니다. ${sellerCounter} USDC에 진행하시죠.`
        : `${sellerCounter} USDC가 최선입니다. 어떻게 하시겠어요?`,
    };
    await sleep(900);

    finalPrice = sellerCounter;

    if (!willAccept) {
      yield {
        type: 'buyer_accept',
        finalPrice,
        content: `${finalPrice} USDC 수락합니다. 결제 진행합니다.`,
      };
      await sleep(700);
    } else {
      yield {
        type: 'buyer_accept',
        finalPrice,
        content: `좋습니다. ${finalPrice} USDC로 결제 진행합니다.`,
      };
      await sleep(600);
    }
  }

  // x402 payment flow
  yield {
    type: 'x402_init',
    endpoint: '/api/marketplace/purchase',
    priceUsdc: finalPrice,
    recipient: item.sellerWallet,
    itemTitle: item.title,
  };
  await sleep(500);

  yield {
    type: 'x402_402',
    headers: {
      'X-Payment-Required': `USDC ${finalPrice} solana:devnet`,
      'X-Recipient': item.sellerWallet,
      'X-Item-Id': item.id,
    },
  };
  await sleep(900);

  const txHash = fakeTxHash();
  yield {
    type: 'x402_paying',
    txHash,
    payer: shortWallet(walletAddress),
  };
  await sleep(1300);

  yield {
    type: 'x402_settled',
    txHash,
    amount: finalPrice,
    itemId: item.id,
    itemTitle: item.title,
    sellerName: item.sellerName,
    sellerWallet: item.sellerWallet,
    etaMin,
  };
  await sleep(200);

  yield { type: 'done' };
}
