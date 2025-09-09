import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TXPortfolioDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="tx-heading-xl">Portfolio</h1>
      <Card className="tx-terminal-glass">
        <CardHeader>
          <CardTitle>Performance Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Portfolio dashboard coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}