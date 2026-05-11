'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[global error]', error);
  }, [error]);

  return (
    <html>
      <body
        style={{
          background: '#0a1628',
          color: '#fff',
          fontFamily: 'system-ui, sans-serif',
          padding: '40px',
          minHeight: '100vh',
        }}
      >
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ color: '#ff4757' }}>Application Error</h2>
          <pre
            style={{
              background: '#0009',
              padding: 12,
              borderRadius: 6,
              fontSize: 12,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflow: 'auto',
            }}
          >
            {error.message}
            {error.stack ? `\n\n${error.stack}` : ''}
          </pre>
          <button
            onClick={reset}
            style={{
              marginTop: 12,
              padding: '8px 16px',
              background: '#00d4aa',
              color: '#0a1628',
              border: 0,
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
