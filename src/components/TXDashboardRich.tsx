import React, { useState, useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import { safeFetch } from '@/lib/api';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, AlertTriangle, TrendingUp } from 'lucide-react';

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

const TXDashboardRich: React.FC = () => {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [countdown, setCountdown] = useState(180);
  const [lastAlertId, setLastAlertId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [txPersonality, setTxPersonality] = useState<string>('Standing by…');
  const [activeAlert, setActiveAlert] = useState<Alert | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const alertAudioRef = useRef<HTMLAudioElement>(null);
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval>>();

  const personalities = [
    "Scanning the markets like a hawk…",
    "TX is feeling bullish today.",
    "Patterns emerging… stay sharp.",
    "Your AI co‑pilot is on duty.",
    "TX sees something interesting…"
  ];

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
        setActiveAlert(newAlert);
        setTxPersonality(personalities[Math.floor(Math.random() * personalities.length)]);
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

  const handleAlertAction = async (action: string) => {
    toast({ title: `Action: ${action}`, description: `You chose to ${action} this alert.` });
    setActiveAlert(null);
    // Optionally send to backend:
    // await safeFetch(`/handle_alert_response`, { method: 'POST', body: JSON.stringify({ action }) });
  };

  const logOutcome = async (outcome: 'win' | 'loss') => {
    toast({ title: `Trade ${outcome.toUpperCase()}`, description: `Logged as ${outcome}` });
    // Optionally send to backend:
    // await safeFetch(`/log_outcome`, { method: 'POST', body: JSON.stringify({ outcome }) });
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
        <div>Initializing trading intelligence…</div>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Left column */}
      <div className="md:col-span-2 space-y-4">
        {/* Market Monitor */}
        <Card className="terminal-container">
          <CardHeader>
            <CardTitle className="text-[hsl(var(--tx-green))] flex justify-between items-center">
              TX PREDICTIVE INTELLIGENCE
              <Button variant="ghost" size="icon" onClick={() => setSoundEnabled(!soundEnabled)}>
                {soundEnabled ? <Volume2 /> : <VolumeX />}
              </Button>
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              AI-Powered Market Anticipation System | Kampala, Uganda
            </p>
          </CardHeader>
          <CardContent>
            {appState?.last_scan?.results?.map((r) => (
              <div key={r.symbol} className="flex justify-between border-b border-border py-2">
                <span className="font-bold text-[hsl(var(--tx-green))]">{r.symbol}</span>
                <span>{r.price || 'N/A'}</span>
                <span className={r.status === 'pattern' ? 'pattern-detected px-2 rounded' : 'no-pattern'}>
                  {r.status === 'pattern' ? `${r.pattern} (${r.confidence})` : 'IDLE'}
                </span>
              </div>
            ))}
            <div className="mt-4 text-muted-foreground text-sm">
              Next scan in: {countdown}s
            </div>
          </CardContent>
        </Card>

        {/* Active Alert */}
        {activeAlert && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle /> Active Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-bold">{activeAlert.symbol}</p>
              <p>{activeAlert.pattern} ({activeAlert.confidence})</p>
              <p className="text-sm text-muted-foreground">{activeAlert.explanation}</p>
              <div className="flex gap-2 mt-4">
                <Button onClick={() => handleAlertAction('Ignore')}>Ignore</Button>
                <Button onClick={() => handleAlertAction('Simulate')}>Simulate</Button>
                <Button onClick={() => handleAlertAction('Execute')}>Execute</Button>
                <Button onClick={() => handleAlertAction('Snooze')}>Snooze</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Latest Signal */}
        {appState?.last_signal && (
          <Card>
            <CardHeader>
              <CardTitle className="text-[hsl(var(--tx-green))] flex items-center gap-2">
                <TrendingUp /> Latest Signal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                {appState.last_signal.symbol} {appState.last_signal.timeframe}: {appState.last_signal.pattern} ({appState.last_signal.confidence})
              </div>
              <div className="text-xs text-muted-foreground">{appState.last_signal.time}</div>
            </CardContent>
          </Card>
        )}

        {/* Trade Outcome Logging */}
        <Card>
          <CardHeader>
            <CardTitle>Trade Outcome</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button variant="default" onClick={() => logOutcome('win')}>Win</Button>
              <Button variant="destructive" onClick={() => logOutcome('loss')}>Loss</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right column */}
      <div className="space-y-4">
        {/* TX Personality */}
        <Card>
          <CardHeader>
            <CardTitle>TX Personality</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{txPersonality}</p>
          </CardContent>
        </Card>

        {/* Pro Access */}
        <Card>
          <CardHeader>
            <CardTitle>🚀 PRO ACCESS</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Unlock real-time AI predictions:</p>
            <ul className="list-disc list-inside text-sm">
              <li>Telegram/WhatsApp alerts</li>
              <li>15+ assets including forex</li>
              <li>Historical backtesting</li>
            </ul>
            <p className="mt-2 font-bold">$5/month via USDT | DM @YourHandle</p>
          </CardContent>
        </Card>

        {/* Trader count */}
        <Card>
          <CardHeader>
            <CardTitle>Live Traders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              ⚡ <strong>{appState?.user_count || 0} traders</strong> live
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alert sound */}
      <audio ref={alertAudioRef} src="/alert.mp3" preload="auto" />
    </div>
  );
};

export default TXDashboardRich;
