import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TXLogsDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="tx-heading-xl">Detection Logs</h1>
      <Card className="tx-terminal-glass">
        <CardHeader>
          <CardTitle>Pattern Detection History</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Detection logs coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}