import React from 'react';
import TradingSimulator from '@/components/TradingSimulator';

export function TXTradingDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="tx-heading-xl">Paper Trading</h1>
      <TradingSimulator />
    </div>
  );
}