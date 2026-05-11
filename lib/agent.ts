import Anthropic from '@anthropic-ai/sdk';
import { kv } from '@vercel/kv';
import { z } from 'zod';
import type { AgentAlert, AgentAnalysisResult, Area, ChatMessage, ShipData, WeatherData } from '@/types';
import { sendHighAlertEmail } from '@/lib/alerts';

const MODEL = 'claude-sonnet-4-20250514';

const SYSTEM_PROMPT = `You are a maritime safety AI agent. You analyze vessel AIS data and weather data to detect risk situations and generate alerts.

Detection rules:
1. SOG=0 and status=0 (under way) → drift suspected (DRIFT, HIGH)
2. Wave height > 2.5m area entry → weather risk (WEATHER, HIGH)
3. COG deviation > 15° from route → route deviation (ROUTE, MEDIUM)
4. 3+ vessels within 0.5 nautical miles → congestion risk (CONGESTION, MEDIUM)

JSON ONLY (no markdown, no prose):
{ "alerts": [{ "mmsi", "shipname", "level": "LOW|MEDIUM|HIGH", "type": "DRIFT|WEATHER|ROUTE|CONGESTION", "message": "<=50 chars English", "action": "recommended action English" }], "summary": "overall situation summary, <=100 chars English" }`;

const CHAT_SYSTEM_PROMPT = `You are the SeaWatch maritime AI agent. Reply in English, friendly and concise.

Capabilities:
- Look up and summarize current vessel status
- Weather summary (free) / 72-hour detailed forecast (x402 2 USDC)
- Marketplace item search and recommendations
- Automated fuel and ship-supply booking (USDC escrow)
- Detailed route deviation analysis (x402 5 USDC)
- Port entry fee calculation

Keep answers short (2-5 sentences), using line breaks for structure when helpful.`;

const alertSchema = z.object({
  mmsi: z.union([z.string(), z.number()]).transform((v) => String(v)),
  shipname: z.string(),
  level: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  type: z.enum(['DRIFT', 'WEATHER', 'ROUTE', 'CONGESTION']),
  message: z.string(),
  action: z.string(),
});

const analysisSchema = z.object({
  alerts: z.array(alertSchema),
  summary: z.string(),
});

function getClient(): Anthropic | null {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  return new Anthropic({ apiKey: key });
}

function extractJson(text: string): string {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) return fence[1].trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start >= 0 && end > start) return text.slice(start, end + 1);
  return text;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getMockAnalysis(ships: ShipData[], weather: WeatherData | null, area: Area): AgentAnalysisResult {
  const alerts: AgentAlert[] = [];
  const created = nowIso();

  for (const s of ships) {
    if (s.sog === 0 && s.status === 0) {
      alerts.push({
        mmsi: s.mmsi,
        shipname: s.shipname,
        level: 'HIGH',
        type: 'DRIFT',
        message: `${s.shipname} drift suspected (speed 0, under way)`,
        action: 'Attempt radio contact with the captain immediately.',
        createdAt: created,
      });
      if (alerts.length >= 3) break;
    }
  }

  if (weather && weather.riskLevel === 'DANGER' && ships.length > 0 && alerts.length < 3) {
    const s = ships[0];
    alerts.push({
      mmsi: s.mmsi,
      shipname: s.shipname,
      level: 'HIGH',
      type: 'WEATHER',
      message: `${area === 'busan' ? 'Busan' : 'Incheon'} waters wave height ${weather.waveHeight.toFixed(1)}m danger`,
      action: 'Nearby vessels should consider rerouting or holding for port entry.',
      createdAt: created,
    });
  }

  if (alerts.length < 3) {
    const buckets = new Map<string, ShipData[]>();
    for (const s of ships) {
      const key = `${Math.round(s.lat * 2) / 2}:${Math.round(s.lon * 2) / 2}`;
      const arr = buckets.get(key) || [];
      arr.push(s);
      buckets.set(key, arr);
    }
    for (const [, arr] of buckets) {
      if (arr.length > 5) {
        const s = arr[0];
        alerts.push({
          mmsi: s.mmsi,
          shipname: s.shipname,
          level: 'MEDIUM',
          type: 'CONGESTION',
          message: `${arr.length} vessels congested (within ~0.5 nautical miles)`,
          action: 'Coordinate with nearby vessels to adjust course and avoid collision.',
          createdAt: created,
        });
        break;
      }
    }
  }

  const portName = area === 'busan' ? 'Busan' : 'Incheon';
  const wave = weather ? `${weather.waveHeight.toFixed(1)}m (${weather.riskLevel})` : 'no data';
  const summary = `Monitoring ${ships.length} vessels at ${portName} Port. Wave height ${wave}. ${alerts.length} risks detected.`;

  return { alerts, summary };
}

