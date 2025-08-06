import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  BarChart3,
  Zap,
  Eye
} from 'lucide-react';

interface TradingViewProps {
  alerts?: any[];
  lastSignal?: any;
  onAlertAction?: (action: string) => void;
}

const TradingView: React.FC<TradingViewProps> = ({ 
  alerts = [], 
  lastSignal,
  onAlertAction 
}) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSD');
  const [txComments, setTxComments] = useState<string[]>([]);
  const widgetRef = useRef<HTMLDivElement>(null);

  const symbols = [
    { symbol: 'BTCUSD', name: 'Bitcoin' },
    { symbol: 'ETHUSD', name: 'Ethereum' },
    { symbol: 'SOLUSD', name: 'Solana' },
    { symbol: 'AAPL', name: 'Apple' },
    { symbol: 'TSLA', name: 'Tesla' }
  ];

  const txPersonalities = [
    "👀 I see a pattern forming... watch this closely!",
    "🎯 This looks familiar... remember last Tuesday?",
    "⚡ Volume spike detected! TX senses opportunity.",
    "🧠 My neural networks are tingling...",
    "📊 The charts don't lie, and neither do I.",
    "🔍 Zoom in here... see that resistance level?",
    "💡 Pro tip: This usually leads to...",
    "🚨 Alert mode activated! Pay attention!"
  ];

  // Simulate TX adding commentary
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every interval
        const randomComment = txPersonalities[Math.floor(Math.random() * txPersonalities.length)];
        setTxComments(prev => [
          ...prev.slice(-4), // Keep only last 4 comments
          randomComment
        ]);
      }
    }, 15000); // Every 15 seconds

    return () => clearInterval(interval);
  }, []);

  // Load TradingView widget
  useEffect(() => {
    if (widgetRef.current) {
      // Clear previous widget
      widgetRef.current.innerHTML = '';

      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      script.async = true;
      script.innerHTML = JSON.stringify({
        autosize: true,
        symbol: selectedSymbol,
        interval: "5",
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        toolbar_bg: "#1e1e1e",
        enable_publishing: false,
        hide_top_toolbar: false,
        hide_legend: false,
        save_image: false,
        container_id: "tradingview_widget"
      });

      widgetRef.current.appendChild(script);
    }
  }, [selectedSymbol]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="terminal-container">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-tx-green flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              TX Trading View
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-muted-foreground hover:text-primary"
              >
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </Button>
              <Badge variant="outline" className="bg-tx-green/20 text-tx-green border-tx-green/30">
                <Eye className="w-3 h-3 mr-1" />
                TX Watching
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {symbols.map((sym) => (
              <Button
                key={sym.symbol}
                variant={selectedSymbol === sym.symbol ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSymbol(sym.symbol)}
                className={
                  selectedSymbol === sym.symbol 
                    ? "bg-tx-green text-tx-black hover:bg-tx-green/90" 
                    : "hover:border-tx-green/50"
                }
              >
                {sym.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* TradingView Chart */}
        <div className="lg:col-span-3">
          <Card className="terminal-container h-[600px]">
            <CardContent className="p-0 h-full">
              <div 
                ref={widgetRef}
                id="tradingview_widget"
                className="h-full w-full"
              />
            </CardContent>
          </Card>
        </div>

        {/* TX Intelligence Panel */}
        <div className="space-y-4">
          {/* Live Alerts */}
          {alerts.length > 0 && (
            <Card className="terminal-container alert-glow">
              <CardHeader>
                <CardTitle className="text-destructive text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 animate-pulse" />
                  Live Alert
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <div className="font-bold">{alerts[0].symbol}: {alerts[0].pattern}</div>
                    <div className="text-muted-foreground">Confidence: {alerts[0].confidence}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAlertAction?.('IGNORE')}
                      className="text-xs"
                    >
                      Ignore
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onAlertAction?.('EXECUTE')}
                      className="text-xs bg-tx-green text-tx-black hover:bg-tx-green/90"
                    >
                      Execute
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Last Signal */}
          {lastSignal && (
            <Card className="terminal-container border-tx-green/30">
              <CardHeader>
                <CardTitle className="text-tx-green text-sm">Latest Signal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="font-bold">{lastSignal.symbol} {lastSignal.timeframe}</div>
                  <div className="text-muted-foreground">{lastSignal.pattern}</div>
                  <Badge variant="outline" className="text-xs">
                    {lastSignal.confidence}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TX Commentary */}
          <Card className="terminal-container">
            <CardHeader>
              <CardTitle className="text-tx-green text-sm flex items-center gap-2">
                <Zap className="w-4 h-4" />
                TX Live Commentary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {txComments.length === 0 ? (
                  <p className="text-muted-foreground text-xs italic">
                    TX is analyzing the charts...
                  </p>
                ) : (
                  txComments.map((comment, index) => (
                    <div
                      key={index}
                      className="text-xs p-2 bg-tx-gray/30 rounded border-l-2 border-tx-green/50 animate-fade-in"
                    >
                      {comment}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="terminal-container">
            <CardHeader>
              <CardTitle className="text-tx-green text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs hover:border-tx-green/50"
                >
                  Set Price Alert
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs hover:border-tx-blue/50"
                >
                  Paper Trade
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs hover:border-tx-orange/50"
                >
                  Risk Calculator
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TradingView;