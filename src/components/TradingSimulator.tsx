import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TradingSimulator: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="terminal-container">
        <CardHeader>
          <CardTitle className="text-primary">Trading Simulator</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Trading simulator component - temporarily disabled during Flask API integration.</p>
          <p className="text-sm mt-2">This will be restored in the next update.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingSimulator;