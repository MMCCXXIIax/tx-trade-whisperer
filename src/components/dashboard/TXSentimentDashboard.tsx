import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TXSentimentDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="tx-heading-xl">Sentiment Analysis</h1>
      <Card className="tx-terminal-glass">
        <CardHeader>
          <CardTitle>Market Sentiment</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Sentiment analysis coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}