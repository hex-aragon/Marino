'use client';

import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

const WalletMultiButton = dynamic(
  () =>
    import('@solana/wallet-adapter-react-ui').then(
      (mod) => mod.WalletMultiButton,
    ),
  { ssr: false },
);

interface Props {
  className?: string;
}

export function ConnectWalletButton({ className }: Props) {
  return (
    <WalletMultiButton
      className={cn(
        '!h-9 !rounded-md !bg-primary !text-primary-foreground !text-xs !font-semibold !px-3 !py-0 hover:!bg-primary/90 transition-colors',
        className,
      )}
    />
  );
}
