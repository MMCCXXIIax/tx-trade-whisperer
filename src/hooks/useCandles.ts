import { useEffect, useMemo, useRef, useState } from 'react';

export type Candle = {
  time: number; // seconds since epoch for lightweight-charts
  open: number;
  high: number;
  low: number;
  close: number;
};

interface UseCandlesOptions {
  apiBase: string;
  symbol: string;
  interval?: string; // e.g., '1m', '5m'
  limit?: number; // e.g., 200
  pollMs?: number; // default 15000
}

function toNumber(n: any): number {
  const v = typeof n === 'string' ? parseFloat(n) : Number(n);
  return Number.isFinite(v) ? v : 0;
}

function toSeconds(t: any): number {
  if (!t && t !== 0) return Math.floor(Date.now() / 1000);
  // array index case handled before call
  if (typeof t === 'number') {
    // assume ms if too large
    return t > 1e12 ? Math.floor(t / 1000) : (t > 1e10 ? Math.floor(t / 1000) : t);
  }
  const d = new Date(String(t));
  return Math.floor(d.getTime() / 1000);
}

function mapItem(it: any): Candle | null {
  // Supports array [t, o, h, l, c] or object with keys
  if (Array.isArray(it)) {
    const [t, o, h, l, c] = it;
    return {
      time: toSeconds(t),
      open: toNumber(o),
      high: toNumber(h),
      low: toNumber(l),
      close: toNumber(c),
    };
  }
  if (it && typeof it === 'object') {
    const timeVal = it.t ?? it.time ?? it.timestamp;
    const o = it.o ?? it.open;
    const h = it.h ?? it.high;
    const l = it.l ?? it.low;
    const c = it.c ?? it.close;
    if ([o, h, l, c].some(v => v === undefined || v === null)) return null;
    return {
      time: toSeconds(timeVal),
      open: toNumber(o),
      high: toNumber(h),
      low: toNumber(l),
      close: toNumber(c),
    };
  }
  return null;
}

export function useCandles({ apiBase, symbol, interval = '1m', limit = 200, pollMs = 15000 }: UseCandlesOptions) {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const url = useMemo(() => {
<<<<<<< HEAD
    const params = new URLSearchParams({ symbol, interval, limit: limit.toString() });
    return `${apiBase}/api/candles?${params.toString()}`;
  }, [apiBase, symbol, interval, limit]);
=======
    const params = new URLSearchParams({ symbol });
    return `${apiBase}/api/candles?${params.toString()}`;
  }, [apiBase, symbol]);
>>>>>>> c646b09155e6d424b19520438c4cb96f629963d5

  useEffect(() => {
    let active = true;
    let timer: number | undefined;

    const fetchCandles = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const arr = Array.isArray(data) ? data : (data?.candles || data?.data || []);
        const mapped: Candle[] = arr.map(mapItem).filter(Boolean) as Candle[];
        mapped.sort((a, b) => a.time - b.time);
        if (active) setCandles(mapped);
      } catch (e: any) {
        if (active) setError(e?.message || 'Failed to load candles');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchCandles();
    timer = window.setInterval(fetchCandles, pollMs);
    return () => {
      active = false;
      if (timer) window.clearInterval(timer);
    };
  }, [url, pollMs]);

  return { candles, loading, error };
}
