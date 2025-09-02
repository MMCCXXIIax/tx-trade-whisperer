import React, { useState, useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import './TXDashboard.css';

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

const API_BASE = "/api";

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
  const [activeAlert, setActiveAlert] = useState<Alert | null>(null);
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
        setActiveAlert(newAlert);
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
        <div className="terminal">
          <div className="tx-header">
            <div className="tx-logo">TX PREDICTIVE INTELLIGENCE</div>
            <div className="tx-tagline">
              AI-Powered Market Anticipation System | Kampala, Uganda
            </div>
          </div>

          <div className="asset-grid">
            {appState?.last_scan?.results?.map((r) => (
              <div className="asset-row" key={r.symbol}>
                <span className="asset-name">{r.symbol}</span>
                <span className="asset-price">{r.price || 'N/A'}</span>
                <span
                  className={
                    r.status === 'pattern' ? 'pattern-detected' : 'no-pattern'
                  }
                >
                  {r.status === 'pattern'
                    ? `${r.pattern} (${r.confidence})`
                    : 'IDLE'}
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, color: '#666' }}>
            Next scan in: {countdown}s
          </div>

          {appState?.last_signal && (
            <div
              style={{
                background: '#0d1a26',
                padding: 10,
                borderRadius: 4,
                margin: '20px 0',
              }}
            >
              <div style={{ color: 'var(--tx-green)', fontWeight: 'bold' }}>
                🚨 Latest Signal
              </div>
              <div>
                {appState.last_signal.symbol} {appState.last_signal.timeframe}:{' '}
                {appState.last_signal.pattern} ({appState.last_signal.confidence})
              </div>
              <div style={{ fontSize: 12, color: '#777' }}>
                {appState.last_signal.time}
              </div>
            </div>
          )}

          <div style={{ margin: '15px 0', fontSize: 12, color: '#555' }}>
            ⚡ <strong>{appState?.user_count || 0} traders</strong> live
          </div>
        </div>
      </div>

      <audio ref={alertAudioRef} />
    </div>
  );
};

export default TXDashboard;
