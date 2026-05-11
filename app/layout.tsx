import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SeaWatch — Maritime AI Agent Platform',
  description: 'AI 에이전트가 24시간 선박을 모니터링하고 Solana USDC로 즉시 결제하는 해양 플랫폼',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
