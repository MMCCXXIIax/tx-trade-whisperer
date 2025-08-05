import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertTriangle } from 'lucide-react';

interface TradingViewProps {
  symbol: string;
  alerts: any[];
  onAlertAction: (action: string) => void;
}

const TradingView: React.FC<TradingViewProps> = ({ symbol, alerts, onAlertAction }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // TradingView widget script
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      script.async = true;
      script.innerHTML = JSON.stringify({
        autosize: true,
        symbol: `BINANCE:${symbol.toUpperCase()}USDT`,
        interval: "5",
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        toolbar_bg: "#121212",
        enable_publishing: false,
        hide_top_toolbar: false,
        hide_legend: false,
        save_image: false,
        container_id: "tradingview_chart"
      });

      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(script);
    }
  }, [symbol]);

  return (
    <div className="space-y-4">
      {/* Active Alerts Panel */}
      {alerts.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              TX ALERT ACTIVE
              <Badge variant="destructive">{alerts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.slice(0, 2).map((alert, index) => (
              <div key={index} className="bg-background/50 p-3 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-semibold text-primary">{alert.symbol}</span>
                    <span className="ml-2 text-sm text-muted-foreground">{alert.pattern}</span>
                  </div>
                  <Badge variant="secondary">{alert.confidence}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{alert.explanation}</p>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onAlertAction('IGNORE')}
                  >
                    😴 Ignore
                  </Button>
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => onAlertAction('SIMULATE')}
                  >
                    📊 Paper Trade
                  </Button>
                  <Button 
                    size="sm" 
                    variant="default"
                    onClick={() => onAlertAction('EXECUTE')}
                  >
                    ⚡ Execute
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* TradingView Chart */}
      <Card className="h-[600px]">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {symbol.toUpperCase()}/USDT Chart
            <Badge variant="outline">Live</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 h-[500px]">
          <div 
            ref={containerRef}
            id="tradingview_chart"
            className="h-full w-full"
          />
        </CardContent>
      </Card>

      {/* TX Trading Controls */}
      <Card>
        <CardHeader>
          <CardTitle>TX Demo Trading</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button size="sm" variant="outline">Buy $100</Button>
            <Button size="sm" variant="outline">Buy $250</Button>
            <Button size="sm" variant="outline">Buy $500</Button>
            <Button size="sm" variant="outline">Buy $1000</Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Demo mode: No real money at risk
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingView;