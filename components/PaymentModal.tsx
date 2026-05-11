'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn, formatUSDC } from '@/lib/utils';
import { usePayment } from '@/hooks/usePayment';
import { Check, ChevronDown, ChevronUp, ExternalLink, Loader2, ShieldCheck, Sparkles } from 'lucide-react';

type Plan = 'basic' | 'premium';
type Step = 'plan' | 'qr' | 'success';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  defaultPlan?: Plan;
}

const PLAN_INFO: Record<Plan, { name: string; price: number; features: string[]; badge?: string }> = {
  basic: {
    name: 'Basic',
    price: 9,
    features: ['실시간 AIS 모니터링', '일 100건 AI 분석', '이메일 알림'],
  },
  premium: {
    name: 'Premium',
    price: 29,
    badge: '추천',
    features: ['Basic 전체 기능', '무제한 AI 분석', 'x402 유료 API 무료', '72h 상세 기상', '우선 지원'],
  },
};

export default function PaymentModal({ open, onOpenChange, defaultPlan = 'premium' }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('plan');
  const [plan, setPlan] = useState<Plan>(defaultPlan);
  const [email, setEmail] = useState('');
  const [showDevnetHelp, setShowDevnetHelp] = useState(false);
  const { createPayment, isLoading, isPaid, qrData, txHash } = usePayment();

  useEffect(() => {
    if (open) {
      setStep('plan');
      setPlan(defaultPlan);
    }
  }, [open, defaultPlan]);

  useEffect(() => {
    if (isPaid && step === 'qr') setStep('success');
  }, [isPaid, step]);

  const handleStart = async () => {
    await createPayment({
      type: 'subscription',
      amount: PLAN_INFO[plan].price,
      meta: { plan, email },
    });
    setStep('qr');
  };

  const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {step === 'plan' && (
          <>
            <DialogHeader>
              <DialogTitle>구독 플랜 선택</DialogTitle>
              <DialogDescription>Solana USDC로 즉시 결제됩니다</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(PLAN_INFO) as Plan[]).map((p) => {
                const info = PLAN_INFO[p];
                const active = plan === p;
                return (
                  <button
                    key={p}
                    onClick={() => setPlan(p)}
                    className={cn(
                      'relative text-left rounded-lg border p-4 transition-all',
                      active
                        ? 'border-primary bg-primary/10 shadow-[0_0_0_2px_hsl(var(--primary)/0.3)]'
                        : 'border-border hover:border-primary/50',
                    )}
                  >
                    {info.badge && (
                      <Badge className="absolute -top-2 right-2 text-[9px]">{info.badge}</Badge>
                    )}
                    <div className="font-semibold text-foreground">{info.name}</div>
                    <div className="mt-1 text-2xl font-bold text-primary">
                      {info.price}
                      <span className="text-xs text-muted-foreground font-normal"> USDC/월</span>
                    </div>
                    <ul className="mt-3 space-y-1 text-[11px] text-muted-foreground">
                      {info.features.map((f) => (
                        <li key={f} className="flex items-start gap-1">
                          <Check className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">이메일 (알림 수신)</label>
              <Input
                type="email"
                placeholder="captain@ship.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button onClick={handleStart} disabled={isLoading || !email} className="w-full">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {formatUSDC(PLAN_INFO[plan].price)}로 결제하기
            </Button>
          </>
        )}

        {step === 'qr' && (
          <>
            <DialogHeader>
              <DialogTitle>Solana Pay로 결제</DialogTitle>
              <DialogDescription>
                {PLAN_INFO[plan].name} 플랜 · {formatUSDC(PLAN_INFO[plan].price)}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-lg bg-white p-4 shadow-lg">
                {qrData ? (
                  <QRCodeSVG value={qrData} size={240} bgColor="#fff" fgColor="#000" />
                ) : (
                  <div className="flex h-[240px] w-[240px] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-black" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin text-primary" />
                <span>5초마다 자동 확인 중...</span>
              </div>
            </div>
            <Card className="bg-muted/50">
              <button
                onClick={() => setShowDevnetHelp((v) => !v)}
                className="flex w-full items-center justify-between p-3 text-left"
              >
                <span className="text-xs font-medium">devnet 테스트 안내</span>
                {showDevnetHelp ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {showDevnetHelp && (
                <div className="px-3 pb-3 text-[11px] text-muted-foreground space-y-1.5">
                  <p>· Solana devnet 환경의 테스트 USDC가 필요합니다.</p>
                  <p>· Phantom 지갑을 devnet으로 전환하고 QR을 스캔하세요.</p>
                  <p>· 데모 환경에서는 <code className="text-primary">mock_xxx</code>로 시작하는 트랜잭션 해시로 즉시 검증 가능합니다.</p>
                </div>
              )}
            </Card>
          </>
        )}

        {step === 'success' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                결제 완료
              </DialogTitle>
              <DialogDescription>{PLAN_INFO[plan].name} 플랜이 활성화되었습니다</DialogDescription>
            </DialogHeader>
            <Card className="bg-primary/5 border-primary/20 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">결제 금액</span>
                <span className="font-semibold text-foreground">{formatUSDC(PLAN_INFO[plan].price)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">구독 유효기간</span>
                <span className="font-semibold text-foreground">~ {validUntil}</span>
              </div>
              <Separator />
              <div className="text-xs">
                <div className="text-muted-foreground mb-1">트랜잭션 해시</div>
                <a
                  href={`https://explorer.solana.com/tx/${txHash}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline break-all"
                >
                  <span className="truncate">{txHash}</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              </div>
            </Card>
            <Button
              className="w-full"
              onClick={() => {
                onOpenChange(false);
                router.push('/dashboard');
              }}
            >
              대시보드로 이동
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
