'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Send, Loader2, Bot, User, ShoppingBag, Zap, Search, CheckCircle2, ExternalLink, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { buildUsdcTransferTx } from '@/lib/solana';
import { isPurchaseIntent, type NegEvent } from '@/lib/agentNegotiation';
import type { Area, ShipData, WeatherData } from '@/types';

const ACTION_CHIPS = [
  'Check weather',
  '라면 박스 12 USDC 안에 구해줘',
  '도시락 주문해줘',
  'GPS 케이블 교체 예약해줘',
  'Vessel status',
];

const RISK_LABEL: Record<NonNullable<WeatherData['riskLevel']>, string> = {
  SAFE: 'safe for sailing',
  CAUTION: 'caution advised',
  DANGER: 'dangerous conditions',
};

interface AgentChatProps {
  area: Area;
  ships: ShipData[];
  weather: WeatherData | null;
}

type ChatItem =
  | { kind: 'user'; content: string; createdAt: string }
  | { kind: 'assistant'; content: string; createdAt: string; streaming?: boolean }
  | { kind: 'nego_buyer'; content: string; createdAt: string }
  | { kind: 'nego_seller'; content: string; sellerName: string; createdAt: string }
  | { kind: 'nego_event'; event: NegEvent; createdAt: string };

function nowIso() {
  return new Date().toISOString();
}

function buildGreeting(area: Area, ships: ShipData[], weather: WeatherData | null): string {
  const portName = area === 'busan' ? 'Busan Port' : 'Incheon Port';
  const count = ships.length;
  const wave = weather?.waveHeight?.toFixed(1) ?? '-';
  const status = weather ? RISK_LABEL[weather.riskLevel] : 'collecting data';
  return `안녕하세요 선장님. 현재 ${portName} 입항 예정 선박 ${count}척을 모니터링 중입니다. 파고 ${wave}m — ${status}.\n\n구매가 필요하면 "라면 박스 12 USDC 안에 구해줘" 처럼 말씀하세요. 구매 에이전트와 판매 에이전트가 협상 후 x402로 결제합니다.`;
}

