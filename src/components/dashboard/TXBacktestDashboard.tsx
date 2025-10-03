import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Play, TrendingUp, TrendingDown, Target, BarChart3, DollarSign } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

interface BacktestResult {
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  sharpeRatio: number;
  maxDrawdown: number;
  totalReturn: number;
  avgReturn: number;
}

export function TXBacktestDashboard() {
  const { toast } = useToast();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [config, setConfig] = useState({
    symbol: 'BTC',
    pattern: 'bullish_engulfing',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    initialCapital: 10000,
    stopLoss: 5,
    takeProfit: 10
  });

  const runBacktest = async () => {
    setRunning(true);
    try {
      // Mock results for demonstration
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockResult: BacktestResult = {
        totalTrades: 45,
        winRate: 68.9,
        profitFactor: 2.34,
        sharpeRatio: 1.87,
        maxDrawdown: -12.5,
        totalReturn: 34.7,
        avgReturn: 2.3
      };
      setResult(mockResult);
      toast({ title: 'Backtest Complete', description: 'Results are ready' });
    } catch (error) {
      toast({ title: 'Backtest Failed', description: 'Unable to run backtest', variant: 'destructive' });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="tx-heading-xl">Backtesting Engine</h1>
        <p className="text-muted-foreground">Test your strategies with historical data</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <Card className="lg:col-span-1 tx-terminal-glass">
          <CardHeader>
            <CardTitle>Backtest Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Symbol</Label>
              <Select value={config.symbol} onValueChange={(v) => setConfig({...config, symbol: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BTC">BTC</SelectItem>
                  <SelectItem value="ETH">ETH</SelectItem>
                  <SelectItem value="SOL">SOL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Pattern</Label>
              <Select value={config.pattern} onValueChange={(v) => setConfig({...config, pattern: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bullish_engulfing">Bullish Engulfing</SelectItem>
                  <SelectItem value="morning_star">Morning Star</SelectItem>
                  <SelectItem value="hammer">Hammer</SelectItem>
                  <SelectItem value="doji">Doji</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={config.startDate}
                onChange={(e) => setConfig({...config, startDate: e.target.value})}
              />
            </div>

            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={config.endDate}
                onChange={(e) => setConfig({...config, endDate: e.target.value})}
              />
            </div>

            <Separator />

            <div>
              <Label>Initial Capital</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm">$</span>
                <Input
                  type="number"
                  value={config.initialCapital}
                  onChange={(e) => setConfig({...config, initialCapital: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div>
              <Label>Stop Loss (%)</Label>
              <Input
                type="number"
                value={config.stopLoss}
                onChange={(e) => setConfig({...config, stopLoss: parseFloat(e.target.value)})}
                step="0.5"
              />
            </div>

            <div>
              <Label>Take Profit (%)</Label>
              <Input
                type="number"
                value={config.takeProfit}
                onChange={(e) => setConfig({...config, takeProfit: parseFloat(e.target.value)})}
                step="0.5"
              />
            </div>

            <Button 
              className="tx-btn-primary w-full"
              onClick={runBacktest}
              disabled={running}
            >
              <Play className="w-4 h-4 mr-2" />
              {running ? 'Running...' : 'Run Backtest'}
            </Button>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {running && (
            <Card className="tx-terminal-glass">
              <CardContent className="p-8 text-center">
                <div className="space-y-4">
                  <BarChart3 className="w-16 h-16 mx-auto text-tx-blue animate-pulse" />
                  <p className="text-lg font-medium">Running Backtest...</p>
                  <Progress value={66} className="w-full" />
                  <p className="text-sm text-muted-foreground">Analyzing historical data</p>
                </div>
              </CardContent>
            </Card>
          )}

          {result && !running && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="tx-terminal-glass">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Return</p>
                        <p className="text-2xl font-bold text-tx-green">+{result.totalReturn}%</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-tx-green/60" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="tx-terminal-glass">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Win Rate</p>
                        <p className="text-2xl font-bold text-foreground">{result.winRate}%</p>
                      </div>
                      <Target className="w-8 h-8 text-tx-blue/60" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="tx-terminal-glass">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Profit Factor</p>
                        <p className="text-2xl font-bold text-foreground">{result.profitFactor}</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-tx-orange/60" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="tx-terminal-glass">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
                        <p className="text-2xl font-bold text-foreground">{result.sharpeRatio}</p>
                      </div>
                      <BarChart3 className="w-8 h-8 text-tx-purple/60" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Stats */}
              <Card className="tx-terminal-glass">
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-card/30 rounded">
                    <span className="text-sm text-muted-foreground">Total Trades</span>
                    <Badge variant="secondary">{result.totalTrades}</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-card/30 rounded">
                    <span className="text-sm text-muted-foreground">Winning Trades</span>
                    <span className="font-mono text-tx-green">{Math.round(result.totalTrades * result.winRate / 100)}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-card/30 rounded">
                    <span className="text-sm text-muted-foreground">Losing Trades</span>
                    <span className="font-mono text-tx-red">{Math.round(result.totalTrades * (100 - result.winRate) / 100)}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-card/30 rounded">
                    <span className="text-sm text-muted-foreground">Average Return</span>
                    <span className="font-mono text-foreground">{result.avgReturn}%</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-card/30 rounded">
                    <span className="text-sm text-muted-foreground">Max Drawdown</span>
                    <span className="font-mono text-tx-red">{result.maxDrawdown}%</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-card/30 rounded">
                    <span className="text-sm text-muted-foreground">Final Portfolio Value</span>
                    <span className="font-mono text-tx-green">
                      ${(config.initialCapital * (1 + result.totalReturn / 100)).toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {!result && !running && (
            <Card className="tx-terminal-glass">
              <CardContent className="p-12 text-center">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">Configure and run a backtest to see results</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}