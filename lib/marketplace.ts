import type { MarketItem } from '@/types';

const g = globalThis as any;

function seed(): Map<string, MarketItem> {
  const now = Date.now();
  const items: MarketItem[] = [
    {
      id: 'item_seed_1',
      title: 'Instant Ramen Box (20 packs)',
      description: 'Bundle of 20 Shin Ramyun packs. Popular late-night meal at sea.',
      category: 'food',
      price: 0.1,
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
      title: 'GPS Cable Replacement Service',
      description: 'On-site replacement of marine GPS antenna cable. Tools and parts included.',
      category: 'service',
      price: 0.5,
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
      title: 'Currency Exchange USDC↔KRW',
      description: 'Instant USDC to KRW conversion at the port. 1:1330 exchange rate.',
      category: 'exchange',
      price: 0.5,
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
      title: 'Korea Coastal Port Entry Procedure Guide (PDF)',
      description: 'Detailed bilingual (KR/EN) guide for Busan and Incheon port entry paperwork.',
      category: 'info',
      price: 0.05,
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
      title: 'Engine Oil Filter (Large Vessel)',
      description: 'Mann Filter W11102/36. Compatible with 5000-ton class diesel engines.',
      category: 'parts',
      price: 0.4,
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
      title: 'Lunchbox (Korean Set Meal)',
      description: 'Spicy pork stir-fry, kimchi stew, 3 side dishes, and rice. Delivered hot.',
      category: 'food',
      price: 0.1,
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
      title: 'Vessel Cleaning Service',
      description: 'Two-person deck and cabin cleaning crew. Eco-friendly detergents used.',
      category: 'service',
      price: 0.3,
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
      title: 'Navigation Light LED Replacements (12V)',
      description: 'IMO-compliant navigation light LEDs, pack of 4. 5-year warranty.',
      category: 'parts',
      price: 0.25,
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
      title: 'Coffee Beans 1kg (Brazil)',
      description: 'Medium-roast beans for moka pot use at sea. Freshly roasted.',
      category: 'food',
      price: 0.2,
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
      title: 'Incheon Port Entry Customs Agent',
      description: 'End-to-end customs declaration and quarantine handling. English paperwork included.',
      category: 'service',
      price: 0.5,
      sellerWallet: 'N6B9QwXf8Hb1mP7yA2KQp4mZRnT3sLcDvE8RfGhJ9KLK',
      sellerName: 'Dongbang Customs Brokerage',
      sellerRating: 4.9,
      port: 'incheon',
      deliveryTime: '24 hours',
      stock: 4,
      createdAt: new Date(now - 21_600_000).toISOString(),
    },
    {
      id: 'item_seed_11',
      title: 'Coastal Fishing Grounds Location Data',
      description: 'Last 7 days of catch reports for the Busan coastal area. Updated daily.',
      category: 'info',
      price: 0.08,
      sellerWallet: 'O6B9QwXf8Hb1mP7yA2KQp4mZRnT3sLcDvE8RfGhJ9KLJ',
      sellerName: 'Fisheries Info Group',
      sellerRating: 4.4,
      port: 'busan',
      deliveryTime: 'Instant',
      stock: 30,
      createdAt: new Date(now - 43_200_000).toISOString(),
    },
    {
      id: 'item_seed_12',
      title: 'Deck Anti-Slip Mats',
      description: '600x900mm rubber mats, set of 2. Safer footing in wet conditions.',
      category: 'parts',
      price: 0.15,
      sellerWallet: 'P6B9QwXf8Hb1mP7yA2KQp4mZRnT3sLcDvE8RfGhJ9KLI',
      sellerName: 'Incheon Marine Outfitters',
      sellerRating: 4.6,
      port: 'incheon',
      deliveryTime: '4 hours',
      stock: 9,
      createdAt: new Date(now - 32_400_000).toISOString(),
    },
    {
      id: 'item_seed_sg_1',
      title: 'Diesel Bunker Refuel (1,000 L)',
      description: 'Premium marine gas oil delivered at anchor by barge. Singapore-grade fuel.',
      category: 'service',
      price: 0.5,
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
      title: 'Asian Snack Provisions Box',
      description: 'Instant laksa, satay, and tropical fruit pack from Tanjong Pagar pier.',
      category: 'food',
      price: 0.18,
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
      title: 'Yangtze Pilot Boarding Service',
      description: 'Licensed pilot for Yangtze River entry up to Nanjing terminal.',
      category: 'service',
      price: 0.5,
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
      title: 'Container Pre-Inspection',
      description: 'Pre-arrival container condition and seal audit before customs clearance.',
      category: 'service',
      price: 0.35,
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
      title: 'Dim Sum Crew Lunch (10 ppl)',
      description: 'Hot dim sum platter delivered to vessel via launch boat. 10 servings.',
      category: 'food',
      price: 0.22,
      sellerWallet: 'Hk1QwXf8Hb1mP7yA2KQp4mZRnT3sLcDvE8RfGhJ9HK1',
      sellerName: 'Victoria Harbour Catering',
      sellerRating: 4.9,
      port: 'hongkong',
      deliveryTime: '45 minutes',
      stock: 12,
      createdAt: new Date(now - 1_200_000).toISOString(),
    },
    {
      id: 'item_seed_hk_2',
      title: 'Marine Insurance Doc Review',
      description: 'Hong Kong P&I club paperwork review before signing. Bilingual EN/ZH.',
      category: 'info',
      price: 0.3,
      sellerWallet: 'Hk2QwXf8Hb1mP7yA2KQp4mZRnT3sLcDvE8RfGhJ9HK2',
      sellerName: 'HK Maritime Legal Group',
      sellerRating: 4.7,
      port: 'hongkong',
      deliveryTime: '24 hours',
      stock: 6,
      createdAt: new Date(now - 28_800_000).toISOString(),
    },
    {
      id: 'item_seed_du_1',
      title: 'Halal Provisions Crate (7-day)',
      description: 'Halal-certified food crate for crew. 7 days for 12 people.',
      category: 'food',
      price: 0.28,
      sellerWallet: 'Du1QwXf8Hb1mP7yA2KQp4mZRnT3sLcDvE8RfGhJ9DU1',
      sellerName: 'Jebel Ali Provisions',
      sellerRating: 4.8,
      port: 'dubai',
      deliveryTime: 'Same day',
      stock: 10,
      createdAt: new Date(now - 5_000_000).toISOString(),
    },
    {
      id: 'item_seed_du_2',
      title: 'Bunker Fuel Brokerage Quote',
      description: 'Best-rate fuel quote from 5 Jebel Ali suppliers. Email with full breakdown.',
      category: 'exchange',
      price: 0.32,
      sellerWallet: 'Du2QwXf8Hb1mP7yA2KQp4mZRnT3sLcDvE8RfGhJ9DU2',
      sellerName: 'Gulf Bunker Broker',
      sellerRating: 4.6,
      port: 'dubai',
      deliveryTime: '4 hours',
      stock: 15,
      createdAt: new Date(now - 15_000_000).toISOString(),
    },
    {
      id: 'item_seed_rt_1',
      title: 'ECDIS Chart Update Service',
      description: 'Full ECDIS ENC update through ChartCo gateway. Onboard install support.',
      category: 'service',
      price: 0.4,
      sellerWallet: 'Rt1QwXf8Hb1mP7yA2KQp4mZRnT3sLcDvE8RfGhJ9RT1',
      sellerName: 'Rotterdam Marine Tech',
      sellerRating: 4.8,
      port: 'rotterdam',
      deliveryTime: '8 hours',
      stock: 5,
      createdAt: new Date(now - 11_000_000).toISOString(),
    },
    {
      id: 'item_seed_rt_2',
      title: 'EU Customs Pre-Clearance Pack',
      description: 'Digital pre-clearance docs for Rotterdam and 27 EU ports.',
      category: 'info',
      price: 0.45,
      sellerWallet: 'Rt2QwXf8Hb1mP7yA2KQp4mZRnT3sLcDvE8RfGhJ9RT2',
      sellerName: 'Maas Customs Services',
      sellerRating: 4.7,
      port: 'rotterdam',
      deliveryTime: 'Instant',
      stock: 50,
      createdAt: new Date(now - 38_000_000).toISOString(),
    },
    {
      id: 'item_seed_hb_1',
      title: 'Lifeboat & SOLAS Inspection',
      description: 'Class-approved lifeboat and SOLAS gear annual inspection.',
      category: 'service',
      price: 0.5,
      sellerWallet: 'Hb1QwXf8Hb1mP7yA2KQp4mZRnT3sLcDvE8RfGhJ9HB1',
      sellerName: 'Hamburg Marine Safety',
      sellerRating: 4.9,
      port: 'hamburg',
      deliveryTime: 'By appointment',
      stock: 3,
      createdAt: new Date(now - 17_000_000).toISOString(),
    },
    {
      id: 'item_seed_hb_2',
      title: 'German Provisions Pack',
      description: 'Bread, sausage, pickled vegetables, and pretzels. 4-day crew supply.',
      category: 'food',
      price: 0.2,
      sellerWallet: 'Hb2QwXf8Hb1mP7yA2KQp4mZRnT3sLcDvE8RfGhJ9HB2',
      sellerName: 'Elbe Provisions GmbH',
      sellerRating: 4.6,
      port: 'hamburg',
      deliveryTime: '3 hours',
      stock: 14,
      createdAt: new Date(now - 8_400_000).toISOString(),
    },
    {
      id: 'item_seed_la_1',
      title: 'USCG Compliance Audit',
      description: 'Pre-arrival USCG inspection checklist review. Avoid detention orders.',
      category: 'info',
      price: 0.48,
      sellerWallet: 'La1QwXf8Hb1mP7yA2KQp4mZRnT3sLcDvE8RfGhJ9LA1',
      sellerName: 'Pacific Compliance LLC',
      sellerRating: 4.9,
      port: 'losangeles',
      deliveryTime: '24 hours',
      stock: 7,
      createdAt: new Date(now - 22_000_000).toISOString(),
    },
    {
      id: 'item_seed_la_2',
      title: 'Pacific Bunker Rate Quote',
      description: 'Today Long Beach / LA / San Pedro VLSFO and MGO rate sheet.',
      category: 'exchange',
      price: 0.12,
      sellerWallet: 'La2QwXf8Hb1mP7yA2KQp4mZRnT3sLcDvE8RfGhJ9LA2',
      sellerName: 'West Coast Bunker Desk',
      sellerRating: 4.5,
      port: 'losangeles',
      deliveryTime: 'Instant',
      stock: 99,
      createdAt: new Date(now - 1_500_000).toISOString(),
    },
    {
      id: 'item_seed_ny_1',
      title: 'Atlantic Routing Plan',
      description: 'Optimized weather routing across NY to Rotterdam corridor.',
      category: 'info',
      price: 0.42,
      sellerWallet: 'Ny1QwXf8Hb1mP7yA2KQp4mZRnT3sLcDvE8RfGhJ9NY1',
      sellerName: 'NY Routing Bureau',
      sellerRating: 4.8,
      port: 'newyork',
      deliveryTime: '2 hours',
      stock: 10,
      createdAt: new Date(now - 6_300_000).toISOString(),
    },
    {
      id: 'item_seed_ny_2',
      title: 'Maritime Lawyer (1h Consult)',
      description: 'One-hour consult with NY admiralty lawyer. Charter party disputes.',
      category: 'service',
      price: 0.5,
      sellerWallet: 'Ny2QwXf8Hb1mP7yA2KQp4mZRnT3sLcDvE8RfGhJ9NY2',
      sellerName: 'Hudson Admiralty Group',
      sellerRating: 4.9,
      port: 'newyork',
      deliveryTime: 'Same day',
      stock: 4,
      createdAt: new Date(now - 50_000_000).toISOString(),
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
