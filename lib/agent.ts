import Anthropic from '@anthropic-ai/sdk';
import { kv } from '@vercel/kv';
import { z } from 'zod';
import type { AgentAlert, AgentAnalysisResult, Area, ChatMessage, ShipData, WeatherData } from '@/types';
import { sendHighAlertEmail } from '@/lib/alerts';

const MODEL = 'claude-sonnet-4-20250514';

const SYSTEM_PROMPT = `당신은 해양 안전 전문 AI 에이전트입니다. 선박 AIS 데이터와 기상 데이터를 분석해서 위험 상황을 감지하고 한국어로 알림을 생성합니다.

감지 규칙:
1. SOG=0이고 status=0(항해중) → 표류 의심 (DRIFT, HIGH)
2. 파고 > 2.5m 해역 진입 → 기상 위험 (WEATHER, HIGH)
3. COG가 항로에서 15도 이상 이탈 → 항로 이탈 (ROUTE, MEDIUM)
4. 반경 0.5해리 내 3척 이상 → 밀집 위험 (CONGESTION, MEDIUM)

JSON ONLY (no markdown, no prose):
{ "alerts": [{ "mmsi", "shipname", "level": "LOW|MEDIUM|HIGH", "type": "DRIFT|WEATHER|ROUTE|CONGESTION", "message": "한국어 50자 이내", "action": "권장 조치 한국어" }], "summary": "전체 상황 요약 한국어 100자 이내" }`;

const CHAT_SYSTEM_PROMPT = `당신은 SeaWatch의 해양 AI 에이전트입니다. 한국어로 친절하고 간결하게 답합니다.

능력:
- 현재 선박 상태 조회 및 요약
- 기상 정보 요약(무료) / 72시간 상세 예보(x402 2 USDC)
- 마켓 상품 검색·추천
- 연료·선용품 자동 예약 (USDC 에스크로)
- 항로 이탈 상세 분석 (x402 5 USDC)
- 입항 수수료 계산

답변은 2~5문장으로 짧게, 필요 시 줄바꿈으로 구조화합니다.`;

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
        message: `${s.shipname} 표류 의심 (속도 0, 항해 중)`,
        action: '즉시 선장과 무선 교신을 시도하세요.',
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
      message: `${area === 'busan' ? '부산' : '인천'} 해역 파고 ${weather.waveHeight.toFixed(1)}m 위험`,
      action: '인근 선박은 항로 우회 또는 입항 대기를 검토하세요.',
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
          message: `${arr.length}척 밀집 (반경 약 0.5해리)`,
          action: '주변 선박과 통신하여 충돌 회피 항로를 조정하세요.',
          createdAt: created,
        });
        break;
      }
    }
  }

  const portName = area === 'busan' ? '부산' : '인천';
  const wave = weather ? `${weather.waveHeight.toFixed(1)}m (${weather.riskLevel})` : '정보 없음';
  const summary = `${portName}항 ${ships.length}척 모니터링 중. 파고 ${wave}. 감지된 위험 ${alerts.length}건.`;

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
  const portName = area === 'busan' ? '부산항' : '인천항';
  const stopped = ships.filter((s) => s.sog === 0 && s.status === 0).length;
  const wave = weather ? `${weather.waveHeight.toFixed(1)}m (${weather.riskLevel})` : '정보 없음';
  const alertLines = recentAlerts
    .slice(0, 5)
    .map((a) => `- [${a.level}] ${a.shipname}: ${a.message}`)
    .join('\n');

  return `현재 컨텍스트:
- 항구: ${portName}
- 모니터링 선박 수: ${ships.length}
- 표류 의심 선박: ${stopped}
- 파고/위험도: ${wave}
- 최근 알림:
${alertLines || '(없음)'}`;
}

async function* mockChatStream(lastUser: string): AsyncIterable<string> {
  const reply = `안녕하세요 선장님. "${lastUser.slice(0, 30)}"에 대한 응답입니다. 현재 데모 모드(ANTHROPIC_API_KEY 미설정)로 실행 중입니다. 환경변수를 설정하면 실시간 AI 분석이 가능합니다.`;
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
