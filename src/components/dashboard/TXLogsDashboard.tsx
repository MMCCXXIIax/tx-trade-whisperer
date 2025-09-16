import React from 'react';
import DetectionLogs from '@/components/DetectionLogs';

export function TXLogsDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="tx-heading-xl">Detection Logs</h1>
      <DetectionLogs />
    </div>
  );
}