export default function AgentChat({ area, ships, weather }: AgentChatProps) {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [items, setItems] = useState<ChatItem[]>([]);
  const [input, setInput] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const realTxRef = useRef<string | null>(null);
  const currentPriceRef = useRef<number>(0);

  useEffect(() => {
    if (initialized.current) return;
    if (ships.length === 0 && !weather) return;
    initialized.current = true;
    setItems([
      { kind: 'assistant', content: buildGreeting(area, ships, weather), createdAt: nowIso() },
    ]);
  }, [area, ships, weather]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [items]);

  async function runNegotiation(userText: string) {
    const walletAddress = wallet.publicKey?.toBase58();
    const res = await fetch('/api/agent/negotiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userText, area, walletAddress }),
    });

    if (!res.ok || !res.body) {
      setItems((p) => [
        ...p,
        { kind: 'assistant', content: '[Error] 협상을 시작할 수 없습니다.', createdAt: nowIso() },
      ]);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop() || '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          const ev = JSON.parse(trimmed) as NegEvent;
          
          if (ev.type === 'x402_init') {
            currentPriceRef.current = ev.priceUsdc;
          }
          
          if (ev.type === 'x402_paying' && wallet.publicKey) {
            appendEvent({ ...ev, txHash: 'waiting for approval...' });
            try {
              const escrowWallet = process.env.NEXT_PUBLIC_MERCHANT_WALLET || '11111111111111111111111111111111';
              const tx = await buildUsdcTransferTx(wallet.publicKey.toBase58(), escrowWallet, currentPriceRef.current);
              const signature = await wallet.sendTransaction(tx, connection);
              realTxRef.current = signature;
              // replace the paying event visually with the real one
              setItems(p => {
                const arr = [...p];
                arr[arr.length - 1] = { kind: 'nego_event', event: { ...ev, txHash: signature }, createdAt: nowIso() };
                return arr;
              });
              await connection.confirmTransaction(signature, 'confirmed');
            } catch (e: any) {
              console.error(e);
              realTxRef.current = 'mock_neg_fallback_' + Date.now();
            }
            continue;
          }
          
          if (ev.type === 'x402_settled' && realTxRef.current) {
            ev.txHash = realTxRef.current;
            realTxRef.current = null;
          }

          appendEvent(ev);
        } catch {}
      }
    }
    if (buf.trim()) {
      try {
        const ev = JSON.parse(buf) as NegEvent;
        appendEvent(ev);
      } catch {}
    }
  }

  function appendEvent(ev: NegEvent) {
    const ts = nowIso();
    if (ev.type === 'buyer_intent' || ev.type === 'buyer_negotiate' || ev.type === 'buyer_accept') {
      setItems((p) => [...p, { kind: 'nego_buyer', content: ev.content, createdAt: ts }]);
    } else if (ev.type === 'seller_offer') {
      setItems((p) => [
        ...p,
        { kind: 'nego_seller', content: ev.content, sellerName: ev.item.sellerName, createdAt: ts },
      ]);
    } else if (ev.type === 'seller_decision') {
      const offer = ev as Extract<NegEvent, { type: 'seller_decision' }>;
      setItems((p) => [
        ...p,
        { kind: 'nego_seller', content: offer.content, sellerName: 'Seller', createdAt: ts },
      ]);
    } else if (ev.type !== 'done') {
      setItems((p) => [...p, { kind: 'nego_event', event: ev, createdAt: ts }]);
    }
  }

  async function runChat(userText: string) {
    const next = [
      ...items.filter((i) => i.kind === 'user' || i.kind === 'assistant'),
      { kind: 'user' as const, content: userText, createdAt: nowIso() },
    ];

    setItems((p) => [
      ...p,
      { kind: 'assistant', content: '', createdAt: nowIso(), streaming: true },
    ]);

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.kind, content: m.content })),
          area,
        }),
      });

      if (!res.ok || !res.body) {
        setItems((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.kind === 'assistant') {
            updated[updated.length - 1] = { ...last, content: '[Error] 응답 실패', streaming: false };
          }
          return updated;
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setItems((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.kind === 'assistant') {
            updated[updated.length - 1] = { ...last, content: acc };
          }
          return updated;
        });
      }
      setItems((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last.kind === 'assistant') {
          updated[updated.length - 1] = { ...last, streaming: false };
        }
        return updated;
      });
    } catch {
      setItems((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last.kind === 'assistant') {
          updated[updated.length - 1] = { ...last, content: '[Error] 네트워크 오류', streaming: false };
        }
        return updated;
      });
    }
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isBusy) return;

    setItems((p) => [...p, { kind: 'user', content: trimmed, createdAt: nowIso() }]);
    setInput('');
    setIsBusy(true);

    try {
      if (isPurchaseIntent(trimmed)) {
        await runNegotiation(trimmed);
      } else {
        await runChat(trimmed);
      }
    } finally {
      setIsBusy(false);
    }
  }

  const lastChipsIndex = useMemo(() => {
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      if (it.kind === 'assistant' && !it.streaming) return i;
    }
    return -1;
  }, [items]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <div className="flex h-full flex-col rounded-xl border bg-card/40 backdrop-blur">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-3">
        {items.length === 0 && (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            Loading agent context...
          </div>
        )}

        {items.map((it, i) => (
          <Row key={i} item={it} showChips={i === lastChipsIndex} onChip={send} isBusy={isBusy} />
        ))}

        {isBusy && items[items.length - 1]?.kind !== 'assistant' && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> Agents are negotiating...
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t bg-background/60 p-3">
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='요구사항을 말하세요. 예: "라면 박스 12 USDC 안에 구해줘"'
            disabled={isBusy}
            className="flex-1"
          />
          <Button type="submit" disabled={isBusy || !input.trim()} size="icon">
            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Row({
  item,
  showChips,
  onChip,
  isBusy,
}: {
  item: ChatItem;
  showChips: boolean;
  onChip: (s: string) => void;
  isBusy: boolean;
}) {
  if (item.kind === 'user') {
    return (
      <div className="flex justify-end gap-3">
        <div className="flex max-w-[80%] flex-col items-end gap-2">
          <div className="rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground whitespace-pre-wrap break-words">
            {item.content}
          </div>
        </div>
        <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/80 text-primary-foreground">
          <User className="h-4 w-4" />
        </div>
      </div>
    );
  }

  if (item.kind === 'assistant') {
    return (
      <div className="flex justify-start gap-3">
        <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
          <Bot className="h-4 w-4" />
        </div>
        <div className="flex max-w-[80%] flex-col gap-2">
          <div className="rounded-2xl rounded-bl-md bg-secondary px-4 py-2.5 text-sm text-secondary-foreground whitespace-pre-wrap break-words">
            {item.content || (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> Thinking...
              </span>
            )}
          </div>
          {showChips && !isBusy && (
            <div className="flex flex-wrap gap-1.5">
              {ACTION_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => onChip(chip)}
                  className="rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs text-muted-foreground hover:border-primary/60 hover:text-primary transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (item.kind === 'nego_buyer') {
    return (
      <div className="flex justify-start gap-3">
        <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cyan-500/15 text-cyan-400">
          <Bot className="h-4 w-4" />
        </div>
        <div className="flex max-w-[80%] flex-col gap-1">
          <div className="text-[10px] font-medium uppercase tracking-wider text-cyan-400">Buyer Agent</div>
          <div className="rounded-2xl rounded-bl-md border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 text-sm text-foreground whitespace-pre-wrap break-words">
            {item.content}
          </div>
        </div>
      </div>
    );
  }

  if (item.kind === 'nego_seller') {
    return (
      <div className="flex justify-start gap-3">
        <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-500/15 text-amber-400">
          <ShoppingBag className="h-4 w-4" />
        </div>
        <div className="flex max-w-[80%] flex-col gap-1">
          <div className="text-[10px] font-medium uppercase tracking-wider text-amber-400">
            Seller Agent · {item.sellerName}
          </div>
          <div className="rounded-2xl rounded-bl-md border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm text-foreground whitespace-pre-wrap break-words">
            {item.content}
          </div>
        </div>
      </div>
    );
  }

  if (item.kind === 'nego_event') {
    return <EventRow event={item.event} />;
  }

  return null;
}

function EventRow({ event }: { event: NegEvent }) {
  if (event.type === 'market_search') {
    return (
      <SystemPill icon={<Search className="h-3 w-3" />} tone="muted">
        Marketplace search: "{event.query}" → {event.matches} match{event.matches === 1 ? '' : 'es'}
      </SystemPill>
    );
  }

  if (event.type === 'x402_init') {
    return (
      <SystemPill icon={<Zap className="h-3 w-3" />} tone="primary">
        x402 init · {event.endpoint} · {event.priceUsdc} USDC → {short(event.recipient)}
      </SystemPill>
    );
  }

  if (event.type === 'x402_402') {
    return (
      <div className="mx-auto max-w-[90%] rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 font-mono text-[11px] leading-relaxed">
        <div className="mb-1 flex items-center gap-1.5 text-amber-300">
          <Zap className="h-3 w-3" /> 402 Payment Required
        </div>
        {Object.entries(event.headers).map(([k, v]) => (
          <div key={k} className="text-muted-foreground">
            <span className="text-violet-300">{k}:</span> {v}
          </div>
        ))}
      </div>
    );
  }

  if (event.type === 'x402_paying') {
    return (
      <div className="mx-auto max-w-[90%] rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-[11px]">
        <div className="mb-0.5 flex items-center gap-1.5 text-primary">
          <Loader2 className="h-3 w-3 animate-spin" /> Buyer wallet signing USDC transaction…
        </div>
        <div className="font-mono text-[10px] text-muted-foreground">
          payer={event.payer} · tx={event.txHash.slice(0, 18)}…
        </div>
      </div>
    );
  }

  if (event.type === 'x402_settled') {
    return (
      <div className="mx-auto w-full max-w-md rounded-xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 p-3">
        <div className="mb-2 flex items-center gap-1.5 text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-sm font-semibold">Payment settled · Escrow locked</span>
        </div>
        <div className="space-y-1 text-[11px]">
          <RowKV k="Item" v={event.itemTitle} />
          <RowKV k="Amount" v={`${event.amount} USDC`} highlight />
          <RowKV k="Seller" v={`${event.sellerName} · ${short(event.sellerWallet)}`} />
          <RowKV k="ETA" v={formatEta(event.etaMin)} />
          <RowKV
            k="Tx"
            v={
              <a
                href={`https://explorer.solana.com/tx/${event.txHash}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-primary hover:underline"
              >
                {event.txHash.slice(0, 22)}… <ExternalLink className="h-3 w-3" />
              </a>
            }
          />
        </div>
        <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
          <Receipt className="h-3 w-3" /> 수령 확인 후 에스크로가 판매자에게 전송됩니다 (수수료 1%)
        </div>
      </div>
    );
  }

  if (event.type === 'error') {
    return (
      <SystemPill icon={<Zap className="h-3 w-3" />} tone="danger">
        {event.message}
      </SystemPill>
    );
  }

  return null;
}

function SystemPill({
  icon,
  children,
  tone,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  tone: 'muted' | 'primary' | 'danger';
}) {
  return (
    <div className="flex justify-center">
      <Badge
        variant="outline"
        className={cn(
          'gap-1.5 px-2.5 py-1 text-[11px] font-normal',
          tone === 'primary' && 'border-primary/40 bg-primary/5 text-primary',
          tone === 'danger' && 'border-red-500/40 bg-red-500/10 text-red-300',
          tone === 'muted' && 'text-muted-foreground',
        )}
      >
        {icon}
        {children}
      </Badge>
    </div>
  );
}

function RowKV({ k, v, highlight }: { k: string; v: React.ReactNode; highlight?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-muted-foreground">{k}</span>
      <span className={cn('text-right', highlight && 'font-semibold text-emerald-200')}>{v}</span>
    </div>
  );
}

function short(w: string): string {
  if (!w) return '';
  return `${w.slice(0, 4)}…${w.slice(-4)}`;
}

function formatEta(mins: number): string {
  if (mins <= 1) return '즉시';
  if (mins < 60) return `${mins}분`;
  if (mins < 1440) return `${Math.round(mins / 60)}시간`;
  return `${Math.round(mins / 1440)}일`;
}
