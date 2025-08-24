import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

import TXDashboard from '@/components/TXDashboard';
import TXNavigation from '@/components/TXNavigation';
import TradingView from '@/components/TradingView';
import AlertCenter from '@/components/AlertCenter';
import DetectionLogs from '@/components/DetectionLogs';
import PaperTrading from '@/components/PaperTrading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Bell, DollarSign } from 'lucide-react';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth', { replace: true });
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error || !profile) {
        navigate('/welcome', { replace: true });
        return;
      }

      setUserData(profile);
      setLoading(false);
    };

    fetchProfile();
  }, [navigate]);

  if (loading) {
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
        return <AlertCenter />;
      case 'logs':
        return <DetectionLogs />;
      case 'paper-trading':
        return <PaperTrading />;
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
          mode={userData.mode}
        />
        {renderCurrentPage()}
      </div>
    </div>
  );
};

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
    </CardContent>
  </Card>
);

export default Index;
