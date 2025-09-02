import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
}

const API_BASE = "/api";

// 🔹 Shared safeFetch helper
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
  const [countdown, setCountdown] = useState(120);
  const [activeAlert, setActiveAlert] = useState<Alert | null>(null);
  const [lastAlertId, setLastAlertId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const alertAudioRef = useRef<HTMLAudioElement>(null);
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval>>();

  // ⏳ Data fetchers
  const fetchScanData = async () => {
    const data = await safeFetch<AppState>('/api/scan');
    if (data) {
      setAppState(data);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
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

  // ⏱ Countdown + polling
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
        {/* Your existing dashboard UI here */}
        <div className="md:col-span-2">
  {appState ? (
    <pre className="text-xs text-white bg-black p-4 rounded overflow-x-auto">
      {JSON.stringify(appState, null, 2)}
    </pre>
  ) : (
    <div className="text-muted-foreground">No scan data available</div>
  )}
</div>
      
      {/* Portfolio panel right 
      <div>
        <PortfolioPanel
          onSelectSymbol={(sym) => {
            console.log('Selected symbol from portfolio:', sym);
          }}
        />
      </div>*/}

      <audio ref={alertAudioRef} />
    </div>
  );
};

export default TXDashboard;
