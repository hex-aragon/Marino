export interface ShipData {
  mmsi: string;
  shipname: string;
  lat: number;
  lon: number;
  sog: number;
  cog: number;
  destination: string;
  shiptype: number;
  timestamp: string;
  status: number;
}

export interface AgentAlert {
  mmsi: string;
  shipname: string;
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  type: 'DRIFT' | 'WEATHER' | 'ROUTE' | 'CONGESTION';
  message: string;
  action: string;
  createdAt: string;
}

export interface AgentAnalysisResult {
  alerts: AgentAlert[];
  summary: string;
}

export interface WeatherData {
  area: 'busan' | 'incheon';
  waveHeight: number;
  waveDirection: number;
  wavePeriod: number;
  windWaveHeight?: number;
  swellWaveHeight?: number;
  riskLevel: 'SAFE' | 'CAUTION' | 'DANGER';
  updatedAt: string;
}

export interface PremiumWeatherForecast extends WeatherData {
  hourly: Array<{
    time: string;
    waveHeight: number;
    waveDirection: number;
    wavePeriod: number;
  }>;
  routeAnalysis: string;
}

export interface MarketItem {
  id: string;
  title: string;
  description: string;
  category: 'food' | 'parts' | 'service' | 'info' | 'exchange';
  price: number;
  sellerWallet: string;
  sellerName: string;
  sellerRating: number;
  port: 'busan' | 'incheon' | 'any';
  deliveryTime: string;
  stock: number;
  createdAt: string;
}

export interface Escrow {
  id: string;
  itemId: string;
  buyerWallet: string;
  sellerWallet: string;
  amount: number;
  txHash: string;
  status: 'locked' | 'released' | 'refunded';
  createdAt: string;
}

export interface PaymentRequest {
  reference: string;
  amount: number;
  memo: string;
  url: string;
  qrData: string;
}

export type Area = 'busan' | 'incheon';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}
