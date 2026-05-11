'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Bot, Satellite, Zap, Check, Ship, Users, Anchor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConnectWalletButton } from '@/components/ConnectWalletButton';
import { cn } from '@/lib/utils';

const FEATURES = [
  {
    icon: Satellite,
    title: '🛰️ Real-time Satellite AIS Monitoring',
    desc: 'Auto-track 100,000+ vessels worldwide, 24/7. Starting with Busan and Incheon, expanding to global ports.',
  },
  {
    icon: Bot,
    title: '🤖 AI Anomaly Detection Agent',
    desc: 'Claude AI detects drift, weather hazards, route deviations, and congestion in real time, and sends alerts automatically.',
  },
  {
    icon: Zap,
    title: '⚡ Instant Solana Payments + x402',
    desc: 'Agents settle USDC autonomously via the x402 protocol — even overnight. Anywhere in the world, settled in 3 seconds.',
  },
];

const PLANS = [
  {
    name: 'Free',
    price: 0,
    period: '',
    blurb: 'Start monitoring ports',
    features: ['Basic vessel map', '5 alerts per day', 'Busan & Incheon coverage'],
    cta: 'Start Free',
    href: '/dashboard',
    highlight: false,
  },
  {
    name: 'Basic',
    price: 9,
    period: '/mo',
    blurb: 'For sailors and small operators',
    features: ['Unlimited alerts', 'Automated email alerts', 'Zero marketplace fees', 'Route deviation analysis'],
    cta: 'Subscribe',
    href: '/dashboard',
    highlight: false,
  },
  {
    name: 'Premium',
    price: 29,
    period: '/mo',
    blurb: 'For shipping operators & fleet managers',
    features: ['Unlimited x402 paid data', '72-hour precision forecast', 'Priority alert handling', 'Autonomous agent payments'],
    cta: 'Start Premium',
    href: '/dashboard',
    highlight: true,
  },
];

const STATS = [
  { icon: Ship, label: 'Vessels', value: 100_000, suffix: '+' },
  { icon: Users, label: 'Sailors', value: 1_890_000, suffix: '+' },
  { icon: Anchor, label: 'Ports', value: 800, suffix: '+' },
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
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2 text-base font-bold tracking-tight">
          <span className="text-xl">🚢</span>
          <span>SeaWatch</span>
        </Link>
        <ConnectWalletButton />
      </header>

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
            From any <span className="text-primary">port</span> in the world
          </h1>

          <p className="mt-6 max-w-2xl whitespace-pre-line text-lg text-muted-foreground md:text-xl">
            {`AI agents monitor vessels 24/7\nand settle in USDC on Solana within 3 seconds`}
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/dashboard">
              <Button size="lg" className="h-12 gap-2 px-8 text-base font-semibold">
                View Dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/agent">
              <Button size="lg" variant="outline" className="h-12 gap-2 px-8 text-base font-semibold">
                <Bot className="h-4 w-4" /> Chat with Agent
              </Button>
            </Link>
          </div>

          <p className="mt-8 text-xs text-muted-foreground">
            Real-time monitoring available for Busan Port & Incheon Port
          </p>
        </div>
      </section>

      <section className="px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <Badge variant="secondary" className="mb-3">Core Features</Badge>
            <h2 className="text-3xl font-bold md:text-4xl">A platform for both sailors and operators</h2>
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
            <Badge variant="secondary" className="mb-3">Pricing</Badge>
            <h2 className="text-3xl font-bold md:text-4xl">Pay only for what you need</h2>
            <p className="mt-3 text-muted-foreground">All payments in Solana USDC · Cancel anytime</p>
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
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Recommended</Badge>
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
            <Badge variant="secondary" className="mb-3">Market Opportunity</Badge>
            <h2 className="text-3xl font-bold md:text-4xl">Global maritime market size</h2>
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
          <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
          <span className="text-border">·</span>
          <Link href="/marketplace" className="hover:text-foreground">Marketplace</Link>
          <span className="text-border">·</span>
          <Link href="/agent" className="hover:text-foreground">Agent</Link>
          <span className="text-border">·</span>
          <Link href="/satellite" className="hover:text-foreground">Satellite</Link>
        </div>
      </footer>
    </div>
  );
}
