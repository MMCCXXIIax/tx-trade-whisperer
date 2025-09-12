import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TXPatternDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="tx-heading-xl">Pattern Detection</h1>
      <Card className="tx-terminal-glass">
        <CardHeader>
          <CardTitle>AI Pattern Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Pattern detection interface coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}