import { useEffect, useRef, memo } from 'react';
import { Card } from '@/components/ui/card';

interface TradingViewChartProps {
  symbol: string;
  interval?: string;
  theme?: 'light' | 'dark';
  height?: number;
}

function TradingViewChart({ 
  symbol, 
  interval = '1H', 
  theme = 'dark',
  height = 500 
}: TradingViewChartProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    // Clear previous widget
    container.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol.includes(':') ? symbol : `BINANCE:${symbol}USDT`,
      interval,
      timezone: 'Etc/UTC',
      theme,
      style: '1',
      locale: 'en',
      enable_publishing: false,
      backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0)' : 'rgba(255, 255, 255, 0)',
      gridColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      container_id: 'tradingview_chart',
      studies: [
        'STD;SMA',
        'STD;MACD',
        'STD;RSI',
        'STD;Volume',
      ],
    });

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [symbol, interval, theme]);

  return (
    <Card className="p-0 overflow-hidden">
      <div 
        id="tradingview_chart" 
        ref={container} 
        style={{ height: `${height}px` }}
        className="w-full"
      />
    </Card>
  );
}

export default memo(TradingViewChart);
