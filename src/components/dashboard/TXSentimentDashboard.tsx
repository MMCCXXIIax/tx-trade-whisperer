import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SentimentAnalysis from '@/components/SentimentAnalysis';
import { apiClient } from '@/lib/apiClient';

export function TXSentimentDashboard() {
  const [symbol, setSymbol] = useState('bitcoin');
  const [assets, setAssets] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await apiClient.getAssetsList();
      const list = Array.isArray(res?.data) ? res.data : [];
      const syms = list.map((a:any) => a.symbol || a.ticker).filter(Boolean);
      if (syms.length) setAssets(syms);
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="tx-heading-xl">Sentiment Analysis</h1>

      <Card className="tx-terminal-glass">
        <CardHeader>
          <CardTitle>Select Asset</CardTitle>
        </CardHeader>
        <CardContent className="w-60">
          <Select value={symbol} onValueChange={setSymbol}>
            <SelectTrigger>
              <SelectValue placeholder="Select Asset" />
            </SelectTrigger>
            <SelectContent>
              {(assets.length ? assets : ['bitcoin','ethereum','solana']).map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <SentimentAnalysis symbol={symbol} />
    </div>
  );
}