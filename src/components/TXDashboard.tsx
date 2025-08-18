// src/components/TXDashboard.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, Volume2, VolumeX } from 'lucide-react';
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

// ✅ Use env var for API base — set VITE_API_BASE_URL in Render env vars
const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

const TXDashboard: React.FC = () => {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [userCount] = useState(12);
  const [countdown, setCountdown] = useState(120);
  const [activeAlert, setActiveAlert] = useState<Alert | null>(null);
  const [lastAlertId, setLastAlertId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [txPersonality, setTxPersonality] = useState(
    "Like that overprotective friend who won't let you make bad decisions... but for trading."
  );

  const alertAudioRef = useRef<HTMLAudioElement>(null);
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval>>();

  const txPersonalities = [
    "I told you to watch this one! 👀",
    "See? I'm always watching your back.",
    "This is why you need me... *sips tea*",
    "Another pattern caught! You're welcome.",
    "I'm like Velma but for your portfolio 🔍",
    "Boom! Called it before anyone else 💥",
    "While you were sleeping, I was working 💤→📈",
  ];

  // Initialize alert sound
  useEffect(() => {
    if (alertAudioRef.current) {
      alertAudioRef.current.src =
        'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcBT2a2+/QfCsELYbR7/DPQAUF';
    }
  }, []);

  const safeFetch = async <T,>(
    url: string,
    options?: RequestInit,
    retries = 2
  ): Promise<T | null> => {
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(res.statusText);
      return res.json();
    } catch (err) {
      console.error(`Fetch failed for ${url}:`, err);
      if (retries > 0) {
        return safeFetch<T>(url, options, retries - 1);
      }
      toast({
        title: "Connection Error",
        description: "Some data may be out of date.",
        variant: "destructive",
      });
      return null;
    }
  };

  const fetchScanData = async () => {
    const data = await safeFetch<AppState>(`${API_BASE}/api/scan`);
    if (data) {
      setAppState(data);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  };

  const checkForAlerts = async () => {
    const data = await safeFetch<{ alerts: Alert[] }>(
      `${API_BASE}/api/get_active_alerts`
    );
    if (data?.alerts?.length) {
      const newAlert = data.alerts[0];
      if (newAlert.symbol + newAlert.time !== lastAlertId) {
        setActiveAlert(newAlert);
        setLastAlertId(newAlert.symbol + newAlert.time);

        if (soundEnabled && alertAudioRef.current) {
          alertAudioRef.current
            .play()
            .catch(() => console.log('Audio play failed'));
        }

        setTxPersonality(
          txPersonalities[Math.floor(Math.random() * txPersonalities.length)]
        );

        toast({
          title: "🚨 TX ALERT ACTIVATED",
          description: `${newAlert.symbol}: ${newAlert.pattern} (${newAlert.confidence})`,
          duration: 10000,
        });
      }
    }
  };

  const handleAlert = async (action: string) => {
    if (!activeAlert) return;

    await safeFetch(`${API_BASE}/api/handle_alert_response`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });

    const responses = {
      IGNORE: "Fine, ignore me. I'll just be here... watching... 😒",
      SIMULATE: "Smart choice! Let's paper trade this first 📊",
      EXECUTE: "YOLO! I hope you know what you're doing 🚀",
      SNOOZE: "Okay, but I'll be back in 5 minutes. SET YOUR ALARM ⏰",
    };

    setTxPersonality(responses[action as keyof typeof responses] || txPersonalities[0]);
    setActiveAlert(null);

    toast({ title: "Alert Response Recorded", description: `Action: ${action}` });
  };

  const logOutcome = async (outcome: string) => {
    const detectionData = await safeFetch<{ detection_id?: number }>(
      `${API_BASE}/api/get_latest_detection_id`
    );
    if (detectionData?.detection_id) {
      const res = await safeFetch(
        `${API_BASE}/api/log_outcome`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            detection_id: detectionData.detection_id,
            outcome,
          }),
        }
      );
      if (res) {
        toast({ title: "Outcome Logged", description: "Thank you for the feedback!" });
      }
    } else {
      toast({
        title: "Error",
        description: "No recent detection to log outcome for.",
        variant: "destructive",
      });
    }
  };

  // Countdown timer
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

  // Initial data fetch + polling for alerts
  useEffect(() => {
    fetchScanData();
    refreshIntervalRef.current = setInterval(checkForAlerts, 10000);
    return () => refreshIntervalRef.current && clearInterval(refreshIntervalRef.current);
  }, []);

  const getAssetStatusDisplay = (result: AssetResult) => {
    switch (result.status) {
      case 'pattern':
        return <span className="pattern-detected">{result.pattern} ({result.confidence})</span>;
      case 'error':
        return <span className="status-error">ERROR</span>;
      default:
        return <span className="status-idle">IDLE</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="terminal-container p-8">
          <div className="text-primary text-xl font-bold">TX LOADING...</div>
          <div className="text-muted-foreground mt-2">Initializing trading intelligence...</div>
        </div>
      </div>
    );
  }

  return (
    // --- UI REMAINS UNCHANGED ---
    // (Keep your existing JSX structure from here down)
  );
};

export default TXDashboard;
