import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi } from 'lightweight-charts';
import { useCandles } from '@/hooks/useCandles';

interface CandlestickChartProps {
  symbol: string;
  apiBase: string;
  height?: number;
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({ symbol, apiBase, height = 280 }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const { candles } = useCandles({ apiBase, symbol, interval: '1m', limit: 200, pollMs: 10000 });

  useEffect(() => {
    if (!containerRef.current) return;

    const styles = getComputedStyle(document.documentElement);
    const textColor = styles.getPropertyValue('--muted-foreground').trim() || 'hsl(var(--muted-foreground))';
    const gridColor = styles.getPropertyValue('--border').trim() || 'hsl(var(--border))';

    const chart = createChart(containerRef.current, {
      height,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      crosshair: { mode: 0 },
      rightPriceScale: {
        borderColor: gridColor,
      },
      timeScale: { borderColor: gridColor, timeVisible: true, secondsVisible: false },
      localization: {
        priceFormatter: (p: number) => `$${p.toLocaleString()}`,
      },
    });
    chartRef.current = chart;

    const series = chart.addCandlestickSeries({
      upColor: 'hsl(var(--tx-green))',
      downColor: 'hsl(var(--tx-red))',
      wickUpColor: 'hsl(var(--tx-green))',
      wickDownColor: 'hsl(var(--tx-red))',
      borderUpColor: 'hsl(var(--tx-green))',
      borderDownColor: 'hsl(var(--tx-red))',
    });

    // initial size observer
    const ro = new ResizeObserver(() => {
      if (!containerRef.current || !chartRef.current) return;
      chartRef.current.applyOptions({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight });
      chart.timeScale().fitContent();
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [height]);

  useEffect(() => {
    if (!chartRef.current) return;
    const series = chartRef.current.getSeries()[0] as any; // only series
    if (!series) return;
    if (candles.length === 0) {
      series.setData([]);
      return;
    }
    series.setData(candles.map(c => ({ time: c.time, open: c.open, high: c.high, low: c.low, close: c.close })));
    chartRef.current.timeScale().fitContent();
  }, [candles]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default CandlestickChart;
