import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Activity, Plus, X } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import TradingViewChart from '@/components/trading/TradingViewChart';
import { useToast } from '@/hooks/use-toast';

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

  const [selectedSymbol, setSelectedSymbol] = useState('BTC');
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const { toast } = useToast();

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
      console.log('Loading portfolio...');
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    }
  };

  const executeTrade = async () => {
    if (!quantity || !price) {
      toast({
        title: 'Invalid Order',
        description: 'Please enter quantity and price',
        variant: 'destructive',
      });
      return;
    }

    try {
      toast({
        title: `${orderType} Order Placed`,
        description: `${quantity} ${selectedSymbol} @ $${price}`,
      });
      setQuantity('');
      setPrice('');
    } catch (error) {
      toast({
        title: 'Order Failed',
        description: 'Failed to execute trade',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Portfolio & Trading</h1>
        <p className="text-sm md:text-base text-muted-foreground">Practice trading with real market data</p>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="tx-terminal-glass">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total Value</p>
                <p className="text-lg md:text-2xl font-bold">${stats.totalValue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-tx-green/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="tx-terminal-glass">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total P&L</p>
                <p className={`text-lg md:text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-tx-green' : 'text-tx-red'}`}>
                  {stats.totalPnL >= 0 ? '+' : ''}${stats.totalPnL.toLocaleString()}
                </p>
                <p className={`text-xs ${stats.totalPnL >= 0 ? 'text-tx-green' : 'text-tx-red'}`}>
                  {stats.totalPnLPct >= 0 ? '+' : ''}{stats.totalPnLPct}%
                </p>
              </div>
              <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-tx-green/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="tx-terminal-glass">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">24h Change</p>
                <p className={`text-lg md:text-2xl font-bold ${stats.dayChange >= 0 ? 'text-tx-green' : 'text-tx-red'}`}>
                  {stats.dayChange >= 0 ? '+' : ''}${stats.dayChange.toLocaleString()}
                </p>
                <p className={`text-xs ${stats.dayChange >= 0 ? 'text-tx-green' : 'text-tx-red'}`}>
                  {stats.dayChangePct >= 0 ? '+' : ''}{stats.dayChangePct}%
                </p>
              </div>
              <Activity className="w-6 h-6 md:w-8 md:h-8 text-tx-blue/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="tx-terminal-glass">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Positions</p>
                <p className="text-lg md:text-2xl font-bold">{positions.length}</p>
              </div>
              <PieChart className="w-6 h-6 md:w-8 md:h-8 text-tx-orange/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trading Interface with Chart */}
      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <Card className="tx-terminal-glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg md:text-xl">Live Chart</CardTitle>
            </CardHeader>
            <CardContent className="p-2 md:p-4">
              <TradingViewChart symbol={selectedSymbol} height={400} />
            </CardContent>
          </Card>
        </div>

        <Card className="tx-terminal-glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg md:text-xl flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Place Order
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Symbol</label>
              <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BTC">BTC/USDT</SelectItem>
                  <SelectItem value="ETH">ETH/USDT</SelectItem>
                  <SelectItem value="SOL">SOL/USDT</SelectItem>
                  <SelectItem value="BNB">BNB/USDT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Tabs value={orderType} onValueChange={(v) => setOrderType(v as 'BUY' | 'SELL')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="BUY" className="data-[state=active]:bg-tx-green/20 data-[state=active]:text-tx-green">
                  BUY
                </TabsTrigger>
                <TabsTrigger value="SELL" className="data-[state=active]:bg-tx-red/20 data-[state=active]:text-tx-red">
                  SELL
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div>
              <label className="text-sm font-medium mb-2 block">Quantity</label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0.00"
                className="font-mono"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Price (USD)</label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="font-mono"
              />
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-mono font-semibold">
                  ${quantity && price ? (parseFloat(quantity) * parseFloat(price)).toFixed(2) : '0.00'}
                </span>
              </div>
            </div>

            <Button
              onClick={executeTrade}
              className={`w-full ${orderType === 'BUY' ? 'bg-tx-green hover:bg-tx-green/90' : 'bg-tx-red hover:bg-tx-red/90'}`}
            >
              {orderType} {selectedSymbol}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Positions */}
      <Card className="tx-terminal-glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <BarChart3 className="w-5 h-5" />
            Current Positions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {positions.map((position, idx) => (
              <div key={idx}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono">{position.asset}</Badge>
                    <span className="text-sm text-muted-foreground">{position.quantity} units</span>
                  </div>
                  <div className="md:text-right">
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
    </div>
  );
}
