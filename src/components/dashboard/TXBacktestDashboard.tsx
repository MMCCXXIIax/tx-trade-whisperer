import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/apiClient';

export function TXBacktestDashboard() {
  const [symbol, setSymbol] = useState('bitcoin');
  const [pattern, setPattern] = useState('Bullish Engulfing');
  const [days, setDays] = useState(90);
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const runBacktest = async () => {
    setLoading(true);
    try {
      const res = await apiClient.backtestPattern({ pattern, symbol, days });
      setResult(res?.data || null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="tx-heading-xl">Backtesting Engine</h1>

      <Card className="tx-terminal-glass">
        <CardHeader>
          <CardTitle>Run Pattern Backtest</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input value={symbol} onChange={(e)=>setSymbol(e.target.value)} placeholder="Symbol (e.g. bitcoin)" />
            <Input value={pattern} onChange={(e)=>setPattern(e.target.value)} placeholder="Pattern name" />
            <Input type="number" value={days} onChange={(e)=>setDays(Number(e.target.value)||90)} placeholder="Lookback days" />
          </div>
          <Button onClick={runBacktest} disabled={loading}>{loading ? 'Running...' : 'Run Backtest'}</Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="tx-terminal-glass">
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}