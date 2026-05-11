'use client';

import { useEffect } from 'react';

export default function GlobalRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[route error]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
      <div className="max-w-xl w-full rounded-lg border border-destructive/40 bg-destructive/5 p-6 space-y-3">
        <h2 className="text-lg font-semibold text-destructive">Something went wrong</h2>
        <pre className="overflow-auto rounded bg-black/40 p-3 text-xs whitespace-pre-wrap break-words">
          {error.message}
          {error.stack ? `\n\n${error.stack}` : ''}
        </pre>
        <button
          onClick={reset}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
