'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Bot, Satellite, Zap } from 'lucide-react';
import { ConnectWalletButton } from '@/components/ConnectWalletButton';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/marketplace', label: 'Market', icon: ShoppingBag },
  { href: '/agent', label: 'Agent', icon: Bot },
  { href: '/satellite', label: 'Satellite', icon: Satellite },
];

interface Props {
  /** Optional right-side content (badges, status pills) injected next to nav */
  rightSlot?: React.ReactNode;
  /** Hide wallet connect button (e.g. for marketing pages) */
  hideWallet?: boolean;
}

export default function SiteHeader({ rightSlot, hideWallet }: Props) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname?.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-1 sm:gap-3">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-1.5 text-base font-bold tracking-tight"
          >
            <span className="text-xl">🚢</span>
            <span className="hidden sm:inline">SeaWatch</span>
          </Link>

          <nav className="flex items-center gap-0.5 sm:gap-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {rightSlot}
          {!hideWallet && <ConnectWalletButton />}
        </div>
      </div>
    </header>
  );
}
