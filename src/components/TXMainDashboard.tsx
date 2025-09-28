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
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <TXOverviewDashboard />;
      case 'trading':
        return <TXTradingDashboard />;
      case 'alerts':
        return <TXPatternDashboard />;
      case 'logs':
        return <TXLogsDashboard />;
      case 'paper-trading':
        return <TXPortfolioDashboard />;
      case 'performance':
        return <TXBacktestDashboard />;
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