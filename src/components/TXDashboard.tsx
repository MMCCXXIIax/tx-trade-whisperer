import React, { useState, useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

interface AssetResult {
  symbol: string;
  status: string;
  pattern?: string;
  confidence?: string;
  price?: string;
  message?: string;
}

interface ScanData {
  id: number;
  time: string;
  results: AssetResult[];
}

interface Alert {
  symbol: string;
  pattern: string;
  confidence: string;
  price: string;
  time: string;
  explanation: string;
  action: string;
}

interface LastSignal {
  symbol: string;
  pattern: string;
  confidence: string;
  time: string;
  timeframe: string;
}

interface AppState {
  last_scan: ScanData;
  alerts: Alert[];
  paper_trades: any[];
  last_signal: LastSignal | null;
  user_count?: number;
}

const API_BASE = "https://tx-backend.onrender.com/api";

export const safeFetch = async <T,>(
  path: string,
  options?: RequestInit,
  retries = 2
): Promise<T | null> => {
  try {
    const res = await fetch(`${API_BASE}${path}`, options);
    if (!res.ok) throw new Error(res.statusText);
    return (await res.json()) as T;
  } catch (err: any) {
    console.error(`Fetch failed for ${path}:`, err);
    if (retries > 0) {
      return safeFetch<T>(path, options, retries - 1);
    }
    toast({
      title: 'Connection Error',
      description: err?.message || 'Some data may be out of date.',
      variant: 'destructive',
    });
    return null;
  }
};

const TXDashboard: React.FC = () => {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [countdown, setCountdown] = useState(180);
  const [lastAlertId, setLastAlertId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const alertAudioRef = useRef<HTMLAudioElement>(null);
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval>>();

  const fetchScanData = async () => {
    const data = await safeFetch<AppState>('/api/scan');
    setAppState(data);
    setIsLoading(false);
  };

  const checkForAlerts = async () => {
    const data = await safeFetch<{ alerts: Alert[] }>('/api/get_active_alerts');
    if (data?.alerts?.length) {
      const newAlert = data.alerts[0];
      if (newAlert.symbol + newAlert.time !== lastAlertId) {
        setLastAlertId(newAlert.symbol + newAlert.time);
        if (soundEnabled && alertAudioRef.current) {
          alertAudioRef.current.play().catch(() => null);
        }
        toast({
          title: '🚨 TX ALERT ACTIVATED',
          description: `${newAlert.symbol}: ${newAlert.pattern} (${newAlert.confidence})`,
          duration: 10000,
        });
      }
    }
  };

  useEffect(() => {
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchScanData();
          return 180;
        }
        return prev - 1;
      });
    }, 1000);
    return () => countdownIntervalRef.current && clearInterval(countdownIntervalRef.current);
  }, []);

  useEffect(() => {
    fetchScanData();
    refreshIntervalRef.current = setInterval(checkForAlerts, 10000);
    return () => refreshIntervalRef.current && clearInterval(refreshIntervalRef.current);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>TX LOADING…</div>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Main dashboard left */}
      <div className="md:col-span-2">
        <div className="terminal-container p-4 max-w-3xl mx-auto">
          {/* Header */}
          <div className="border-b border-border pb-2 mb-4">
            <h1 className="text-[hsl(var(--tx-green))] text-xl font-bold">
              TX PREDICTIVE INTELLIGENCE
            </h1>
            <p className="text-muted-foreground text-sm">
              AI-Powered Market Anticipation System | Kampala, Uganda
            </p>
          </div>

          {/* Asset list */}
          <div>
            {appState?.last_scan?.results?.map((r) => (
              <div
                key={r.symbol}
                className="flex justify-between border-b border-border py-2"
              >
                <span className="font-bold text-[hsl(var(--tx-green))]">{r.symbol}</span>
                <span>{r.price || 'N/A'}</span>
                <span
                  className={
                    r.status === 'pattern'
                      ? 'pattern-detected px-2 rounded'
                      : 'no-pattern'
                  }
                >
                  {r.status === 'pattern'
                    ? `${r.pattern} (${r.confidence})`
                    : 'IDLE'}
                </span>
              </div>
            ))}
          </div>

          {/* Countdown */}
          <div className="mt-4 text-muted-foreground text-sm">
            Next scan in: {countdown}s
          </div>

          {/* Latest Signal */}
          {appState?.last_signal && (
            <div className="bg-[#0d1a26] p-3 rounded mt-4">
              <div className="text-[hsl(var(--tx-green))] font-bold">🚨 Latest Signal</div>
              <div>
                {appState.last_signal.symbol} {appState.last_signal.timeframe}:{' '}
                {appState.last_signal.pattern} ({appState.last_signal.confidence})
              </div>
              <div className="text-xs text-muted-foreground">
                {appState.last_signal.time}
              </div>
            </div>
          )}

          {/* Trader count */}
          <div className="mt-4 text-xs text-muted-foreground">
            ⚡ <strong>{appState?.user_count || 0} traders</strong> live
          </div>
        </div>
      </div>

      <audio ref={alertAudioRef} />
    </div>
  );
};

export default TXDashboard;
