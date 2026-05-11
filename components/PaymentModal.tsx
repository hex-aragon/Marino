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
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { buildUsdcTransferTx } from '@/lib/solana';
import { Check, ChevronDown, ChevronUp, ExternalLink, Loader2, ShieldCheck, Sparkles, Wallet } from 'lucide-react';

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
    price: 0.09,
    features: ['Realtime AIS monitoring', '100 AI analyses/day', 'Email alerts'],
  },
  premium: {
    name: 'Premium',
    price: 0.29,
    badge: 'Recommended',
    features: ['All Basic features', 'Unlimited AI analyses', 'Free x402 paid APIs', '72h detailed weather', 'Priority support'],
  },
};

export default function PaymentModal({ open, onOpenChange, defaultPlan = 'premium' }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('plan');
  const [plan, setPlan] = useState<Plan>(defaultPlan);
  const [email, setEmail] = useState('');
  const [showDevnetHelp, setShowDevnetHelp] = useState(false);
  const [inAppPaying, setInAppPaying] = useState(false);
  const [inAppError, setInAppError] = useState<string | null>(null);
  const { createPayment, markPaid, isLoading, isPaid, qrData, txHash } = usePayment();
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

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

  const handleInAppPay = async () => {
    if (!publicKey) return;
    const merchant = process.env.NEXT_PUBLIC_MERCHANT_WALLET || '11111111111111111111111111111111';
    setInAppPaying(true);
    setInAppError(null);
    try {
      const tx = await buildUsdcTransferTx(
        publicKey.toBase58(),
        merchant,
        PLAN_INFO[plan].price,
      );
      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      markPaid(signature);
    } catch (e: any) {
      setInAppError(e?.message || 'In-app payment failed');
    } finally {
      setInAppPaying(false);
    }
  };

  const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {step === 'plan' && (
          <>
            <DialogHeader>
              <DialogTitle>Choose Subscription Plan</DialogTitle>
              <DialogDescription>Instant payment with Solana USDC</DialogDescription>
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
                      <span className="text-xs text-muted-foreground font-normal"> USDC/mo</span>
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
              <label className="text-xs text-muted-foreground">Email (for alerts)</label>
              <Input
                type="email"
                placeholder="captain@ship.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button onClick={handleStart} disabled={isLoading || !email} className="w-full">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Pay {formatUSDC(PLAN_INFO[plan].price)}
            </Button>
          </>
        )}

        {step === 'qr' && (
          <>
            <DialogHeader>
              <DialogTitle>Pay with Solana Pay</DialogTitle>
              <DialogDescription>
                {PLAN_INFO[plan].name} plan · {formatUSDC(PLAN_INFO[plan].price)}
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
                <span>Auto-checking every 5s...</span>
              </div>

              {publicKey && (
                <div className="w-full space-y-2">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <div className="h-px flex-1 bg-border" />
                    <span>or</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <Button
                    onClick={handleInAppPay}
                    disabled={inAppPaying}
                    variant="outline"
                    className="w-full"
                  >
                    {inAppPaying ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wallet className="h-4 w-4" />
                    )}
                    Pay with connected wallet
                  </Button>
                  {inAppError && (
                    <p className="text-[11px] text-red-400">{inAppError}</p>
                  )}
                </div>
              )}
            </div>
            <Card className="bg-muted/50">
              <button
                onClick={() => setShowDevnetHelp((v) => !v)}
                className="flex w-full items-center justify-between p-3 text-left"
              >
                <span className="text-xs font-medium">Devnet test note</span>
                {showDevnetHelp ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {showDevnetHelp && (
                <div className="px-3 pb-3 text-[11px] text-muted-foreground space-y-1.5">
                  <p>· Requires test USDC on the Solana devnet.</p>
                  <p>· Switch your Phantom wallet to devnet and scan the QR.</p>
                  <p>· In demo mode, transaction hashes starting with <code className="text-primary">mock_xxx</code> are instantly verified.</p>
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
                Payment Complete
              </DialogTitle>
              <DialogDescription>{PLAN_INFO[plan].name} plan activated</DialogDescription>
            </DialogHeader>
            <Card className="bg-primary/5 border-primary/20 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold text-foreground">{formatUSDC(PLAN_INFO[plan].price)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Valid Until</span>
                <span className="font-semibold text-foreground">~ {validUntil}</span>
              </div>
              <Separator />
              <div className="text-xs">
                <div className="text-muted-foreground mb-1">Transaction Hash</div>
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
              Go to Dashboard
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
