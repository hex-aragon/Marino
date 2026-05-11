'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { AgentAlert, Area, ShipData, WeatherData } from '@/types';

interface UseAgentInput {
  ships: ShipData[];
  weather: WeatherData | null;
  area: Area;
}

interface AgentState {
  alerts: AgentAlert[];
  summary: string;
  isAnalyzing: boolean;
  lastUpdated: string | null;
}

const INTERVAL_MS = 30_000;

export function useAgent({ ships, weather, area }: UseAgentInput) {
  const [state, setState] = useState<AgentState>({
    alerts: [],
    summary: '',
    isAnalyzing: false,
    lastUpdated: null,
  });

  const seenRef = useRef<Set<string>>(new Set());
  const inFlightRef = useRef<boolean>(false);
  const shipsRef = useRef<ShipData[]>(ships);
  const weatherRef = useRef<WeatherData | null>(weather);
  const areaRef = useRef<Area>(area);

  useEffect(() => {
    shipsRef.current = ships;
  }, [ships]);
  useEffect(() => {
    weatherRef.current = weather;
  }, [weather]);
  useEffect(() => {
    areaRef.current = area;
  }, [area]);

  const requestNotificationPermission = useCallback(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'default') {
      try {
        Notification.requestPermission();
      } catch {}
    }
  }, []);

  const fireHighAlertNotifications = useCallback((alerts: AgentAlert[]) => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    for (const a of alerts) {
      if (a.level !== 'HIGH') continue;
      const key = `${a.mmsi}:${a.type}`;
      if (seenRef.current.has(key)) continue;
      seenRef.current.add(key);
      try {
        new Notification(`[Marino] ${a.shipname}`, {
          body: a.message,
          tag: key,
        });
      } catch {}
    }
  }, []);

  const triggerAnalysis = useCallback(async () => {
    if (inFlightRef.current) return;
    const currentShips = shipsRef.current;
    if (!currentShips || currentShips.length === 0) return;
    inFlightRef.current = true;
    setState((s) => ({ ...s, isAnalyzing: true }));

    try {
      const res = await fetch('/api/agent/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ships: currentShips,
          weather: weatherRef.current,
          area: areaRef.current,
        }),
      });

      if (!res.ok) throw new Error('analyze failed');

      let alerts: AgentAlert[] = [];
      let summary = '';

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('text/event-stream') || res.body) {
        const reader = res.body?.getReader();
        if (reader) {
          const decoder = new TextDecoder();
          let buffer = '';
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
          }
          try {
            const parsed = JSON.parse(buffer);
            alerts = Array.isArray(parsed.alerts) ? parsed.alerts : [];
            summary = String(parsed.summary || '');
          } catch {
            try {
              const lines = buffer.split('\n').filter((l) => l.trim().startsWith('{'));
              const last = lines[lines.length - 1];
              if (last) {
                const parsed = JSON.parse(last);
                alerts = Array.isArray(parsed.alerts) ? parsed.alerts : [];
                summary = String(parsed.summary || '');
              }
            } catch {}
          }
        }
      } else {
        const parsed = await res.json();
        alerts = Array.isArray(parsed.alerts) ? parsed.alerts : [];
        summary = String(parsed.summary || '');
      }

      fireHighAlertNotifications(alerts);
      setState({
        alerts,
        summary,
        isAnalyzing: false,
        lastUpdated: new Date().toISOString(),
      });
    } catch {
      setState((s) => ({ ...s, isAnalyzing: false }));
    } finally {
      inFlightRef.current = false;
    }
  }, [fireHighAlertNotifications]);

  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  useEffect(() => {
    if (ships.length === 0) return;
    triggerAnalysis();
    const id = setInterval(triggerAnalysis, INTERVAL_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ships.length > 0, area]);

  return {
    alerts: state.alerts,
    summary: state.summary,
    isAnalyzing: state.isAnalyzing,
    lastUpdated: state.lastUpdated,
    triggerAnalysis,
  };
}
