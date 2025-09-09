import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  TrendingUp,
  TrendingDown,
  Bell,
  Zap,
  Activity,
  DollarSign,
  Target,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { txApi } from '@/lib/txApi';

interface AlertData {
  symbol: string;
  pattern: string;
  confidence: string;
  price: string;
  time: string;
  explanation?: string;
  action?: string;
}

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  status: string;
}

export function TXOverviewDashboard() {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [scanStatus, setScanStatus] = useState({ active: true, lastScan: new Date() });
  const [stats, setStats] = useState({
    patternsToday: 12,
    successRate: 85.2,
    alertsSent: 34,
    activeTrades: 3
  });

  useEffect(() => {
    // Load initial data
    loadAlerts();
    loadMarketData();
    
    // Set up polling for real-time updates
    const interval = setInterval(() => {
      loadAlerts();
      loadMarketData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const loadAlerts = async () => {
    try {
      // Mock alerts for demo
      const mockAlerts: AlertData[] = [
        {
          symbol: 'BTC',
          pattern: 'Bullish Engulfing',
          confidence: '89%',
          price: '$95,432',
          time: new Date().toLocaleTimeString()
        }
      ];
      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  };

  const loadMarketData = async () => {
    try {
      // Mock market data for demo
      if (response.data) {
        const data = [
          { symbol: 'bitcoin', price: 95432, change: 2.3, status: 'active' },
          { symbol: 'ethereum', price: 3240, change: 1.8, status: 'active' },
          { symbol: 'solana', price: 185, change: -0.5, status: 'active' }
        ];
        const mockData = data.map((result: any) => ({
          symbol: result.symbol,
          price: result.price || 0,
          change: Math.random() * 4 - 2, // Mock change for demo
          status: result.status
        }));
        setMarketData(mockData);
        setScanStatus({
          active: true,
          lastScan: new Date()
        });
      }
    } catch (error) {
      console.error('Failed to load market data:', error);
    }
  };

  const getConfidenceColor = (confidence: string) => {
    const num = parseFloat(confidence);
    if (num >= 85) return 'tx-confidence-high';
    if (num >= 70) return 'tx-confidence-medium';
    return 'tx-confidence-low';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="tx-heading-xl text-foreground">TX Overview</h1>
        <p className="text-muted-foreground tx-body">
          Real-time trading intelligence dashboard
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="tx-terminal-glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Patterns Today</p>
                <p className="text-2xl font-bold text-tx-green">{stats.patternsToday}</p>
              </div>
              <Target className="w-8 h-8 text-tx-green/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="tx-terminal-glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-tx-green">{stats.successRate}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-tx-green/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="tx-terminal-glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alerts Sent</p>
                <p className="text-2xl font-bold text-tx-blue">{stats.alertsSent}</p>
              </div>
              <Bell className="w-8 h-8 text-tx-blue/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="tx-terminal-glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Trades</p>
                <p className="text-2xl font-bold text-tx-orange">{stats.activeTrades}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-tx-orange/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Live Alerts Panel */}
        <Card className="lg:col-span-2 tx-terminal-glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-tx-green" />
              Live Pattern Alerts
              <Badge variant="secondary" className="ml-auto">
                {alerts.length} Active
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.length > 0 ? (
              <div className="space-y-4">
                {alerts.map((alert, index) => (
                  <Alert key={index} className="tx-alert-success border-l-4 border-l-tx-green">
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs font-mono">
                            {alert.symbol}
                          </Badge>
                          <span className="font-medium">{alert.pattern}</span>
                          <Badge className={`text-xs ${getConfidenceColor(alert.confidence)}`}>
                            {alert.confidence}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm">{alert.price}</span>
                          <span className="text-xs text-muted-foreground">{alert.time}</span>
                          <div className="flex gap-2">
                            <Button size="sm" className="tx-btn-primary">
                              Explain
                            </Button>
                            <Button size="sm" variant="outline">
                              Trade
                            </Button>
                          </div>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No active alerts. Scanner is monitoring for patterns...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Market Overview */}
        <Card className="tx-terminal-glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-tx-blue" />
              Market Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Scanner Status */}
              <div className="flex items-center justify-between p-3 bg-card/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="tx-status-online" />
                  <span className="text-sm font-medium">Scanner Status</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Active
                </Badge>
              </div>

              <Separator />

              {/* Asset Prices */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Monitored Assets</h4>
                {marketData.slice(0, 5).map((asset, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {asset.symbol}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono">{formatPrice(asset.price)}</p>
                      <div className="flex items-center gap-1">
                        {asset.change >= 0 ? (
                          <TrendingUp className="w-3 h-3 text-tx-green" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-tx-red" />
                        )}
                        <span className={`text-xs ${asset.change >= 0 ? 'text-tx-green' : 'text-tx-red'}`}>
                          {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Last Scan Info */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Last Scan:</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{scanStatus.lastScan.toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="tx-terminal-glass">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button className="tx-btn-primary">
              <Target className="w-4 h-4 mr-2" />
              Run Manual Scan
            </Button>
            <Button variant="outline">
              <Bell className="w-4 h-4 mr-2" />
              Configure Alerts
            </Button>
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              View All Patterns
            </Button>
            <Button variant="outline">
              <DollarSign className="w-4 h-4 mr-2" />
              Paper Trade
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}