async function shouldEmailAlert(alert: AgentAlert): Promise<boolean> {
  try {
    const key = `alert-sent:${alert.mmsi}:${alert.type}`;
    const existing = await kv.get(key);
    if (existing) return false;
    await kv.set(key, { sentAt: nowIso() }, { ex: 300 });
    return true;
  } catch {
    return true;
  }
}

async function dispatchHighAlerts(result: AgentAnalysisResult): Promise<void> {
  for (const alert of result.alerts) {
    if (alert.level !== 'HIGH') continue;
    try {
      const ok = await shouldEmailAlert(alert);
      if (!ok) continue;
      await sendHighAlertEmail(alert);
    } catch (err) {
      console.error('[agent] dispatch alert failed', err);
    }
  }
}

export async function analyzeShips(params: {
  ships: ShipData[];
  weather: WeatherData | null;
  area: Area;
}): Promise<AgentAnalysisResult> {
  const { ships, weather, area } = params;
  const client = getClient();

  if (!client) {
    const mock = getMockAnalysis(ships, weather, area);
    await dispatchHighAlerts(mock);
    return mock;
  }

  try {
    const userPayload = JSON.stringify({ area, weather, ships: ships.slice(0, 50) });

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPayload }],
    });

    const textBlock = response.content.find((c: any) => c.type === 'text') as any;
    const raw = textBlock?.text ?? '';
    const jsonStr = extractJson(raw);
    let parsed: any;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      throw new Error('json_parse_failed');
    }

    const validated = analysisSchema.parse(parsed);
    const createdAt = nowIso();
    const result: AgentAnalysisResult = {
      alerts: validated.alerts.map((a) => ({ ...a, createdAt })) as AgentAnalysisResult['alerts'],
      summary: validated.summary,
    };

    await dispatchHighAlerts(result);
    return result;
  } catch (err) {
    console.error('[agent] analyze failed, using mock', err);
    const mock = getMockAnalysis(ships, weather, area);
    await dispatchHighAlerts(mock);
    return mock;
  }
}

function buildChatContext(context: {
  ships: ShipData[];
  weather: WeatherData | null;
  recentAlerts: AgentAlert[];
  area: Area;
}): string {
  const { ships, weather, recentAlerts, area } = context;
  const portName = area === 'busan' ? 'Busan Port' : 'Incheon Port';
  const stopped = ships.filter((s) => s.sog === 0 && s.status === 0).length;
  const wave = weather ? `${weather.waveHeight.toFixed(1)}m (${weather.riskLevel})` : 'no data';
  const alertLines = recentAlerts
    .slice(0, 5)
    .map((a) => `- [${a.level}] ${a.shipname}: ${a.message}`)
    .join('\n');

  return `Current context:
- Port: ${portName}
- Vessels monitored: ${ships.length}
- Drift-suspected vessels: ${stopped}
- Wave height / risk: ${wave}
- Recent alerts:
${alertLines || '(none)'}`;
}

async function* mockChatStream(lastUser: string): AsyncIterable<string> {
  const reply = `Hello captain. Responding to "${lastUser.slice(0, 30)}". Currently running in demo mode (ANTHROPIC_API_KEY not set). Configure the environment variable to enable live AI analysis.`;
  for (const chunk of reply.match(/.{1,12}/g) ?? [reply]) {
    yield chunk;
    await new Promise((r) => setTimeout(r, 40));
  }
}

export async function* streamChat(params: {
  messages: ChatMessage[];
  context: { ships: ShipData[]; weather: WeatherData | null; recentAlerts: AgentAlert[]; area: Area };
}): AsyncGenerator<string, void, unknown> {
  const { messages, context } = params;
  const client = getClient();
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';

  if (!client) {
    for await (const chunk of mockChatStream(lastUser)) yield chunk;
    return;
  }

  try {
    const contextBlock = buildChatContext(context);
    const claudeMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const stream = await client.messages.stream({
      model: MODEL,
      max_tokens: 1000,
      system: `${CHAT_SYSTEM_PROMPT}\n\n${contextBlock}`,
      messages: claudeMessages as any,
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta') {
        const delta: any = (event as any).delta;
        if (delta?.type === 'text_delta' && typeof delta.text === 'string') {
          yield delta.text;
        }
      }
    }
  } catch (err) {
    console.error('[agent] streamChat failed, using mock', err);
    for await (const chunk of mockChatStream(lastUser)) yield chunk;
  }
}
