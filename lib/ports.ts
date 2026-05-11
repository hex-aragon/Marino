export interface PortInfo {
  id: string;
  label: string;
  country: string;
  flag: string;
  lat: number;
  lon: number;
  bbox: [[number, number], [number, number]];
}

export const PORTS: PortInfo[] = [
  {
    id: 'busan',
    label: 'Busan',
    country: 'Korea',
    flag: '🇰🇷',
    lat: 35.1,
    lon: 129.0,
    bbox: [[34.8, 128.8], [35.2, 129.3]],
  },
  {
    id: 'incheon',
    label: 'Incheon',
    country: 'Korea',
    flag: '🇰🇷',
    lat: 37.45,
    lon: 126.6,
    bbox: [[37.2, 126.3], [37.6, 126.8]],
  },
  {
    id: 'singapore',
    label: 'Singapore',
    country: 'Singapore',
    flag: '🇸🇬',
    lat: 1.27,
    lon: 103.8,
    bbox: [[1.1, 103.5], [1.45, 104.1]],
  },
  {
    id: 'shanghai',
    label: 'Shanghai',
    country: 'China',
    flag: '🇨🇳',
    lat: 31.34,
    lon: 121.65,
    bbox: [[30.95, 121.4], [31.6, 122.0]],
  },
  {
    id: 'hongkong',
    label: 'Hong Kong',
    country: 'Hong Kong',
    flag: '🇭🇰',
    lat: 22.3,
    lon: 114.18,
    bbox: [[22.15, 113.95], [22.45, 114.4]],
  },
  {
    id: 'dubai',
    label: 'Dubai (Jebel Ali)',
    country: 'UAE',
    flag: '🇦🇪',
    lat: 25.0,
    lon: 55.05,
    bbox: [[24.85, 54.8], [25.15, 55.3]],
  },
  {
    id: 'rotterdam',
    label: 'Rotterdam',
    country: 'Netherlands',
    flag: '🇳🇱',
    lat: 51.95,
    lon: 4.14,
    bbox: [[51.8, 3.9], [52.1, 4.4]],
  },
  {
    id: 'hamburg',
    label: 'Hamburg',
    country: 'Germany',
    flag: '🇩🇪',
    lat: 53.55,
    lon: 9.99,
    bbox: [[53.45, 9.7], [53.65, 10.25]],
  },
  {
    id: 'losangeles',
    label: 'Los Angeles',
    country: 'USA',
    flag: '🇺🇸',
    lat: 33.74,
    lon: -118.27,
    bbox: [[33.6, -118.45], [33.85, -118.1]],
  },
  {
    id: 'newyork',
    label: 'New York',
    country: 'USA',
    flag: '🇺🇸',
    lat: 40.66,
    lon: -74.05,
    bbox: [[40.5, -74.25], [40.8, -73.85]],
  },
];

export type PortId = (typeof PORTS)[number]['id'];

const PORT_BY_ID = new Map(PORTS.map((p) => [p.id, p]));

export function getPort(id: string): PortInfo | undefined {
  return PORT_BY_ID.get(id);
}

export function isValidPortId(id: string): id is PortId {
  return PORT_BY_ID.has(id);
}

export const DEFAULT_PORT: PortId = 'busan';
