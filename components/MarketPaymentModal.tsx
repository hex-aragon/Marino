'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatUSDC, shortenWallet } from '@/lib/utils';
import { usePayment } from '@/hooks/usePayment';
import { ChevronDown, ChevronUp, ExternalLink, Loader2, Lock, ShieldCheck } from 'lucide-react';
import type { MarketItem } from '@/types';

type Step = 'review' | 'qr' | 'success';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  item: MarketItem;
  buyerWallet: string;
  onPurchaseComplete: (escrowId: string) => void;
}

const CATEGORY_EMOJI: Record<MarketItem['category'], string> = {
  food: '🍱',
  parts: '🔧',
  service: '🛠️',
  info: '📡',
  exchange: '💱',
};

export default function MarketPaymentModal({ open, onOpenChange, item, buyerWallet, onPurchaseComplete }: Props) {
  const [step, setStep] = useState<Step>('review');
  const [escrowId, setEscrowId] = useState<string | null>(null);
  const [escrowError, setEscrowError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const { createPayment, isLoading, isPaid, qrData, txHash } = usePayment();

  useEffect(() => {
    if (open) {
      setStep('review');
      setEscrowId(null);
      setEscrowError(null);
    }
  }, [open]);

  useEffect(() => {
    if (isPaid && txHash && step === 'qr' && !escrowId) {
      (async () => {
        try {
          const res = await fetch('/api/payment/escrow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'lock',
              buyerWallet,
              sellerWallet: item.sellerWallet,
              amount: item.price,
              itemId: item.id,
              txHash,
            }),
          });
          if (!res.ok) throw new Error('escrow lock failed');
          const data = await res.json();
          const id = data.escrow?.id || data.id;
          setEscrowId(id);
          setStep('success');
          onPurchaseComplete(id);
        } catch (err: any) {
          setEscrowError(err?.message || '에스크로 생성 실패');
          setStep('success');
        }
      })();
    }
  }, [isPaid, txHash, step, escrowId, item, buyerWallet, onPurchaseComplete]);

  const handleStart = async () => {
    await createPayment({
      type: 'market',
      amount: item.price,
      meta: { itemId: item.id, sellerWallet: item.sellerWallet, buyerWallet },
    });
    setStep('qr');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {step === 'review' && (
          <>
            <DialogHeader>
              <DialogTitle>에스크로 안전 결제</DialogTitle>
              <DialogDescription>판매자에게 즉시 송금되지 않고 잠금 보관됩니다</DialogDescription>
            </DialogHeader>
            <Card className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="text-3xl">{CATEGORY_EMOJI[item.category]}</div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-foreground truncate">{item.title}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2">{item.description}</div>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">판매자</span>
                <span className="text-foreground">선장 {item.sellerName} · ⭐{item.sellerRating.toFixed(1)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">결제 금액</span>
                <span className="text-xl font-bold text-primary">{formatUSDC(item.price)}</span>
              </div>
            </Card>
            <Card className="bg-primary/5 border-primary/20 p-3">
              <div className="flex items-start gap-2 text-xs">
                <Lock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="space-y-1 text-muted-foreground">
                  <p className="text-foreground font-medium">에스크로 보호</p>
                  <p>· 결제 USDC는 플랫폼 지갑에 잠금됩니다.</p>
                  <p>· 상품 수령 후 "수령 확인" 시 판매자에게 전송됩니다.</p>
                  <p>· 분쟁 시 환불 가능 (수수료 1%).</p>
                </div>
              </div>
            </Card>
            <Button onClick={handleStart} disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              {formatUSDC(item.price)}로 안전 결제
            </Button>
          </>
        )}

        {step === 'qr' && (
          <>
            <DialogHeader>
              <DialogTitle>Solana Pay로 결제</DialogTitle>
              <DialogDescription>{item.title} · {formatUSDC(item.price)}</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-lg bg-white p-4 shadow-lg">
                {qrData ? (
                  <QRCodeSVG value={qrData} size={220} bgColor="#fff" fgColor="#000" />
                ) : (
                  <div className="flex h-[220px] w-[220px] items-center justify-center">
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
                onClick={() => setShowHelp((v) => !v)}
                className="flex w-full items-center justify-between p-3 text-left"
              >
                <span className="text-xs font-medium">devnet 테스트 안내</span>
                {showHelp ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {showHelp && (
                <div className="px-3 pb-3 text-[11px] text-muted-foreground space-y-1.5">
                  <p>· devnet USDC를 사용해서 테스트 가능합니다.</p>
                  <p>· <code className="text-primary">mock_xxx</code> 트랜잭션 해시로 즉시 검증됩니다.</p>
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
                결제 완료 · 에스크로 잠금
              </DialogTitle>
              <DialogDescription>판매자에게 알림을 보냈습니다</DialogDescription>
            </DialogHeader>
            {escrowError ? (
              <Card className="bg-red-500/10 border-red-500/30 p-3 text-xs text-red-300">
                {escrowError}
              </Card>
            ) : (
              <Card className="bg-primary/5 border-primary/20 p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">상품</span>
                  <span className="font-medium text-foreground truncate ml-2">{item.title}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">잠금 금액</span>
                  <span className="font-semibold text-foreground">{formatUSDC(item.price)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">판매자 지갑</span>
                  <span className="text-foreground font-mono text-[10px]">{shortenWallet(item.sellerWallet)}</span>
                </div>
                {escrowId && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">에스크로 ID</span>
                    <Badge variant="outline" className="text-[10px]">{escrowId}</Badge>
                  </div>
                )}
                <Separator />
                {txHash && (
                  <a
                    href={`https://explorer.solana.com/tx/${txHash}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <span className="truncate">트랜잭션 보기</span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                )}
              </Card>
            )}
            <div className="text-xs text-muted-foreground">
              상품을 수령하신 후 마켓플레이스에서 "수령 확인" 버튼을 눌러주세요.
              그때 판매자에게 USDC가 전송됩니다 (수수료 1% 차감).
            </div>
            <Button className="w-full" onClick={() => onOpenChange(false)}>
              확인
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
