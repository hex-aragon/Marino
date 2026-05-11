'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Send, Loader2, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Area, ChatMessage, ShipData, WeatherData } from '@/types';

const ACTION_CHIPS = ['날씨 확인', '연료 예약', '마켓 열기', '항로 분석', '선박 상태'];

const RISK_LABEL: Record<NonNullable<WeatherData['riskLevel']>, string> = {
  SAFE: '항해 안전',
  CAUTION: '주의 필요',
  DANGER: '위험 수준',
};

interface AgentChatProps {
  area: Area;
  ships: ShipData[];
  weather: WeatherData | null;
}

function nowIso() {
  return new Date().toISOString();
}

function buildGreeting(area: Area, ships: ShipData[], weather: WeatherData | null): string {
  const portName = area === 'busan' ? '부산항' : '인천항';
  const count = ships.length;
  const wave = weather?.waveHeight?.toFixed(1) ?? '-';
  const status = weather ? RISK_LABEL[weather.riskLevel] : '데이터 수집 중';
  return `안녕하세요 선장님. 현재 ${portName} 입항 예정 선박 ${count}척을 모니터링 중입니다. 파고 ${wave}m로 ${status}입니다.`;
}

export default function AgentChat({ area, ships, weather }: AgentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    if (ships.length === 0 && !weather) return;
    initialized.current = true;
    setMessages([
      {
        role: 'assistant',
        content: buildGreeting(area, ships, weather),
        createdAt: nowIso(),
      },
    ]);
  }, [area, ships, weather]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    const userMsg: ChatMessage = { role: 'user', content: trimmed, createdAt: nowIso() };
    const assistantMsg: ChatMessage = { role: 'assistant', content: '', createdAt: nowIso() };

    const next = [...messages, userMsg, assistantMsg];
    setMessages(next);
    setInput('');
    setIsStreaming(true);

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.slice(0, -1),
          area,
        }),
      });

      if (!res.ok || !res.body) {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: '[오류] 에이전트 응답을 가져오지 못했습니다.',
          };
          return updated;
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: accumulated,
          };
          return updated;
        });
      }
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: '[오류] 네트워크 문제로 응답을 받지 못했습니다.',
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  }

  const lastAssistantIndex = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') return i;
    }
    return -1;
  }, [messages]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <div className="flex h-full flex-col rounded-xl border bg-card/40 backdrop-blur">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            에이전트 컨텍스트를 불러오는 중...
          </div>
        )}

        {messages.map((m, i) => {
          const isUser = m.role === 'user';
          const isLastAssistant = !isUser && i === lastAssistantIndex;
          return (
            <div key={i} className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}>
              {!isUser && (
                <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div className={cn('flex max-w-[80%] flex-col gap-2', isUser && 'items-end')}>
                <div
                  className={cn(
                    'rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words',
                    isUser
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-secondary text-secondary-foreground rounded-bl-md',
                  )}
                >
                  {m.content || (
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" /> 생각 중...
                    </span>
                  )}
                </div>
                {isLastAssistant && !isStreaming && m.content && (
                  <div className="flex flex-wrap gap-1.5">
                    {ACTION_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        onClick={() => send(chip)}
                        className="rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs text-muted-foreground hover:border-primary/60 hover:text-primary transition-colors"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {isUser && (
                <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/80 text-primary-foreground">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="border-t bg-background/60 p-3">
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="에이전트에게 질문하세요..."
            disabled={isStreaming}
            className="flex-1"
          />
          <Button type="submit" disabled={isStreaming || !input.trim()} size="icon">
            {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
}
