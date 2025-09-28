import { useEffect, useRef, useState } from 'react';
import { API_BASE } from '@/lib/api';

interface SSEOptions {
  lastN?: number;
}

interface AlertEvent {
  symbol: string;
  pattern: string;
  confidence: string | number;
  price?: string | number;
  time?: string;
  explanation?: string;
}

interface ScanResultSymbol {
  symbol: string;
  status: string;
  pattern?: string;
  confidence?: number | string;
  price?: number | string;
}

interface LastScanPayload {
  id: number;
  time: string;
  results: ScanResultSymbol[];
}

interface MarketUpdatePayload {
  prices: Record<string, number | null>;
  time: string;
}

export function useSSE(options: SSEOptions = {}) {
  const { lastN = 5 } = options;
  const [connected, setConnected] = useState(false);
  const [lastAlert, setLastAlert] = useState<AlertEvent | null>(null);
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [lastScan, setLastScan] = useState<LastScanPayload | null>(null);
  const [marketUpdate, setMarketUpdate] = useState<MarketUpdatePayload | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const url = `${API_BASE}/api/events?lastN=${encodeURIComponent(String(lastN))}`;
    const es = new EventSource(url, { withCredentials: false });
    esRef.current = es;

    const onOpen = () => setConnected(true);
    const onError = () => setConnected(false);

    es.addEventListener('open', onOpen as EventListener);
    es.addEventListener('error', onError as EventListener);

    es.addEventListener('hello', (e: MessageEvent) => {
      setConnected(true);
    });

    es.addEventListener('new_alert', (e: MessageEvent) => {
      try {
        const alert = JSON.parse(e.data);
        setLastAlert(alert);
        setAlerts(prev => [alert, ...prev].slice(0, 50));
      } catch {}
    });

    es.addEventListener('scan_update', (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data) as LastScanPayload;
        setLastScan(payload);
      } catch {}
    });

    es.addEventListener('market_update', (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data) as MarketUpdatePayload;
        setMarketUpdate(payload);
      } catch {}
    });

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [lastN]);

  return { connected, lastAlert, alerts, lastScan, marketUpdate };
}
