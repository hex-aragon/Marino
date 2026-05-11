'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { PORTS } from '@/lib/ports';
import { cn } from '@/lib/utils';

interface Props {
  value: string;
  onChange: (id: string) => void;
  className?: string;
}

export function PortSelector({ value, onChange, className }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = PORTS.find((p) => p.id === value) ?? PORTS[0];

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-2 rounded-md border border-input bg-secondary px-3 py-1.5 text-xs font-medium',
          'hover:border-primary/50 transition-colors',
        )}
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span>{current.label}</span>
        <ChevronDown className={cn('h-3 w-3 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-md border border-border bg-popover shadow-xl">
          <div className="flex items-center gap-1.5 border-b border-border px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            <MapPin className="h-3 w-3" />
            Select Port
          </div>
          <ul className="max-h-72 overflow-y-auto py-1">
            {PORTS.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => {
                    onChange(p.id);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors',
                    p.id === value
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-accent',
                  )}
                >
                  <span className="text-base leading-none">{p.flag}</span>
                  <span className="flex-1 truncate">{p.label}</span>
                  <span className="text-[10px] text-muted-foreground">{p.country}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
