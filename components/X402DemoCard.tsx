'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Loader2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type Phase = 'idle' | 'unpaid' | 'paying' | 'paid' | 'error';

interface AttemptLog {
  step: 'unpaid' | 'paid';
  status: number;
  headers: Record<string, string>;
  body: any;
  durationMs: number;
}

export default function X402DemoCard() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [logs, setLogs] = useState<AttemptLog[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const runDemo = async () => {
    setPhase('unpaid');
    setLogs([]);
    setErrorMsg(null);

    try {
      const t1 = performance.now();
      const r1 = await fetch('/api/weather/premium?area=busan', { cache: 'no-store' });
      const body1 = await r1.json().catch(() => ({}));
      const headers1: Record<string, string> = {};
      r1.headers.forEach((v, k) => {
        if (k.toLowerCase().includes('payment') || k === 'content-type') headers1[k] = v;
      });
      const dur1 = Math.round(performance.now() - t1);

      setLogs((p) => [
        ...p,
        { step: 'unpaid', status: r1.status, headers: headers1, body: body1, durationMs: dur1 },
      ]);

      if (r1.status !== 402) {
        setErrorMsg(`Expected 402 but got ${r1.status}`);
        setPhase('error');
        return;
      }

      setPhase('paying');
      await new Promise((r) => setTimeout(r, 900));

      const fakeTx = `mock_demo_${Date.now()}`;
      const t2 = performance.now();
      const r2 = await fetch('/api/weather/premium?area=busan', {
        cache: 'no-store',
        headers: { 'X-Payment-Tx': fakeTx },
      });
      const body2 = await r2.json().catch(() => ({}));
      const headers2: Record<string, string> = { 'X-Payment-Tx (sent)': fakeTx };
      const dur2 = Math.round(performance.now() - t2);

      setLogs((p) => [
        ...p,
        { step: 'paid', status: r2.status, headers: headers2, body: body2, durationMs: dur2 },
      ]);

      setPhase(r2.status === 200 ? 'paid' : 'error');
      if (r2.status !== 200) setErrorMsg(`Expected 200 but got ${r2.status}`);
    } catch (e: any) {
      setErrorMsg(e?.message || 'request failed');
      setPhase('error');
    }
  };

  const reset = () => {
    setPhase('idle');
    setLogs([]);
    setErrorMsg(null);
  };

  const busy = phase === 'unpaid' || phase === 'paying';

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-background to-cyan-500/5 p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <div>
            <div className="text-sm font-semibold">x402 Live Demo</div>
            <div className="text-[10px] text-muted-foreground">
              HTTP 402 → USDC autopay → retry · 2 USDC per call
            </div>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] font-mono">
          /api/weather/premium
        </Badge>
      </div>

      <div className="mb-3 flex flex-col gap-1.5 text-[11px]">
        <StepRow
          n={1}
          label="Unauthenticated request"
          done={logs.length >= 1}
          active={phase === 'unpaid'}
          ok={logs[0]?.status === 402}
        />
        <StepRow
          n={2}
          label="Agent auto-pays via Solana"
          done={phase === 'paid' || (logs.length >= 2 && phase !== 'paying')}
          active={phase === 'paying'}
          ok={phase === 'paid'}
        />
        <StepRow
          n={3}
          label="Retry with X-Payment-Tx header"
          done={logs.length >= 2}
          active={phase === 'paying'}
          ok={logs[1]?.status === 200}
        />
      </div>

      <div className="mb-3 max-h-56 overflow-auto rounded-md border border-border bg-black/40 p-2 font-mono text-[10px] leading-relaxed">
        {logs.length === 0 && phase === 'idle' && (
          <div className="text-muted-foreground">Click "Run x402 demo" to start →</div>
        )}
        {logs.map((log, i) => (
          <div key={i} className="mb-2 last:mb-0">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">{log.step === 'unpaid' ? '→ GET' : '→ GET (paid)'}</span>
              <span className="text-cyan-300">/api/weather/premium</span>
              <span className="ml-auto text-muted-foreground">{log.durationMs}ms</span>
            </div>
            <div
              className={cn(
                'flex items-center gap-1',
                log.status === 402 && 'text-amber-300',
                log.status === 200 && 'text-emerald-300',
                ![200, 402].includes(log.status) && 'text-red-400',
              )}
            >
              ← {log.status} {log.status === 402 ? 'Payment Required' : log.status === 200 ? 'OK' : 'Error'}
            </div>
            {Object.entries(log.headers).length > 0 && (
              <div className="ml-2 mt-0.5 text-muted-foreground">
                {Object.entries(log.headers).map(([k, v]) => (
                  <div key={k}>
                    <span className="text-violet-300">{k}:</span> {v}
                  </div>
                ))}
              </div>
            )}
            {log.step === 'paid' && log.body && log.status === 200 && (
              <div className="ml-2 mt-0.5 text-emerald-200/80">
                ✓ Received forecast · waveHeight={log.body?.waveHeight?.toFixed?.(1) ?? '?'}m
                {Array.isArray(log.body?.hourly) ? `, ${log.body.hourly.length}h hourly` : ''}
              </div>
            )}
          </div>
        ))}
        {errorMsg && <div className="mt-1 text-red-400">⚠ {errorMsg}</div>}
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={runDemo} disabled={busy} className="flex-1">
          {busy ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {phase === 'unpaid' ? 'Requesting...' : 'Paying USDC...'}
            </>
          ) : phase === 'paid' ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" /> Run again
            </>
          ) : (
            <>
              <ArrowRight className="h-3.5 w-3.5" /> Run x402 demo
            </>
          )}
        </Button>
        {logs.length > 0 && (
          <Button size="sm" variant="ghost" onClick={reset}>
            Reset
          </Button>
        )}
      </div>
    </Card>
  );
}

function StepRow({
  n,
  label,
  done,
  active,
  ok,
}: {
  n: number;
  label: string;
  done: boolean;
  active: boolean;
  ok?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded px-1.5 py-0.5',
        active && 'bg-primary/10',
        done && !active && (ok ? 'opacity-80' : 'opacity-50'),
      )}
    >
      <div
        className={cn(
          'grid h-4 w-4 place-items-center rounded-full text-[9px] font-bold',
          active && 'bg-primary text-primary-foreground',
          done && !active && ok && 'bg-emerald-500 text-white',
          done && !active && !ok && 'bg-red-500 text-white',
          !done && !active && 'bg-muted text-muted-foreground',
        )}
      >
        {done && !active ? (ok ? '✓' : '✗') : n}
      </div>
      <span className={cn(active && 'text-foreground font-medium', !active && 'text-muted-foreground')}>
        {label}
      </span>
      {active && <Loader2 className="ml-auto h-3 w-3 animate-spin text-primary" />}
      {done && !active && ok && <CheckCircle2 className="ml-auto h-3 w-3 text-emerald-400" />}
      {done && !active && !ok && <AlertCircle className="ml-auto h-3 w-3 text-red-400" />}
    </div>
  );
}
