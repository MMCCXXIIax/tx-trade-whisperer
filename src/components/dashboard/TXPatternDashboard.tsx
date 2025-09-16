import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CandlestickChart from '@/components/charts/CandlestickChart';
import { apiClient } from '@/lib/apiClient';

export function TXPatternDashboard() {
  const [symbol, setSymbol] = useState('bitcoin');
  const [patterns, setPatterns] = useState<string[]>([]);
  const [detections, setDetections] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const assets = await apiClient.getAssetsList();
      const list = Array.isArray(assets?.data) ? assets.data : [];
      if (list.length) setSymbol((list[0] as any).symbol || (list[0] as any).ticker || symbol);
      const pat = await apiClient.getPatternsList();
      setPatterns((pat?.data as string[]) || []);
    };
    load();
  }, []);

  useEffect(() => {
    const loadDetections = async () => {
      const resp = await apiClient.detectEnhanced({ symbol });
      const items = Array.isArray(resp?.data) ? resp?.data : (resp?.data?.detections || []);
      setDetections(items);
    };
    if (symbol) loadDetections();
  }, [symbol]);

  return (
    <div className="space-y-6">
      <h1 className="tx-heading-xl">Pattern Detection</h1>

      <Card className="tx-terminal-glass">
        <CardHeader>
          <CardTitle>Asset & Pattern Selection</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="w-60">
            <Select value={symbol} onValueChange={setSymbol}>
              <SelectTrigger>
                <SelectValue placeholder="Select Asset" />
              </SelectTrigger>
              <SelectContent>
                {/* Basic list; assets list is large, so we keep symbol control simple */}
                <SelectItem value="bitcoin">bitcoin</SelectItem>
                <SelectItem value="ethereum">ethereum</SelectItem>
                <SelectItem value="solana">solana</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="tx-terminal-glass">
        <CardHeader>
          <CardTitle>Live Candles — {symbol.toUpperCase?.() || symbol}</CardTitle>
        </CardHeader>
        <CardContent style={{ height: 320 }}>
          <CandlestickChart symbol={symbol} />
        </CardContent>
      </Card>

      <Card className="tx-terminal-glass">
        <CardHeader>
          <CardTitle>Recent Detections</CardTitle>
        </CardHeader>
        <CardContent>
          {detections.length === 0 ? (
            <div className="text-muted-foreground">No detections yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {detections.slice(0, 12).map((d, i) => (
                <div key={i} className="border border-border rounded p-3">
                  <div className="font-bold text-sm">{d.pattern || d.name}</div>
                  <div className="text-xs text-muted-foreground">{new Date(d.timestamp || Date.now()).toLocaleString()}</div>
                  <div className="text-sm">Confidence: {Math.round(d.confidence ?? 0)}%</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}