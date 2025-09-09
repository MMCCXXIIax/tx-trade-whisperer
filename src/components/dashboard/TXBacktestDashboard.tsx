import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TXBacktestDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="tx-heading-xl">Backtesting Engine</h1>
      <Card className="tx-terminal-glass">
        <CardHeader>
          <CardTitle>Strategy Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Backtesting interface coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}