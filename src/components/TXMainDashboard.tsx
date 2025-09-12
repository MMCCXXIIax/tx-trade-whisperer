import React, { useState } from 'react';
import { TXAppShell } from '@/components/layout/TXAppShell';
import { TXOverviewDashboard } from '@/components/dashboard/TXOverviewDashboard';
import { TXPatternDashboard } from '@/components/dashboard/TXPatternDashboard';
import { TXTradingDashboard } from '@/components/dashboard/TXTradingDashboard';
import { TXSentimentDashboard } from '@/components/dashboard/TXSentimentDashboard';
import { TXBacktestDashboard } from '@/components/dashboard/TXBacktestDashboard';
import { TXBuilderDashboard } from '@/components/dashboard/TXBuilderDashboard';
import { TXLogsDashboard } from '@/components/dashboard/TXLogsDashboard';
import { TXPortfolioDashboard } from '@/components/dashboard/TXPortfolioDashboard';
import { TXSettingsDashboard } from '@/components/dashboard/TXSettingsDashboard';

export default function TXMainDashboard() {
  const [currentPage, setCurrentPage] = useState('overview');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'overview':
        return <TXOverviewDashboard />;
      case 'patterns':
        return <TXPatternDashboard />;
      case 'trading':
        return <TXTradingDashboard />;
      case 'sentiment':
        return <TXSentimentDashboard />;
      case 'backtest':
        return <TXBacktestDashboard />;
      case 'builder':
        return <TXBuilderDashboard />;
      case 'logs':
        return <TXLogsDashboard />;
      case 'portfolio':
        return <TXPortfolioDashboard />;
      case 'settings':
        return <TXSettingsDashboard />;
      default:
        return <TXOverviewDashboard />;
    }
  };

  return (
    <TXAppShell currentPage={currentPage} onPageChange={setCurrentPage}>
      <div className="tx-fadeIn">
        {renderCurrentPage()}
      </div>
    </TXAppShell>
  );
}