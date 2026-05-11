import type { MarketItem } from '@/types';

const g = globalThis as any;

function seed(): Map<string, MarketItem> {
  const now = Date.now();
  const items: MarketItem[] = [
    {
      id: 'item_seed_1',
      title: 'Instant Ramen Box (20 packs) 라면 박스',
      description: 'Bundle of 20 Shin Ramyun packs. Popular late-night meal at sea. 신라면 20개입 박스 야식 필수품.',
      category: 'food',
      price: 11.5,
      sellerWallet: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      sellerName: 'Busan Trading Co.',
      sellerRating: 4.8,
      port: 'busan',
      deliveryTime: 'Within 2 hours',
      stock: 8,
      createdAt: new Date(now - 3_600_000).toISOString(),
    },
    {
      id: 'item_seed_2',
      title: 'GPS Cable Replacement Service 케이블 수리',
      description: 'On-site replacement of marine GPS antenna cable. Tools and parts included. 선박 GPS 안테나 케이블 교체 서비스.',
      category: 'service',
      price: 45.0,
      sellerWallet: 'DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC86PZ8okm21hy',
      sellerName: 'Marine Repair Workshop',
      sellerRating: 4.9,
      port: 'busan',
      deliveryTime: 'Same day',
      stock: 3,
      createdAt: new Date(now - 7_200_000).toISOString(),
    },
    {
      id: 'item_seed_3',
      title: 'Currency Exchange USDC↔KRW 환전',
      description: 'Instant USDC to KRW conversion at the port. 항구 즉시 환전. 1:1330 exchange rate.',
      category: 'exchange',
      price: 5.0,
      sellerWallet: 'GjwLqkqfQpQ2WgPmrPm5sRMC86PZ8okm21hyDRpbCBMx',
      sellerName: 'Port Exchange Office',
      sellerRating: 4.7,
      port: 'busan',
      deliveryTime: 'Instant',
      stock: 20,
      createdAt: new Date(now - 1_800_000).toISOString(),
    },
    {
      id: 'item_seed_4',
      title: 'Korea Coastal Port Entry Procedure Guide (PDF) 입항 가이드',
      description: 'Detailed bilingual (KR/EN) guide for Busan and Incheon port entry paperwork. 부산/인천 입항 서류 가이드.',
      category: 'info',
      price: 2.0,
      sellerWallet: 'B9QwXf8Hb1mP7yA2KQp4mZRnT3sLcDvE8RfGhJ9KLM6',
      sellerName: 'Park Maritime Consulting',
      sellerRating: 5.0,
      port: 'any',
      deliveryTime: 'Instant download',
      stock: 99,
      createdAt: new Date(now - 86_400_000).toISOString(),
    },
    {
      id: 'item_seed_5',
      title: 'Engine Oil Filter (Large Vessel) 엔진 오일 필터',
      description: 'Mann Filter W11102/36. Compatible with 5000-ton class diesel engines. 대형 선박용 엔진 오일 필터.',
      category: 'parts',
      price: 25.0,
      sellerWallet: 'F2KQp4mZRnT3sLcDvE8RfGhJ9KLM6B9QwXf8Hb1mP7y',
      sellerName: 'Incheon Ship Supplies',
      sellerRating: 4.6,
      port: 'incheon',
      deliveryTime: '4 hours',
      stock: 6,
      createdAt: new Date(now - 5_400_000).toISOString(),
    },
    {
      id: 'item_seed_6',
      title: 'Lunchbox (Korean Set Meal) 한식 도시락',
      description: 'Spicy pork stir-fry, kimchi stew, 3 side dishes, and rice. 제육볶음 김치찌개 도시락 배달.',
      category: 'food',
      price: 8.5,
      sellerWallet: 'H7yA2KQp4mZRnT3sLcDvE8RfGhJ9KLM6B9QwXf8Hb1mP',
      sellerName: "Kim's Harbor Diner",
      sellerRating: 4.9,
      port: 'incheon',
      deliveryTime: '30 minutes',
      stock: 15,
      createdAt: new Date(now - 900_000).toISOString(),
    },
    {
      id: 'item_seed_7',
      title: 'Vessel Cleaning Service 선박 청소',
      description: 'Two-person deck and cabin cleaning crew. Eco-friendly detergents used. 친환경 선박 덱 청소 서비스.',
      category: 'service',
      price: 150.0,
      sellerWallet: 'K9QwXf8Hb1mP7yA2KQp4mZRnT3sLcDvE8RfGhJ9KLM6B',
      sellerName: 'CleanMarine',
      sellerRating: 4.5,
      port: 'busan',
      deliveryTime: 'By appointment',
      stock: 5,
      createdAt: new Date(now - 12_600_000).toISOString(),
    },
    {
      id: 'item_seed_8',
      title: 'Navigation Light LED Replacements (12V) 항해등 교체',
      description: 'IMO-compliant navigation light LEDs, pack of 4. 5-year warranty. 12V 항해등 LED 4팩.',
      category: 'parts',
      price: 18.0,
      sellerWallet: 'L6B9QwXf8Hb1mP7yA2KQp4mZRnT3sLcDvE8RfGhJ9KLM',
      sellerName: 'Busan Marine Lighting',
      sellerRating: 4.7,
      port: 'busan',
      deliveryTime: 'Next day',
      stock: 12,
      createdAt: new Date(now - 64_800_000).toISOString(),
    },
    {
      id: 'item_seed_9',
      title: 'Coffee Beans 1kg (Brazil) 커피 원두',
      description: 'Medium-roast beans for moka pot use at sea. Freshly roasted. 선상 모카포트용 브라질 원두 1kg.',
      category: 'food',
      price: 14.0,
      sellerWallet: 'M6B9QwXf8Hb1mP7yA2KQp4mZRnT3sLcDvE8RfGhJ9KLL',
      sellerName: 'Sea Coffee',
      sellerRating: 4.8,
      port: 'any',
      deliveryTime: 'Next day',
      stock: 10,
      createdAt: new Date(now - 18_000_000).toISOString(),
    },
    {
      id: 'item_seed_10',
      title: 'Incheon Port Entry Customs Agent 인천 세관 대행',
      description: 'End-to-end customs declaration and quarantine handling. English paperwork included. 인천항 세관 신고 대행.',
      category: 'service',
      price: 200.0,
      sellerWallet: 'N6B9QwXf8Hb1mP7yA2KQp4mZRnT3sLcDvE8RfGhJ9KLK',
      sellerName: 'Dongbang Customs Brokerage',
      sellerRating: 4.9,
      port: 'incheon',
      deliveryTime: '24 hours',
      stock: 4,
      createdAt: new Date(now - 21_600_000).toISOString(),
    },
    {
      id: 'item_seed_sg_1',
      title: 'Diesel Bunker Refuel (1,000 L) 디젤 연료 보급',
      description: 'Premium marine gas oil delivered at anchor by barge. Singapore-grade fuel.',
      category: 'service',
      price: 850.0,
      sellerWallet: 'Sg1QwXf8Hb1mP7yA2KQp4mZRnT3sLcDvE8RfGhJ9SG1',
      sellerName: 'Maritime Fuel Singapore',
      sellerRating: 4.9,
      port: 'singapore',
      deliveryTime: '6 hours',
      stock: 4,
      createdAt: new Date(now - 6_000_000).toISOString(),
    },
    {
      id: 'item_seed_sg_2',
      title: 'Asian Snack Provisions Box 아시아 스낵 박스',
      description: 'Instant laksa, satay, and tropical fruit pack from Tanjong Pagar pier.',
      category: 'food',
      price: 45.0,
      sellerWallet: 'Sg2QwXf8Hb1mP7yA2KQp4mZRnT3sLcDvE8RfGhJ9SG2',
      sellerName: 'Lion City Provisions',
      sellerRating: 4.7,
      port: 'singapore',
      deliveryTime: 'Same day',
      stock: 18,
      createdAt: new Date(now - 2_700_000).toISOString(),
    },
    {
      id: 'item_seed_sh_1',
      title: 'Yangtze Pilot Boarding Service 양쯔강 도선사',
      description: 'Licensed pilot for Yangtze River entry up to Nanjing terminal.',
      category: 'service',
      price: 350.0,
      sellerWallet: 'Sh1QwXf8Hb1mP7yA2KQp4mZRnT3sLcDvE8RfGhJ9SH1',
      sellerName: 'Shanghai Pilot Co.',
      sellerRating: 4.8,
      port: 'shanghai',
      deliveryTime: 'On request',
      stock: 2,
      createdAt: new Date(now - 4_500_000).toISOString(),
    },
    {
      id: 'item_seed_sh_2',
      title: 'Container Pre-Inspection 컨테이너 사전 검사',
      description: 'Pre-arrival container condition and seal audit before customs clearance.',
      category: 'service',
      price: 120.0,
      sellerWallet: 'Sh2QwXf8Hb1mP7yA2KQp4mZRnT3sLcDvE8RfGhJ9SH2',
      sellerName: 'Pudong Cargo Audit',
      sellerRating: 4.5,
      port: 'shanghai',
      deliveryTime: '12 hours',
      stock: 8,
      createdAt: new Date(now - 9_000_000).toISOString(),
    },
    {
      id: 'item_seed_hk_1',
      title: 'Dim Sum Crew Lunch (10 ppl) 딤섬 점심 세트',
      description: 'Hot dim sum platter delivered to vessel via launch boat. 10 servings.',
      category: 'food',
      price: 85.0,
      sellerWallet: 'Hk1QwXf8Hb1mP7yA2KQp4mZRnT3sLcDvE8RfGhJ9HK1',
      sellerName: 'Victoria Harbour Catering',
      sellerRating: 4.9,
      port: 'hongkong',
      deliveryTime: '45 minutes',
      stock: 12,
      createdAt: new Date(now - 1_200_000).toISOString(),
    },
    {
      id: 'item_seed_du_1',
      title: 'Halal Provisions Crate (7-day) 할랄 식량 크레이트',
      description: 'Halal-certified food crate for crew. 7 days for 12 people.',
      category: 'food',
      price: 450.0,
      sellerWallet: 'Du1QwXf8Hb1mP7yA2KQp4mZRnT3sLcDvE8RfGhJ9DU1',
      sellerName: 'Jebel Ali Provisions',
      sellerRating: 4.8,
      port: 'dubai',
      deliveryTime: 'Same day',
      stock: 10,
      createdAt: new Date(now - 5_000_000).toISOString(),
    },
    {
      id: 'item_seed_rt_1',
      title: 'ECDIS Chart Update Service 해도 업데이트',
      description: 'Full ECDIS ENC update through ChartCo gateway. Onboard install support.',
      category: 'service',
      price: 280.0,
      sellerWallet: 'Rt1QwXf8Hb1mP7yA2KQp4mZRnT3sLcDvE8RfGhJ9RT1',
      sellerName: 'Rotterdam Marine Tech',
      sellerRating: 4.8,
      port: 'rotterdam',
      deliveryTime: '8 hours',
      stock: 5,
      createdAt: new Date(now - 11_000_000).toISOString(),
    },
    {
      id: 'item_seed_la_1',
      title: 'USCG Compliance Audit 미국 해안경비대 감사 대비',
      description: 'Pre-arrival USCG inspection checklist review. Avoid detention orders.',
      category: 'info',
      price: 150.0,
      sellerWallet: 'La1QwXf8Hb1mP7yA2KQp4mZRnT3sLcDvE8RfGhJ9LA1',
      sellerName: 'Pacific Compliance LLC',
      sellerRating: 4.9,
      port: 'losangeles',
      deliveryTime: '24 hours',
      stock: 7,
      createdAt: new Date(now - 22_000_000).toISOString(),
    },
  ];

  const m = new Map<string, MarketItem>();
  for (const it of items) m.set(it.id, it);
  return m;
}

if (!g.__marinoItems__) {
  g.__marinoItems__ = seed();
}
const items: Map<string, MarketItem> = g.__marinoItems__;

export interface ListFilter {
  port?: string;
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
