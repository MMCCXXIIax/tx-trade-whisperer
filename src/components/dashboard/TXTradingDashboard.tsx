import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TXTradingDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="tx-heading-xl">Paper Trading</h1>
      <Card className="tx-terminal-glass">
        <CardHeader>
          <CardTitle>Trading Simulator</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Paper trading interface coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}