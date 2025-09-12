import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TXBuilderDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="tx-heading-xl">Strategy Builder</h1>
      <Card className="tx-terminal-glass">
        <CardHeader>
          <CardTitle>No-Code Strategy Builder</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Strategy builder coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}