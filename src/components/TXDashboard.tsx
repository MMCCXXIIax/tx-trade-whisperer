import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, Volume2, VolumeX, Loader2, Wifi, WifiOff, Play, Square } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { API_BASE } from '@/lib/api';
import { safeApiCall } from '@/lib/errorHandling';
import socketService from '@/lib/socket';
import { apiClient, socketHandlers, Alert as ApiAlert } from '@/lib/apiClient';

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
  id?: number;
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


const TXDashboard: React.FC = () => {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [userCount, setUserCount] = useState(12);
  const [countdown, setCountdown] = useState(180);
  const [activeAlert, setActiveAlert] = useState<Alert | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [txPersonality, setTxPersonality] = useState("Like that overprotective friend who won't let you make bad decisions... but for trading.");
  const [socketConnected, setSocketConnected] = useState(false);
  const [scanningActive, setScanningActive] = useState(false);
  
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

  // Initialize Socket.IO connection and alert sound
  useEffect(() => {
    // Initialize alert sound
    if (alertAudioRef.current) {
      alertAudioRef.current.src = '/alert.mp3'; // Use the audio file from public directory
    }

    // Connect to Socket.IO
    const socket = socketService.connect();
    
    // Set up socket event listeners using the new API client
    const unsubscribeAlert = socketHandlers.onNewAlert((alert: ApiAlert) => {
      console.log('🚨 New alert received via Socket.IO:', alert);
      // Convert API alert format to component format
      const formattedAlert: Alert = {
        symbol: alert.symbol,
        pattern: alert.pattern,
        confidence: typeof alert.confidence === 'number' ? `${alert.confidence}%` : String(alert.confidence),
        price: typeof alert.price === 'number' ? `$${alert.price}` : String(alert.price),
        time: alert.timestamp,
        explanation: alert.explanation,
        action: alert.risk_level
      };
      processNewAlert(formattedAlert);
    });

    const unsubscribeScan = socketHandlers.onScanUpdate((scan: any) => {
      console.log('📊 Scan update received via Socket.IO:', scan);
      setAppState(scan);
    });

    const unsubscribeMarket = socketHandlers.onMarketUpdate((data: any) => {
      console.log('💹 Market update received via Socket.IO:', data);
      // Update market data in app state
      if (data && appState) {
        setAppState(prev => prev ? { ...prev, market_data: data } : prev);
      }
    });

    // Monitor socket connection status
    const checkSocketStatus = () => {
      setSocketConnected(socketService.isConnected());
    };

    const statusInterval = setInterval(checkSocketStatus, 1000);
    checkSocketStatus(); // Initial check

    // Initialize alert sound
    if (alertAudioRef.current) {
      alertAudioRef.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcBT2a2+/QfCsELYbR7/DPQAUF';
    }

    return () => {
      clearInterval(statusInterval);
      // Clean up socket event listeners using the unsubscribe functions
      unsubscribeAlert();
      unsubscribeScan();
      unsubscribeMarket();
    };
  }, []);

  // Fetch scan data
  const fetchScanData = async () => {
    try {
      setIsLoading(true);
      // Use the new API client
      const response = await safeApiCall(apiClient.getMarketScan());
      if (response.success && response.data) {
        console.log('Scan data received:', response.data);
        setAppState(response.data);
      } else {
        console.warn('No scan data received from backend');
      }
    } catch (error) {
      console.error('Failed to fetch scan data:', error);
      toast({
        title: "Connection Error",
        description: "Unable to fetch market data. Backend may be starting up or experiencing issues.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check for active alerts
  const checkForAlerts = async () => {
    try {
      // Use the new API client
      const response = await safeApiCall(apiClient.getRecentAlerts(1));
      if (response.success && response.data && response.data.length > 0 && !activeAlert) {
        // Convert API alert format to component format
        const apiAlert = response.data[0];
        const formattedAlert: Alert = {
          symbol: apiAlert.symbol,
          pattern: apiAlert.pattern,
          confidence: typeof apiAlert.confidence === 'number' ? `${apiAlert.confidence}%` : String(apiAlert.confidence),
          price: typeof apiAlert.price === 'number' ? `$${apiAlert.price}` : String(apiAlert.price),
          time: apiAlert.timestamp,
          explanation: apiAlert.explanation,
          action: apiAlert.risk_level
        };
        processNewAlert(formattedAlert);
      }
    } catch (error) {
      console.error('Failed to check alerts:', error);
    }
  };

  // Process new alert (used by both polling and Socket.IO)
  const processNewAlert = (newAlert: Alert) => {
    if (activeAlert) return; // Don't override existing alert
    
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
  };

  // Handle alert response
  const handleAlert = async (action: string) => {
    if (!activeAlert) return;

    try {
      // Build payload with alert details and action
      const payload = {
        alert_id: activeAlert.id || 0,
        symbol: activeAlert.symbol,
        pattern: activeAlert.pattern,
        action: action
      };

      await safeApiCall(apiClient.handleAlertResponse(payload));

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
      toast({
        title: "Error",
        description: "Failed to process alert response. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Log trade outcome
  const logOutcome = async (outcome: string) => {
    try {
      // Get latest detection ID
      const detectionResponse = await safeApiCall(apiClient.getLatestDetectionId());
      
      if (detectionResponse.success && detectionResponse.data && detectionResponse.data.detection_id) {
        const result = await safeApiCall(apiClient.logTradeOutcome({
          detection_id: detectionResponse.data.detection_id,
          outcome: outcome
        }));
        
        if (result.success) {
          toast({
            title: "Outcome Logged",
            description: "Thank you for the feedback!",
          });
        }
      } else {
        // If no detection ID is available, send outcome with placeholder
        const result = await safeApiCall(apiClient.logTradeOutcome({
          detection_id: 'latest', // Special value that backend can interpret
          outcome: outcome
        }));
        
        if (result.success) {
          toast({
            title: "Outcome Logged",
            description: "Thank you for the feedback!",
          });
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

  // Live scanning controls
  const startScanning = async () => {
    try {
      // Use the new API client
      const response = await safeApiCall(apiClient.startScanner());
      if (response.success) {
        setScanningActive(true);
        toast({
          title: "Scanning Started",
          description: "Live market scanning is now active",
        });
      }
    } catch (error) {
      console.error('Failed to start scanning:', error);
      toast({
        title: "Error",
        description: "Failed to start live scanning",
        variant: "destructive"
      });
    }
  };

  const stopScanning = async () => {
    try {
      // Use the new API client
      const response = await safeApiCall(apiClient.stopScanner());
      if (response.success) {
        setScanningActive(false);
        toast({
          title: "Scanning Stopped",
          description: "Live market scanning has been paused",
        });
      }
    } catch (error) {
      console.error('Failed to stop scanning:', error);
      toast({
        title: "Error",
        description: "Failed to stop live scanning",
        variant: "destructive"
      });
    }
  };

  const checkScanStatus = async () => {
    try {
      // Use the new API client
      const response = await safeApiCall(apiClient.getScannerStatus());
      if (response.success && response.data) {
        setScanningActive(response.data.status === 'running');
      }
    } catch (error) {
      console.error('Failed to check scan status:', error);
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
    checkScanStatus();
    
    // Reduced polling interval since we have Socket.IO for real-time updates
    refreshIntervalRef.current = setInterval(() => {
      if (!socketConnected) {
        // Only poll if socket is disconnected
        checkForAlerts();
      }
      checkScanStatus();
    }, 15000);
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [socketConnected]);

  const getAssetStatusDisplay = (result: AssetResult) => {
    switch (result.status) {
      case 'pattern':
        return (
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span className="text-yellow-500 font-medium">{result.pattern || 'Pattern Detected'}</span>
            {result.confidence && <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full">{result.confidence}</span>}
          </div>
        );
      case 'no_pattern':
        return (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">No Pattern</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-red-500">{result.message || 'Error'}</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{result.status}</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden audio element for alerts */}
      <audio ref={alertAudioRef} />
      
      {/* Status Bar */}
      <Card className="terminal-container">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {socketConnected ? (
                  <Wifi className="w-5 h-5 text-green-500" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-500" />
                )}
                <span className={socketConnected ? "text-green-500" : "text-red-500"}>
                  {socketConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-muted-foreground">{userCount} users online</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                >
                  {soundEnabled ? (
                    <>
                      <Volume2 className="w-4 h-4" />
                      <span className="text-xs">Sound On</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-4 h-4" />
                      <span className="text-xs">Sound Off</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">Next Scan:</span>
                <span className="font-mono">{Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {scanningActive ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-500"
                    onClick={stopScanning}
                  >
                    <Square className="w-3 h-3" />
                    <span className="text-xs">Stop Scanning</span>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-500"
                    onClick={startScanning}
                  >
                    <Play className="w-3 h-3" />
                    <span className="text-xs">Start Scanning</span>
                  </Button>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={fetchScanData}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <TrendingUp className="w-4 h-4" />
                )}
                <span className="text-xs ml-1">Refresh</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Active Alert */}
      {activeAlert && (
        <Card className="terminal-container border-yellow-500/50 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="text-yellow-500 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              TX Alert: {activeAlert.pattern} Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Symbol:</span>
                    <span className="font-bold">{activeAlert.symbol}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-mono">{activeAlert.price}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Confidence:</span>
                    <span className="font-mono">{activeAlert.confidence}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Time:</span>
                    <span className="font-mono">{activeAlert.time}</span>
                  </div>
                </div>
                
                <div className="flex flex-col justify-between">
                  <div className="italic text-yellow-500/80 mb-4">
                    "{txPersonality}"
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="border-green-500 text-green-500 hover:bg-green-500/20"
                      onClick={() => handleAlert('EXECUTE')}
                    >
                      Execute Trade
                    </Button>
                    <Button
                      variant="outline"
                      className="border-blue-500 text-blue-500 hover:bg-blue-500/20"
                      onClick={() => handleAlert('SIMULATE')}
                    >
                      Paper Trade
                    </Button>
                    <Button
                      variant="outline"
                      className="border-orange-500 text-orange-500 hover:bg-orange-500/20"
                      onClick={() => handleAlert('SNOOZE')}
                    >
                      Snooze
                    </Button>
                    <Button
                      variant="outline"
                      className="border-gray-500 text-gray-500 hover:bg-gray-500/20"
                      onClick={() => handleAlert('IGNORE')}
                    >
                      Ignore
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-border pt-4">
                <div className="text-muted-foreground mb-2">Analysis:</div>
                <p className="text-sm">{activeAlert.explanation}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Scan Results */}
      <Card className="terminal-container">
        <CardHeader>
          <CardTitle className="text-primary">Market Scan Results</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !appState?.last_scan ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No scan data available. Backend may be starting up.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={fetchScanData}
              >
                Retry
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Last Scan: {appState.last_scan.time || 'Unknown'}
                </div>
                <div className="text-sm text-muted-foreground">
                  Scan ID: {appState.last_scan.id || 'Unknown'}
                </div>
              </div>
              
              <div className="border rounded-md">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Symbol</th>
                      <th className="text-left p-2">Price</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appState.last_scan.results.map((result, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-muted/20' : ''}>
                        <td className="p-2 font-medium">{result.symbol}</td>
                        <td className="p-2 font-mono">{result.price || '—'}</td>
                        <td className="p-2">{getAssetStatusDisplay(result)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Feedback Section */}
      <Card className="terminal-container">
        <CardHeader>
          <CardTitle className="text-primary">Trade Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            Did the last alert lead to a profitable trade? Your feedback helps improve TX's pattern detection.
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-green-500 text-green-500 hover:bg-green-500/20"
              onClick={() => logOutcome('win')}
            >
              Profitable
            </Button>
            <Button
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-500/20"
              onClick={() => logOutcome('loss')}
            >
              Unprofitable
            </Button>
            <Button
              variant="outline"
              onClick={() => logOutcome('neutral')}
            >
              Neutral/Didn't Trade
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TXDashboard;