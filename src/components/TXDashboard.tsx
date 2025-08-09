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

const API_BASE = 'https://446d0049-85a3-42b8-af8d-1b8de4387858-00-3abv9kw983fr2.janeway.replit.dev:8080';

const TXDashboard: React.FC = () => {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [userCount, setUserCount] = useState(12);
  const [countdown, setCountdown] = useState(120);
  const [activeAlert, setActiveAlert] = useState<Alert | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [txPersonality, setTxPersonality] = useState("Like that overprotective friend who won't let you make bad decisions... but for trading.");
  
  const alertAudioRef = useRef<HTMLAudioElement>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout>();
  const countdownIntervalRef = useRef<NodeJS.Timeout>();

  const txPersonalities = [
    "I told you to watch this one! 👀",
    "See? I'm always watching your back.",
    "This is why you need me... *sips tea*",
    "Another pattern caught! You're welcome.",
    "I'm like Velma but for your portfolio 🔍",
    "Boom! Called it before anyone else 💥",
    "While you were sleeping, I was working 😴→📈"
  ];

  // Initialize alert sound
  useEffect(() => {
    if (alertAudioRef.current) {
      alertAudioRef.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcBT2a2+/QfCsELYbR7/DPQAUF';
    }
  }, []);

  // Fetch scan data
  const fetchScanData = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/scan`);
      if (response.ok) {
        const data = await response.json();
        setAppState(data);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch scan data:', error);
      setIsLoading(false);
    }
  };

  // Check for active alerts
  const checkForAlerts = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/get_active_alerts`);
      if (response.ok) {
        const data = await response.json();
        if (data.alerts && data.alerts.length > 0 && !activeAlert) {
          const newAlert = data.alerts[0];
          setActiveAlert(newAlert);
          
          // Play alert sound
          if (soundEnabled && alertAudioRef.current) {
            alertAudioRef.current.play().catch(e => console.log('Audio play failed'));
          }
          
          // Update TX personality
          const randomPersonality = txPersonalities[Math.floor(Math.random() * txPersonalities.length)];
          setTxPersonality(randomPersonality);
          
          // Show toast notification
          toast({
            title: "🚨 TX ALERT ACTIVATED",
            description: `${newAlert.symbol}: ${newAlert.pattern} (${newAlert.confidence})`,
            duration: 10000,
          });
        }
      }
    } catch (error) {
      console.error('Failed to check alerts:', error);
    }
  };

  // Handle alert response
  const handleAlert = async (action: string) => {
    if (!activeAlert) return;

    try {
      await fetch(`${API_BASE}/api/handle_alert_response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      // Update TX personality based on action
      const responses = {
        'IGNORE': "Fine, ignore me. I'll just be here... watching... 😒",
        'SIMULATE': "Smart choice! Let's paper trade this first 📊",
        'EXECUTE': "YOLO! I hope you know what you're doing 🚀",
        'SNOOZE': "Okay, but I'll be back in 5 minutes. SET YOUR ALARM ⏰"
      };
      
      setTxPersonality(responses[action as keyof typeof responses] || txPersonalities[0]);
      setActiveAlert(null);
      
      toast({
        title: "Alert Response Recorded",
        description: `Action: ${action}`,
      });
    } catch (error) {
      console.error('Failed to handle alert:', error);
    }
  };

  // Log trade outcome
  const logOutcome = async (outcome: string) => {
    try {
      // Get latest detection ID
      const detectionResponse = await fetch(`${API_BASE}/api/get_latest_detection_id`);
      if (detectionResponse.ok) {
        const detectionData = await detectionResponse.json();
        
        if (detectionData.detection_id) {
          const response = await fetch(`${API_BASE}/api/log_outcome`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              detection_id: detectionData.detection_id,
              outcome: outcome
            })
          });
          
          if (response.ok) {
            toast({
              title: "Outcome Logged",
              description: "Thank you for the feedback!",
            });
          }
        }
      }
    } catch (error) {
      console.error('Failed to log outcome:', error);
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
      setCountdown(prev => {
        if (prev <= 1) {
          fetchScanData();
          return 180;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  // Initial data fetch and periodic updates
  useEffect(() => {
    fetchScanData();
    
    refreshIntervalRef.current = setInterval(() => {
      checkForAlerts();
    }, 10000);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  const getAssetStatusDisplay = (result: AssetResult) => {
    switch (result.status) {
      case 'pattern':
        return (
          <span className="pattern-detected">
            {result.pattern} ({result.confidence})
          </span>
        );
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
    <div className="min-h-screen bg-background p-4 md:p-6">
      <audio ref={alertAudioRef} preload="auto" />
      
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="terminal-container">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-primary text-2xl font-bold tracking-tight">
                  TX PREDICTIVE INTELLIGENCE
                </CardTitle>
                <p className="text-muted-foreground text-sm mt-1">
                  AI-Powered Market Anticipation System | Kampala, Uganda
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="text-muted-foreground hover:text-primary"
                >
                  {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                </Button>
                <div className="text-right">
                  <div className="text-primary font-bold">⚡ {userCount} traders live</div>
                  <div className="text-muted-foreground text-sm">
                    Next scan: {countdown}s
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Alert Interface */}
        {activeAlert && (
          <Card className="alert-glow">
            <CardHeader>
              <CardTitle className="text-destructive text-lg flex items-center gap-2">
                <AlertTriangle className="animate-pulse" />
                🚨 TX ALERT ACTIVATED
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm">
                  <div className="font-bold">{activeAlert.symbol}: {activeAlert.pattern} ({activeAlert.confidence})</div>
                  <div className="text-muted-foreground">Price: {activeAlert.price} | Time: {activeAlert.time}</div>
                  <div className="mt-2 text-accent-foreground">{activeAlert.explanation}</div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAlert('IGNORE')}
                    className="tx-button tx-button-secondary"
                  >
                    😴 Ignore
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleAlert('SIMULATE')}
                    className="tx-button tx-button-accent"
                  >
                    📊 Simulate
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleAlert('EXECUTE')}
                    className="tx-button tx-button-primary"
                  >
                    ⚡ Execute
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAlert('SNOOZE')}
                    className="tx-button border-orange-500 text-orange-500"
                  >
                    ⏰ Snooze 5m
                  </Button>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Suggested amounts: $100 | $250 | $500 | $1000
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Asset Grid */}
        <Card className="terminal-container">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <TrendingUp />
              Market Monitor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {appState?.last_scan?.results?.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 px-2 border-b border-border last:border-b-0"
                >
                  <span className="font-bold text-primary min-w-0 flex-1">
                    {result.symbol}
                  </span>
                  <span className="price-display text-center flex-1">
                    {result.price || 'N/A'}
                  </span>
                  <div className="text-right min-w-0 flex-1">
                    {getAssetStatusDisplay(result)}
                  </div>
                </div>
              ))}
            </div>
            
            {appState?.last_scan && (
              <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                Scan #{appState.last_scan.id} completed at {appState.last_scan.time}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Latest Signal */}
        {appState?.last_signal && (
          <Card className="terminal-container border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary text-sm">🚨 Latest Signal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="font-bold">
                  {appState.last_signal.symbol} {appState.last_signal.timeframe}: {appState.last_signal.pattern} ({appState.last_signal.confidence})
                </div>
                <div className="text-xs text-muted-foreground">
                  {appState.last_signal.time}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Trade Outcome Buttons */}
        <Card className="terminal-container">
          <CardContent className="pt-6">
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => logOutcome('win')}
                className="tx-button tx-button-primary"
              >
                ✅ Trade Won
              </Button>
              <Button
                onClick={() => logOutcome('loss')}
                variant="destructive"
                className="tx-button tx-button-destructive"
              >
                ❌ Trade Lost
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* TX Personality */}
        <Card className="terminal-container border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="font-bold text-primary">💭 TX Says:</div>
              <div className="italic text-muted-foreground">
                "{txPersonality}"
              </div>
            </div>
          </CardContent>
        </Card>

        {/* TX Pro Access */}
        <Card className="bg-black border-primary/30">
          <CardHeader>
            <CardTitle className="text-primary">🚀 TX PRO ACCESS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">Unlock the full "Jealous Ex" experience:</p>
            <ul className="space-y-2 text-sm">
              <li>🔔 Multi-device sound alerts (phone, tablet, desktop)</li>
              <li>📱 Telegram/WhatsApp notifications</li>
              <li>🎯 Strategy Builder (no-code)</li>
              <li>📊 15+ assets including forex</li>
              <li>🧠 AI sentiment overlay</li>
              <li>📈 Performance analytics & journaling</li>
            </ul>
            <div className="space-y-2">
              <p className="font-bold text-primary">$24.99/month flat rate</p>
              <p className="text-xs text-muted-foreground">No profit sharing, pure SaaS</p>
              <p className="text-sm">DM on IG @robert.manejk</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          TX Engine v0.9 | Data: Alpha Vantage
        </div>
      </div>
    </div>
  );
};

export default TXDashboard;
