import type { MarketItem } from '@/types';

const g = globalThis as any;

function seed(): Map<string, MarketItem> {
  const now = Date.now();
  const items: MarketItem[] = [
    {
      id: 'item_seed_1',
      title: '라면 박스 (20개입)',
      description: '신라면 20봉지 묶음. 항해 중 야식용으로 인기.',
      category: 'food',
      price: 12,
      sellerWallet: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      sellerName: '부산상회',
      sellerRating: 4.8,
      port: 'busan',
      deliveryTime: '2시간 이내',
      stock: 8,
      createdAt: new Date(now - 3_600_000).toISOString(),
    },
    {
      id: 'item_seed_2',
      title: 'GPS 케이블 교체 서비스',
      description: '항해용 GPS 안테나 케이블 출장 교체. 도구·부품 포함.',
      category: 'service',
      price: 45,
      sellerWallet: 'DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC86PZ8okm21hy',
      sellerName: '해상정비공방',
      sellerRating: 4.9,
      port: 'busan',
      deliveryTime: '당일',
      stock: 3,
      createdAt: new Date(now - 7_200_000).toISOString(),
    },
    {
      id: 'item_seed_3',
      title: '환전 USDC↔KRW',
      description: '항구 현장에서 USDC를 원화로 즉시 환전. 1:1330 환율.',
      category: 'exchange',
      price: 50,
      sellerWallet: 'GjwLqkqfQpQ2WgPmrPm5sRMC86PZ8okm21hyDRpbCBMx',
      sellerName: '항구환전소',
      sellerRating: 4.7,
      port: 'busan',
      deliveryTime: '즉시',
      stock: 20,
      createdAt: new Date(now - 1_800_000).toISOString(),
    },
    {
      id: 'item_seed_4',
      title: '한국 연안 입항 절차 가이드 PDF',
      description: '부산·인천 항구 입항 서류 작성법 한·영 상세 가이드.',
      category: 'info',
      price: 5,
      sellerWallet: 'B9QwXf8Hb1mP7yA2KQp4mZRnT3sLcDvE8RfGhJ9KLM6',
      sellerName: '해운컨설팅 박',
      sellerRating: 5.0,
      port: 'any',
      deliveryTime: '즉시 다운로드',
      stock: 99,
      createdAt: new Date(now - 86_400_000).toISOString(),
    },
    {
      id: 'item_seed_5',
      title: '엔진 오일 필터 (대형선용)',
      description: 'Mann Filter W11102/36. 5000톤급 디젤 엔진 호환.',
      category: 'parts',
      price: 38,
      sellerWallet: 'F2KQp4mZRnT3sLcDvE8RfGhJ9KLM6B9QwXf8Hb1mP7y',
      sellerName: '인천선용품',
      sellerRating: 4.6,
      port: 'incheon',
      deliveryTime: '4시간',
      stock: 6,
      createdAt: new Date(now - 5_400_000).toISOString(),
    },
    {
      id: 'item_seed_6',
      title: '도시락 (한식 백반)',
      description: '제육볶음·김치찌개·반찬 3종 + 밥. 따뜻하게 배송.',
      category: 'food',
      price: 9,
      sellerWallet: 'H7yA2KQp4mZRnT3sLcDvE8RfGhJ9KLM6B9QwXf8Hb1mP',
      sellerName: '항구식당 김씨',
      sellerRating: 4.9,
      port: 'incheon',
      deliveryTime: '30분',
      stock: 15,
      createdAt: new Date(now - 900_000).toISOString(),
    },
    {
      id: 'item_seed_7',
      title: '선박 청소 대행',
      description: '갑판·선실 청소 2인 작업. 친환경 세제 사용.',
      category: 'service',
      price: 28,
      sellerWallet: 'K9QwXf8Hb1mP7yA2KQp4mZRnT3sLcDvE8RfGhJ9KLM6B',
      sellerName: '클린마린',
      sellerRating: 4.5,
      port: 'busan',
      deliveryTime: '예약제',
      stock: 5,
      createdAt: new Date(now - 12_600_000).toISOString(),
    },
    {
      id: 'item_seed_8',
      title: '항해등 LED 교체용 (12V)',
      description: '국제 규격 항해등 LED 4개입. 5년 보증.',
      category: 'parts',
      price: 22,
      sellerWallet: 'L6B9QwXf8Hb1mP7yA2KQp4mZRnT3sLcDvE8RfGhJ9KLM',
      sellerName: '부산해상조명',
      sellerRating: 4.7,
      port: 'busan',
      deliveryTime: '익일',
      stock: 12,
      createdAt: new Date(now - 64_800_000).toISOString(),
    },
    {
      id: 'item_seed_9',
      title: '커피 원두 1kg (브라질)',
      description: '항해 중 모카포트용 중배전 원두. 신선 로스팅.',
      category: 'food',
      price: 18,
      sellerWallet: 'M6B9QwXf8Hb1mP7yA2KQp4mZRnT3sLcDvE8RfGhJ9KLL',
      sellerName: '바다커피',
      sellerRating: 4.8,
      port: 'any',
      deliveryTime: '익일',
      stock: 10,
      createdAt: new Date(now - 18_000_000).toISOString(),
    },
    {
      id: 'item_seed_10',
      title: '인천 입항 통관 대행',
      description: '세관 신고서·검역 처리 일괄 대행. 영문 서류 포함.',
      category: 'service',
      price: 50,
      sellerWallet: 'N6B9QwXf8Hb1mP7yA2KQp4mZRnT3sLcDvE8RfGhJ9KLK',
      sellerName: '동방관세사',
      sellerRating: 4.9,
      port: 'incheon',
      deliveryTime: '24시간',
      stock: 4,
      createdAt: new Date(now - 21_600_000).toISOString(),
    },
    {
      id: 'item_seed_11',
      title: '근해 어장 위치 정보',
      description: '최근 7일간 부산 근해 조황 데이터. 일일 갱신.',
      category: 'info',
      price: 8,
      sellerWallet: 'O6B9QwXf8Hb1mP7yA2KQp4mZRnT3sLcDvE8RfGhJ9KLJ',
      sellerName: '어획정보회',
      sellerRating: 4.4,
      port: 'busan',
      deliveryTime: '즉시',
      stock: 30,
      createdAt: new Date(now - 43_200_000).toISOString(),
    },
    {
      id: 'item_seed_12',
      title: '갑판 미끄럼방지 매트',
      description: '600x900mm 고무 매트 2장. 비올 때 안전.',
      category: 'parts',
      price: 14,
      sellerWallet: 'P6B9QwXf8Hb1mP7yA2KQp4mZRnT3sLcDvE8RfGhJ9KLI',
      sellerName: '인천선구점',
      sellerRating: 4.6,
      port: 'incheon',
      deliveryTime: '4시간',
      stock: 9,
      createdAt: new Date(now - 32_400_000).toISOString(),
    },
  ];

  const m = new Map<string, MarketItem>();
  for (const it of items) m.set(it.id, it);
  return m;
}

