import { NextRequest, NextResponse } from 'next/server';
import { addItem, listItems } from '@/lib/marketplace';
import type { MarketItem } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_CATEGORIES: MarketItem['category'][] = ['food', 'parts', 'service', 'info', 'exchange'];
const VALID_PORTS: MarketItem['port'][] = ['busan', 'incheon', 'any'];

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const portParam = url.searchParams.get('port') as MarketItem['port'] | null;
  const categoryParam = url.searchParams.get('category') as MarketItem['category'] | null;
  const query = url.searchParams.get('q') || undefined;

  const port = portParam && VALID_PORTS.includes(portParam) ? portParam : undefined;
  const category =
    categoryParam && VALID_CATEGORIES.includes(categoryParam) ? categoryParam : undefined;

  const items = listItems({ port, category, query });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {}

  const required = ['title', 'description', 'category', 'price', 'sellerWallet', 'sellerName', 'port', 'deliveryTime'];
  for (const k of required) {
    if (!body?.[k]) {
      return NextResponse.json({ error: `missing ${k}` }, { status: 400 });
    }
  }

  if (!VALID_CATEGORIES.includes(body.category)) {
    return NextResponse.json({ error: 'invalid category' }, { status: 400 });
  }
  if (!VALID_PORTS.includes(body.port)) {
    return NextResponse.json({ error: 'invalid port' }, { status: 400 });
  }

  const item = addItem({
    title: String(body.title),
    description: String(body.description),
    category: body.category,
    price: Number(body.price),
    sellerWallet: String(body.sellerWallet),
    sellerName: String(body.sellerName),
    port: body.port,
    deliveryTime: String(body.deliveryTime),
    stock: Number(body.stock ?? 1),
  });

  return NextResponse.json(item);
}
