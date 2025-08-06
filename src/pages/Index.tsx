import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TXDashboard from '@/components/TXDashboard';
import TXNavigation from '@/components/TXNavigation';
import TradingView from '@/components/TradingView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Settings, Bell, DollarSign } from 'lucide-react';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [userData, setUserData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has completed onboarding
    const storedUser = localStorage.getItem('tx_user');
    if (!storedUser) {
      navigate('/');
      return;
    }
    setUserData(JSON.parse(storedUser));
  }, [navigate]);

  if (!userData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-tx-green font-bold text-xl">TX</div>
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <TXDashboard />;
      case 'trading':
        return <TradingView />;
      case 'alerts':
        return <AlertsPage />;
      case 'performance':
        return <PerformancePage />;
      case 'settings':
        return <SettingsPage userData={userData} />;
      default:
        return <TXDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 space-y-4">
        <TXNavigation 
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          userName={userData.name}
        />
        {renderCurrentPage()}
      </div>
    </div>
  );
};

// Placeholder components for other pages
const AlertsPage = () => (
  <Card className="terminal-container">
    <CardHeader>
      <CardTitle className="text-tx-green flex items-center gap-2">
        <Bell className="w-5 h-5" />
        Alert Center
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-center py-12">
        <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-bold mb-2">No active alerts</h3>
        <p className="text-muted-foreground">TX will notify you when patterns are detected</p>
      </div>
    </CardContent>
  </Card>
);

const PerformancePage = () => (
  <Card className="terminal-container">
    <CardHeader>
      <CardTitle className="text-tx-green flex items-center gap-2">
        <DollarSign className="w-5 h-5" />
        Performance Analytics
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="text-center p-4 border border-border rounded">
          <div className="text-2xl font-bold text-tx-green">+12.5%</div>
          <div className="text-sm text-muted-foreground">Total Return</div>
        </div>
        <div className="text-center p-4 border border-border rounded">
          <div className="text-2xl font-bold text-tx-blue">87%</div>
          <div className="text-sm text-muted-foreground">Win Rate</div>
        </div>
        <div className="text-center p-4 border border-border rounded">
          <div className="text-2xl font-bold text-tx-orange">24</div>
          <div className="text-sm text-muted-foreground">Trades</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const SettingsPage = ({ userData }: { userData: any }) => (
  <Card className="terminal-container">
    <CardHeader>
      <CardTitle className="text-tx-green flex items-center gap-2">
        <Settings className="w-5 h-5" />
        Settings
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center justify-between p-4 border border-border rounded">
        <div>
          <div className="font-bold">{userData.name}</div>
          <div className="text-sm text-muted-foreground">{userData.email}</div>
        </div>
        <Badge variant="outline" className="bg-tx-green/20 text-tx-green">
          {userData.mode === 'demo' ? 'Demo Mode' : 'Live Trading'}
        </Badge>
      </div>
      
      <div className="space-y-3">
        <h4 className="font-bold">TX Preferences</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span>Alert Frequency</span>
            <Badge variant="outline">Medium</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Risk Tolerance</span>
            <Badge variant="outline">Conservative</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Sound Alerts</span>
            <Badge variant="outline">Enabled</Badge>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default Index;