if (!g.__seawatchItems__) {
  g.__seawatchItems__ = seed();
}
const items: Map<string, MarketItem> = g.__seawatchItems__;

export interface ListFilter {
  port?: 'busan' | 'incheon' | 'any';
  category?: MarketItem['category'];
  query?: string;
}

export function listItems(filter: ListFilter = {}): MarketItem[] {
  const q = filter.query?.trim().toLowerCase();
  const out: MarketItem[] = [];
  for (const it of Array.from(items.values())) {
    if (filter.port && filter.port !== 'any' && it.port !== filter.port && it.port !== 'any') continue;
    if (filter.category && it.category !== filter.category) continue;
    if (q) {
      const hay = `${it.title} ${it.description} ${it.sellerName}`.toLowerCase();
      if (!hay.includes(q)) continue;
    }
    out.push(it);
  }
  return out.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function getItem(id: string): MarketItem | null {
  return items.get(id) ?? null;
}

export interface AddItemInput {
  title: string;
  description: string;
  category: MarketItem['category'];
  price: number;
  sellerWallet: string;
  sellerName: string;
  port: MarketItem['port'];
  deliveryTime: string;
  stock: number;
}

export function addItem(input: AddItemInput): MarketItem {
  const id = 'item_' + (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
  const item: MarketItem = {
    id,
    title: input.title,
    description: input.description,
    category: input.category,
    price: Number(input.price),
    sellerWallet: input.sellerWallet,
    sellerName: input.sellerName,
    sellerRating: 5.0,
    port: input.port,
    deliveryTime: input.deliveryTime,
    stock: Number(input.stock ?? 1),
    createdAt: new Date().toISOString(),
  };
  items.set(id, item);
  return item;
}

export function decrementStock(id: string): MarketItem | null {
  const it = items.get(id);
  if (!it) return null;
  if (it.stock <= 0) return it;
  const next: MarketItem = { ...it, stock: it.stock - 1 };
  items.set(id, next);
  return next;
}
