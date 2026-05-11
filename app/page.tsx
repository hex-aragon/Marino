'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Bot, Satellite, Zap, Check, Ship, Users, Anchor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const FEATURES = [
  {
    icon: Satellite,
    title: '실시간 위성 AIS 모니터링',
    desc: '전 세계 10만+ 척의 선박을 24시간 자동 추적합니다. 부산·인천을 시작으로 글로벌 항만으로 확장됩니다.',
  },
  {
    icon: Bot,
    title: 'AI 이상 감지 에이전트',
    desc: 'Claude AI가 표류, 기상 위험, 항로 이탈, 밀집을 실시간 감지하고 한국어 알림을 자동 발송합니다.',
  },
  {
    icon: Zap,
    title: 'Solana 즉시 결제 + x402',
    desc: '에이전트가 새벽에도 x402 프로토콜로 USDC를 자율 결제합니다. 항구 어디서나 3초 안에 정산.',
  },
];

const PLANS = [
  {
    name: 'Free',
    price: 0,
    period: '',
    blurb: '항만 모니터링 시작',
    features: ['기본 선박 지도', '일 5회 알림', '부산·인천 커버'],
    cta: '무료 시작',
    href: '/dashboard',
    highlight: false,
  },
  {
    name: 'Basic',
    price: 9,
    period: '/월',
    blurb: '선원·소형 선사용',
    features: ['무제한 알림', '이메일 자동 발송', '마켓 무수수료', '항로 이탈 분석'],
    cta: '구독',
    href: '/dashboard',
    highlight: false,
  },
  {
    name: 'Premium',
    price: 29,
    period: '/월',
    blurb: '선사·운항관리자용',
    features: ['x402 유료 데이터 무제한', '72시간 정밀 예보', '우선 알림 처리', '에이전트 자율 결제'],
    cta: '프리미엄 시작',
    href: '/dashboard',
    highlight: true,
  },
];

const STATS = [
  { icon: Ship, label: '선박', value: 100_000, suffix: '+' },
  { icon: Users, label: '선원', value: 1_890_000, suffix: '+' },
  { icon: Anchor, label: '항구', value: 800, suffix: '+' },
];

function useCountUp(target: number, durationMs = 1600) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.floor(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}

function StatNumber({ value, suffix }: { value: number; suffix: string }) {
  const animated = useCountUp(value);
  return (
    <span>
      {animated.toLocaleString('en-US')}
      <span className="text-primary">{suffix}</span>
    </span>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <section
        className="relative flex min-h-screen items-center justify-center px-4"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 20% 30%, rgba(0,212,170,0.18), transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(56,189,248,0.12), transparent 50%), linear-gradient(180deg, #050d1a 0%, #0a1628 60%, #050d1a 100%)',
        }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
        </div>

        <div className="pointer-events-none absolute inset-0 select-none text-3xl opacity-20">
          <span className="absolute left-[12%] top-[22%] animate-pulse">🚢</span>
          <span className="absolute right-[18%] top-[34%] animate-pulse [animation-delay:600ms]">⛴️</span>
          <span className="absolute left-[28%] bottom-[20%] animate-pulse [animation-delay:1200ms]">🛥️</span>
          <span className="absolute right-[22%] bottom-[28%] animate-pulse [animation-delay:1800ms]">⚓</span>
        </div>

        <div className="relative z-10 flex max-w-4xl flex-col items-center text-center">
          <Badge variant="outline" className="mb-6 border-primary/40 bg-primary/5 text-primary">
            🚀 Maritime Hackathon 2026 · Solana + Claude AI
          </Badge>

          <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            전 세계 어느 <span className="text-primary">항구</span>에서도
          </h1>

          <p className="mt-6 max-w-2xl whitespace-pre-line text-lg text-muted-foreground md:text-xl">
            {`AI 에이전트가 24시간 선박을 감시하고\nSolana USDC로 3초 안에 결제합니다`}
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/dashboard">
              <Button size="lg" className="h-12 gap-2 px-8 text-base font-semibold">
                대시보드 보기 <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/agent">
              <Button size="lg" variant="outline" className="h-12 gap-2 px-8 text-base font-semibold">
                <Bot className="h-4 w-4" /> 에이전트 채팅
              </Button>
            </Link>
          </div>

          <p className="mt-8 text-xs text-muted-foreground">
            부산항 · 인천항 실시간 모니터링 가능
          </p>
        </div>
      </section>

      <section className="px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <Badge variant="secondary" className="mb-3">핵심 기능</Badge>
            <h2 className="text-3xl font-bold md:text-4xl">선원과 선사 모두를 위한 플랫폼</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {FEATURES.map((f) => (
              <Card
                key={f.title}
                className="group relative overflow-hidden border-border/60 bg-card/60 transition-all hover:border-primary/40 hover:bg-card"
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 transition-all group-hover:bg-primary/15" />
                <CardHeader>
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/15 text-primary">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="mt-4 text-xl">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-24" style={{ background: 'linear-gradient(180deg, #050d1a, #0a1628)' }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <Badge variant="secondary" className="mb-3">가격</Badge>
            <h2 className="text-3xl font-bold md:text-4xl">필요한 만큼만 결제하세요</h2>
            <p className="mt-3 text-muted-foreground">전부 Solana USDC로 결제 · 언제든 해지 가능</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {PLANS.map((p) => (
              <Card
                key={p.name}
                className={cn(
                  'relative flex flex-col transition-all',
                  p.highlight
                    ? 'border-primary bg-card shadow-[0_0_40px_-12px_rgba(0,212,170,0.4)] md:scale-105'
                    : 'border-border/60 bg-card/60 hover:border-primary/40',
                )}
              >
                {p.highlight && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">추천</Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-base font-medium text-muted-foreground">{p.name}</CardTitle>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-5xl font-bold">{p.price}</span>
                    <span className="text-sm font-medium text-muted-foreground">USDC{p.period}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{p.blurb}</p>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <ul className="flex-1 space-y-2">
                    {p.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={p.href} className="mt-6">
                    <Button
                      variant={p.highlight ? 'default' : 'outline'}
                      className="w-full"
                      size="lg"
                    >
                      {p.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <Badge variant="secondary" className="mb-3">잠재 시장</Badge>
            <h2 className="text-3xl font-bold md:text-4xl">글로벌 해양 시장 규모</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {STATS.map((s) => (
              <Card key={s.label} className="border-border/60 bg-card/60 text-center">
                <CardContent className="pt-8 pb-8">
                  <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-primary/15 text-primary">
                    <s.icon className="h-6 w-6" />
                  </div>
                  <div className="text-5xl font-bold tracking-tight">
                    <StatNumber value={s.value} suffix={s.suffix} />
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t bg-background/80 py-8 text-center text-sm text-muted-foreground">
        <p>SeaWatch © 2026 | Powered by Solana + Claude AI</p>
        <div className="mt-2 flex items-center justify-center gap-4 text-xs">
          <Link href="/dashboard" className="hover:text-foreground">대시보드</Link>
          <span className="text-border">·</span>
          <Link href="/marketplace" className="hover:text-foreground">마켓플레이스</Link>
          <span className="text-border">·</span>
          <Link href="/agent" className="hover:text-foreground">에이전트</Link>
          <span className="text-border">·</span>
          <Link href="/satellite" className="hover:text-foreground">위성</Link>
        </div>
      </footer>
    </div>
  );
}
