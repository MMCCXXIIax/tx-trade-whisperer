import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Activity } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

interface Position {
  asset: string;
  quantity: number;
  avg_price: number;
  current_price: number;
  pnl: number;
  pnl_pct: number;
  allocation: number;
}

export function TXPortfolioDashboard() {
  const [positions, setPositions] = useState<Position[]>([
    { asset: 'BTC', quantity: 0.5, avg_price: 92000, current_price: 95000, pnl: 1500, pnl_pct: 3.26, allocation: 45 },
    { asset: 'ETH', quantity: 5, avg_price: 3100, current_price: 3240, pnl: 700, pnl_pct: 4.52, allocation: 30 },
    { asset: 'SOL', quantity: 50, avg_price: 180, current_price: 185, pnl: 250, pnl_pct: 2.78, allocation: 25 }
  ]);

  const [stats, setStats] = useState({
    totalValue: 105450,
    totalPnL: 2450,
    totalPnLPct: 2.38,
    dayChange: 1250,
    dayChangePct: 1.2
  });

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      // API call would go here
      console.log('Loading portfolio...');
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="tx-heading-xl">Portfolio</h1>
        <p className="text-muted-foreground">Track your trading performance</p>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="tx-terminal-glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold text-foreground">${stats.totalValue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-tx-green/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="tx-terminal-glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total P&L</p>
                <p className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-tx-green' : 'text-tx-red'}`}>
                  {stats.totalPnL >= 0 ? '+' : ''}${stats.totalPnL.toLocaleString()}
                </p>
                <p className={`text-sm ${stats.totalPnL >= 0 ? 'text-tx-green' : 'text-tx-red'}`}>
                  {stats.totalPnLPct >= 0 ? '+' : ''}{stats.totalPnLPct}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-tx-green/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="tx-terminal-glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">24h Change</p>
                <p className={`text-2xl font-bold ${stats.dayChange >= 0 ? 'text-tx-green' : 'text-tx-red'}`}>
                  {stats.dayChange >= 0 ? '+' : ''}${stats.dayChange.toLocaleString()}
                </p>
                <p className={`text-sm ${stats.dayChange >= 0 ? 'text-tx-green' : 'text-tx-red'}`}>
                  {stats.dayChangePct >= 0 ? '+' : ''}{stats.dayChangePct}%
                </p>
              </div>
              <Activity className="w-8 h-8 text-tx-blue/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="tx-terminal-glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Positions</p>
                <p className="text-2xl font-bold text-foreground">{positions.length}</p>
              </div>
              <PieChart className="w-8 h-8 text-tx-orange/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Positions */}
      <Card className="tx-terminal-glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Current Positions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {positions.map((position, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono">{position.asset}</Badge>
                    <span className="text-sm text-muted-foreground">{position.quantity} units</span>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="font-mono">${position.current_price.toLocaleString()}</span>
                      {position.pnl >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-tx-green" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-tx-red" />
                      )}
                    </div>
                    <div className={`text-sm ${position.pnl >= 0 ? 'text-tx-green' : 'text-tx-red'}`}>
                      {position.pnl >= 0 ? '+' : ''}${position.pnl.toLocaleString()} ({position.pnl_pct >= 0 ? '+' : ''}{position.pnl_pct}%)
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={position.allocation} className="flex-1 h-2" />
                  <span className="text-xs text-muted-foreground w-12">{position.allocation}%</span>
                </div>
                {idx < positions.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Allocation Chart */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="tx-terminal-glass">
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {positions.map((pos, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm">{pos.asset}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={pos.allocation} className="w-32 h-2" />
                    <span className="text-sm font-mono w-12">{pos.allocation}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="tx-terminal-glass">
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-card/30 rounded">
                <span className="text-sm text-muted-foreground">Avg. Entry Price</span>
                <span className="font-mono">${(positions.reduce((acc, p) => acc + p.avg_price, 0) / positions.length).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-card/30 rounded">
                <span className="text-sm text-muted-foreground">Best Performer</span>
                <Badge className="bg-tx-green/20 text-tx-green">
                  {positions.reduce((best, p) => p.pnl_pct > best.pnl_pct ? p : best).asset} +{positions.reduce((best, p) => p.pnl_pct > best.pnl_pct ? p : best).pnl_pct}%
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-card/30 rounded">
                <span className="text-sm text-muted-foreground">Total Invested</span>
                <span className="font-mono">${(stats.totalValue - stats.totalPnL).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}