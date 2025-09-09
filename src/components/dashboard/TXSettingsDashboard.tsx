import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TXSettingsDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="tx-heading-xl">Settings</h1>
      <Card className="tx-terminal-glass">
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Settings panel coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}