import WebSocket from 'ws';
import { kv } from '@vercel/kv';
import type { ShipData, Area } from '@/types';

const BUSAN_BBOX: [[number, number], [number, number]] = [[34.8, 128.8], [35.2, 129.3]];
const INCHEON_BBOX: [[number, number], [number, number]] = [[37.2, 126.3], [37.6, 126.8]];

interface AisState {
  ws: WebSocket | null;
  store: Map<string, ShipData>;
  started: boolean;
  reconnectTimer: NodeJS.Timeout | null;
  snapshotTimer: NodeJS.Timeout | null;
}

const g = globalThis as any;
if (!g.__seawatchAis) {
  g.__seawatchAis = {
    ws: null,
    store: new Map<string, ShipData>(),
    started: false,
    reconnectTimer: null,
    snapshotTimer: null,
  } as AisState;
}
const state: AisState = g.__seawatchAis;

function inBbox(lat: number, lon: number, bbox: [[number, number], [number, number]]): boolean {
  const [[minLat, minLon], [maxLat, maxLon]] = bbox;
  return lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon;
}

function bboxFor(area: Area) {
  return area === 'busan' ? BUSAN_BBOX : INCHEON_BBOX;
}

function emptyShip(mmsi: string): ShipData {
  return {
    mmsi,
    shipname: `MMSI ${mmsi}`,
    lat: 0,
    lon: 0,
    sog: 0,
    cog: 0,
    destination: '',
    shiptype: 0,
    timestamp: new Date().toISOString(),
    status: 0,
  };
}

function handleMessage(raw: string) {
  let msg: any;
  try {
    msg = JSON.parse(raw);
  } catch {
    return;
  }
  const type = msg.MessageType;
  const meta = msg.MetaData || {};
  const mmsi = String(meta.MMSI ?? msg.MMSI ?? '');
  if (!mmsi) return;

  const prev = state.store.get(mmsi) || emptyShip(mmsi);

  if (type === 'PositionReport') {
    const pr = msg.Message?.PositionReport || {};
    const lat = Number(pr.Latitude ?? meta.latitude ?? prev.lat);
    const lon = Number(pr.Longitude ?? meta.longitude ?? prev.lon);
    const sog = Number(pr.Sog ?? prev.sog);
    const cog = Number(pr.Cog ?? prev.cog);
    const status = Number(pr.NavigationalStatus ?? prev.status);
    const next: ShipData = {
      ...prev,
      lat,
      lon,
      sog,
      cog,
      status,
      timestamp: new Date().toISOString(),
    };
    if (meta.ShipName && !prev.shipname.startsWith('MMSI')) {
      next.shipname = prev.shipname;
    } else if (meta.ShipName) {
      next.shipname = String(meta.ShipName).trim();
    }
    state.store.set(mmsi, next);
  } else if (type === 'ShipStaticData') {
    const sd = msg.Message?.ShipStaticData || {};
    const next: ShipData = {
      ...prev,
      shipname: String(sd.Name ?? meta.ShipName ?? prev.shipname).trim(),
      destination: String(sd.Destination ?? prev.destination).trim(),
      shiptype: Number(sd.Type ?? prev.shiptype),
      timestamp: new Date().toISOString(),
    };
    state.store.set(mmsi, next);
  }
}

function scheduleReconnect() {
  if (state.reconnectTimer) return;
  state.reconnectTimer = setTimeout(() => {
    state.reconnectTimer = null;
    state.started = false;
    startAisStream();
  }, 5000);
}

function connect() {
  const key = process.env.AISSTREAM_API_KEY;
  if (!key) return;

  const ws = new WebSocket('wss://stream.aisstream.io/v0/stream');
  state.ws = ws;

  ws.on('open', () => {
    ws.send(
      JSON.stringify({
        APIKey: key,
        BoundingBoxes: [BUSAN_BBOX, INCHEON_BBOX],
        FilterMessageTypes: ['PositionReport', 'ShipStaticData'],
      })
    );
  });

  ws.on('message', (data: WebSocket.RawData) => {
    handleMessage(data.toString());
  });

  ws.on('close', () => {
    state.ws = null;
    scheduleReconnect();
  });

  ws.on('error', () => {
    try {
      ws.close();
    } catch {}
  });
}

async function snapshotToKv() {
  try {
    const arr = Array.from(state.store.values());
    if (arr.length === 0) return;
    await kv.set('ais:snapshot', { ships: arr, updatedAt: new Date().toISOString() }, { ex: 300 });
  } catch {}
}

export function startAisStream(): void {
  if (state.started) return;
  const key = process.env.AISSTREAM_API_KEY;
  if (!key) return;
  state.started = true;
  connect();
  if (!state.snapshotTimer) {
    state.snapshotTimer = setInterval(snapshotToKv, 30_000);
  }
}

export function getShipsByArea(area: Area): ShipData[] {
  const bbox = bboxFor(area);
  const out: ShipData[] = [];
  for (const ship of Array.from(state.store.values())) {
    if (ship.lat === 0 && ship.lon === 0) continue;
    if (inBbox(ship.lat, ship.lon, bbox)) out.push(ship);
  }
  return out;
}

const MOCK_NAMES_BUSAN = [
  'HANJIN BUSAN',
  'OCEAN PEARL',
  'KMTC SEOUL',
  'PACIFIC STAR',
  'SUNNY HORIZON',
  'EAST BREEZE',
  'BLUE WHALE',
  'GOLDEN WAVE',
  'SILVER TIDE',
  'NORTHERN LIGHT',
];

const MOCK_NAMES_INCHEON = [
  'INCHEON PIONEER',
  'YELLOW SEA',
  'KORAIL FERRY',
  'WEST WIND',
  'HARBOR QUEEN',
  'COASTAL HOPE',
  'MORNING GLORY',
  'CRYSTAL BAY',
  'SEA ARROW',
  'POLAR DRIFT',
];

const MOCK_DESTINATIONS = ['BUSAN', 'INCHEON', 'SHANGHAI', 'YOKOHAMA', 'QINGDAO', 'HONG KONG'];

export function getMockShips(area: Area): ShipData[] {
  const center = area === 'busan' ? { lat: 35.1, lon: 129.0 } : { lat: 37.45, lon: 126.6 };
  const names = area === 'busan' ? MOCK_NAMES_BUSAN : MOCK_NAMES_INCHEON;
  const now = Date.now();
  const ships: ShipData[] = [];
  for (let i = 0; i < 10; i++) {
    const seed = i + 1;
    const latOffset = ((seed * 37) % 200 - 100) / 1000;
    const lonOffset = ((seed * 53) % 200 - 100) / 1000;
    const statusPool = [0, 0, 0, 1, 5];
    const status = statusPool[i % statusPool.length];
    const sog = status === 0 ? Math.round((((seed * 13) % 18) + Math.random() * 2) * 10) / 10 : 0;
    const cog = Math.round(((seed * 71) % 360) * 10) / 10;
    ships.push({
      mmsi: String(440000000 + i * 137 + seed),
      shipname: names[i % names.length],
      lat: Math.round((center.lat + latOffset) * 1000) / 1000,
      lon: Math.round((center.lon + lonOffset) * 1000) / 1000,
      sog,
      cog,
      destination: MOCK_DESTINATIONS[i % MOCK_DESTINATIONS.length],
      shiptype: 70 + (i % 10),
      timestamp: new Date(now - i * 15_000).toISOString(),
      status,
    });
  }
  return ships;
}
