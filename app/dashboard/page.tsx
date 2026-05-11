'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Ship, Waves, AlertTriangle, Crown, Bot, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PortSelector } from '@/components/PortSelector';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useShips } from '@/hooks/useShips';
import { useWeather } from '@/hooks/useWeather';
import { useAgent } from '@/hooks/useAgent';
import { usePayment } from '@/hooks/usePayment';
import AgentAlertPanel from '@/components/AgentAlertPanel';
import SiteHeader from '@/components/SiteHeader';
import PaymentModal from '@/components/PaymentModal';
import { timeAgo } from '@/lib/utils';
import type { Area } from '@/types';

const MaritimeMap = dynamic(() => import('@/components/MaritimeMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full grid place-items-center text-muted-foreground text-sm">
      Loading map...
    </div>
  ),
});

const RISK_VARIANT = {
  SAFE: 'success',
  CAUTION: 'warning',
  DANGER: 'danger',
} as const;

const RISK_LABEL = {
  SAFE: 'Safe',
  CAUTION: 'Caution',
  DANGER: 'Danger',
} as const;

export default function DashboardPage() {
  const { ships, area, setArea } = useShips();
  const { weather } = useWeather(area);
  const { alerts, summary, isAnalyzing, lastUpdated } = useAgent({ ships, weather, area });
  const payment = usePayment();

  const [focusMmsi, setFocusMmsi] = useState<string | undefined>(undefined);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [alertSheetOpen, setAlertSheetOpen] = useState(false);

  const dangerCount = alerts.filter((a) => a.level === 'HIGH' || a.level === 'MEDIUM').length;
  const waveText = weather ? `${weather.waveHeight.toFixed(1)}m` : '—';
  const updatedText = lastUpdated ? timeAgo(lastUpdated) : 'Standby';

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <SiteHeader
        rightSlot={
          <>
            <Badge variant="secondary" className="hidden sm:inline-flex gap-1">
              <Ship className="h-3 w-3" /> {ships.length}
            </Badge>
            {weather && (
              <Badge variant={RISK_VARIANT[weather.riskLevel]} className="hidden sm:inline-flex gap-1">
                <Waves className="h-3 w-3" /> {waveText}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPaymentOpen(true)}
              className="gap-1.5"
            >
              <Crown className="h-4 w-4" />
              <span className="hidden md:inline">Premium</span>
            </Button>
          </>
        }
      />

      <div className="flex h-11 shrink-0 items-center gap-3 border-b bg-background/60 px-4">
        <PortSelector value={area} onChange={(v) => setArea(v as Area)} />
        <span className="text-xs text-muted-foreground hidden sm:inline-flex items-center gap-1">
          <Clock className="h-3 w-3" /> {updatedText}
        </span>
      </div>

      <main className="flex flex-1 overflow-hidden">
        <div className="relative flex-1">
          <MaritimeMap
            ships={ships}
            alerts={alerts}
            weather={weather}
            area={area}
            onAreaChange={setArea}
            onShipClick={(s) => setFocusMmsi(s.mmsi)}
            focusMmsi={focusMmsi}
          />
        </div>

        <aside className="hidden w-[320px] shrink-0 overflow-hidden border-l md:block">
          <AgentAlertPanel
            alerts={alerts}
            summary={summary}
            isAnalyzing={isAnalyzing}
            lastUpdated={lastUpdated}
            onShipFocus={setFocusMmsi}
            onPayClick={() => setPaymentOpen(true)}
            isPremium={payment.isPaid}
          />
        </aside>

        <Sheet open={alertSheetOpen} onOpenChange={setAlertSheetOpen}>
          <SheetTrigger asChild>
            <Button
              size="lg"
              className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-lg md:hidden"
            >
              <Bot className="h-5 w-5" />
              {dangerCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                  {dangerCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[75vh] p-0">
            <SheetHeader className="border-b px-4 py-3">
              <SheetTitle>AI Maritime Agent</SheetTitle>
            </SheetHeader>
            <div className="h-[calc(75vh-60px)] overflow-hidden">
              <AgentAlertPanel
                alerts={alerts}
                summary={summary}
                isAnalyzing={isAnalyzing}
                lastUpdated={lastUpdated}
                onShipFocus={(m) => {
                  setFocusMmsi(m);
                  setAlertSheetOpen(false);
                }}
                onPayClick={() => {
                  setAlertSheetOpen(false);
                  setPaymentOpen(true);
                }}
                isPremium={payment.isPaid}
              />
            </div>
          </SheetContent>
        </Sheet>
      </main>

      <footer className="flex h-12 shrink-0 items-center gap-4 border-t bg-background/80 px-4 text-xs text-muted-foreground backdrop-blur">
        <span className="inline-flex items-center gap-1.5">
          <Ship className="h-3.5 w-3.5 text-primary" /> Monitoring <strong className="text-foreground">{ships.length}</strong> vessels
        </span>
        <span className="hidden sm:inline-flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-warning" /> <strong className="text-foreground">{alerts.length}</strong> alerts
        </span>
        <span className="hidden sm:inline-flex items-center gap-1.5">
          <Waves className="h-3.5 w-3.5 text-primary" /> Wave <strong className="text-foreground">{waveText}</strong>
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" /> Updated {updatedText}
        </span>
      </footer>

      <PaymentModal open={paymentOpen} onOpenChange={setPaymentOpen} defaultPlan="premium" />
    </div>
  );
}
