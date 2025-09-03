import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Target,
  Activity,
  Zap,
  BarChart3,
  Wallet,
  PieChart,
  Settings,
  Clock,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import CandlestickChart from '@/components/charts/CandlestickChart';
import PortfolioPanel from '@/components/PortfolioPanel';

interface Position {
  symbol: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  side: 'BUY' | 'SELL';
  timestamp: string;
}

interface TradingStats {
  totalTrades: number;
  winRate: number;
  totalPnL: number;
  dayPnL: number;
  balance: number;
}

import { safeFetch } from '@/lib/api';

const TradingSimulator: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('bitcoin');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState('');
  const [orderType, setOrderType] = useState('market');
  const [positions, setPositions] = useState<Position[]>([]);
  const [balance, setBalance] = useState(100000);
  const [stats, setStats] = useState<TradingStats>({
    totalTrades: 0,
    winRate: 0,
    totalPnL: 0,
    dayPnL: 0,
    balance: 100000
  });
  const [isLoading, setIsLoading] = useState(false);
const [marketData, setMarketData] = useState<any>(null);
const [priceSeries, setPriceSeries] = useState<{ time: string; price: number }[]>([]);

const symbols = [
  { value: 'bitcoin', label: 'Bitcoin (BTC)' },
  { value: 'ethereum', label: 'Ethereum (ETH)' },
  { value: 'solana', label: 'Solana (SOL)' },
  { value: 'cardano', label: 'Cardano (ADA)' },
  { value: 'polygon', label: 'Polygon (MATIC)' }
];
const symbolsList = useMemo(() => {
  const results = marketData?.last_scan?.results;
  if (Array.isArray(results) && results.length) {
    return results.map((r: any) => ({
      value: r.symbol,
      label: r.label || String(r.symbol || '').toUpperCase(),
    }));
  }
  return symbols;
}, [marketData]);

  // Fetch live market data
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const data = await safeFetch<any>('/scan');
        if (data) {
          setMarketData(data);

          // append current price to series for the selected symbol
          const res = data?.last_scan?.results?.find((r: any) => r.symbol === selectedSymbol);
          if (res?.price) {
            const priceNum = parseFloat(String(res.price).replace(/[^0-9.-]+/g, ''));
            setPriceSeries((prev) => {
              const next = [...prev, { time: new Date().toLocaleTimeString(), price: priceNum }];
              return next.slice(-120); // keep last 120 points
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch market data:', error);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 15000); // Update every 15s
    return () => clearInterval(interval);
  }, [selectedSymbol]);

  // Fetch positions
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const data = await safeFetch<any>('/paper-trades');
        if (data) {
          setPositions(data.paper_trades || []);
        }
      } catch (error) {
        console.error('Failed to fetch positions:', error);
      }
    };

    fetchPositions();
  }, []);

const getCurrentPrice = (symbol: string) => {
  const result = marketData?.last_scan?.results?.find((r: any) => r.symbol === symbol);
  if (result?.price) {
    return parseFloat(String(result.price).replace(/[^0-9.-]+/g, ''));
  }
  return 0; // unknown
};

const executeTrade = async (side: 'BUY' | 'SELL') => {
  setIsLoading(true);
  try {
    const currentPrice = orderType === 'market' ? getCurrentPrice(selectedSymbol) : parseFloat(price);
    if (orderType === 'market' && (!currentPrice || currentPrice <= 0)) {
      toast.error('Live price unavailable for market order');
      return;
    }

    const res = await safeFetch<any>('/paper-trades', {
      method: 'POST',
      body: JSON.stringify({
        symbol: selectedSymbol,
        side: side.toLowerCase(),
        price: currentPrice,
        qty: quantity,
        pattern: 'Manual',
        confidence: 1.0,
      }),
    });

    if (res?.status === 'success') {
      toast.success(`${side} order executed: ${quantity} ${selectedSymbol}`);
      setQuantity(1);
      setPrice('');
      // Refresh positions
      try {
        const data = await safeFetch<any>('/paper-trades');
        if (data) {
          setPositions(data.paper_trades || []);
        }
      } catch {}
    } else {
      toast.error(res?.message || 'Failed to execute trade');
    }
  } catch (error) {
    toast.error('Error executing trade');
    console.error('Trade error:', error);
  } finally {
    setIsLoading(false);
  }
};

const closePosition = async (symbol: string) => {
  try {
    let currentPrice = getCurrentPrice(symbol);
    if (!currentPrice || currentPrice <= 0) {
      // attempt refresh
      try {
        const d = await safeFetch<any>('/scan');
        const found = d?.last_scan?.results?.find((x: any) => x.symbol === symbol);
        if (found?.price) currentPrice = parseFloat(String(found.price).replace(/[^0-9.-]+/g, ''));
      } catch {}
    }
    if (!currentPrice || currentPrice <= 0) {
      toast.error('Live price unavailable to close position');
      return;
    }

    const res = await safeFetch<any>('/close-position', {
      method: 'POST',
      body: JSON.stringify({ symbol, price: currentPrice }),
    });

    if (res?.status === 'success') {
      toast.success(`Position closed for ${symbol}`);
      const data = await safeFetch<any>('/paper-trades');
      if (data) {
        setPositions(data.paper_trades || []);
      }
    } else {
      toast.error(res?.message || 'Failed to close position');
    }
  } catch (error) {
    toast.error('Error closing position');
    console.error('Close position error:', error);
  }
};

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="terminal-container bg-gradient-to-r from-tx-gray via-tx-gray to-tx-black border-tx-green/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-tx-green flex items-center gap-3 text-xl font-bold">
              <div className="p-2 bg-tx-green/20 rounded-lg">
                <BarChart3 className="w-6 h-6" />
              </div>
              TX Trading Simulator
              <Badge className="bg-tx-green/20 text-tx-green border-tx-green/30 font-mono">
                LIVE
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-muted-foreground font-medium">{selectedSymbol.toUpperCase()} Price</div>
                <div className="text-lg font-bold text-tx-green trading-numbers">
                  {getCurrentPrice(selectedSymbol) > 0 ? `$${getCurrentPrice(selectedSymbol).toLocaleString()}` : '—'}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Trading Interface */}
        <div className="lg:col-span-2 space-y-6">
{/* Real-Time Chart */}
<Card className="terminal-container">
  <CardHeader>
    <CardTitle className="text-tx-green text-lg font-semibold">{symbolsList.find(s=>s.value===selectedSymbol)?.label || selectedSymbol.toUpperCase()} — Real-Time</CardTitle>
  </CardHeader>
  <CardContent style={{ height: 280 }}>
    <CandlestickChart symbol={selectedSymbol} />
  </CardContent>
</Card>

{/* Quick Stats */}
<div className="grid grid-cols-4 gap-4">
  <Card className="terminal-container border-tx-blue/30">
    <CardContent className="p-4">
      <div className="flex items-center gap-2">
        <Wallet className="w-4 h-4 text-tx-blue" />
        <div>
          <div className="text-xs text-muted-foreground">P&L Today</div>
          <div className="text-sm font-bold trading-numbers">—</div>
        </div>
      </div>
    </CardContent>
  </Card>
  <Card className="terminal-container border-tx-orange/30">
    <CardContent className="p-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-tx-orange" />
        <div>
          <div className="text-xs text-muted-foreground">Win Rate</div>
          <div className="text-sm font-bold trading-numbers">—</div>
        </div>
      </div>
    </CardContent>
  </Card>
  <Card className="terminal-container border-tx-green/30">
    <CardContent className="p-4">
      <div className="flex items-center gap-2">
        <Activity className="w-4 h-4 text-tx-green" />
        <div>
          <div className="text-xs text-muted-foreground">Total Trades</div>
          <div className="text-sm font-bold trading-numbers">{marketData?.paper_trades?.length || 0}</div>
        </div>
      </div>
    </CardContent>
  </Card>
  <Card className="terminal-container border-tx-red/30">
    <CardContent className="p-4">
      <div className="flex items-center gap-2">
        <PieChart className="w-4 h-4 text-tx-red" />
        <div>
          <div className="text-xs text-muted-foreground">Positions</div>
          <div className="text-sm font-bold text-tx-red trading-numbers">{positions.length}</div>
        </div>
      </div>
    </CardContent>
  </Card>
</div>

          {/* Trading Panel */}
          <Card className="terminal-container">
            <CardHeader>
              <CardTitle className="text-tx-green text-lg font-semibold">Place Order</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Asset</label>
                    <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                      <SelectTrigger className="terminal-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {symbolsList.map((symbol) => (
                          <SelectItem key={symbol.value} value={symbol.value}>
                            <div className="flex items-center justify-between w-full">
                              <span>{symbol.label}</span>
                              <span className="text-tx-green trading-numbers ml-2">
                                {getCurrentPrice(symbol.value) > 0 ? `$${getCurrentPrice(symbol.value).toLocaleString()}` : '—'}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Order Type</label>
                    <Select value={orderType} onValueChange={setOrderType}>
                      <SelectTrigger className="terminal-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="market">Market Order</SelectItem>
                        <SelectItem value="limit">Limit Order</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Quantity</label>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="terminal-input trading-numbers"
                      min="0.01"
                      step="0.01"
                    />
                  </div>

                  {orderType === 'limit' && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Price</label>
                      <Input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="terminal-input trading-numbers"
                        placeholder={`Current: $${getCurrentPrice(selectedSymbol)}`}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <Button
                  onClick={() => executeTrade('BUY')}
                  disabled={isLoading}
                  className="flex-1 bg-tx-green text-tx-black hover:bg-tx-green/90 font-semibold"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  BUY {selectedSymbol.toUpperCase()}
                </Button>
                <Button
                  onClick={() => executeTrade('SELL')}
                  disabled={isLoading}
                  variant="destructive"
                  className="flex-1 font-semibold"
                >
                  <TrendingDown className="w-4 h-4 mr-2" />
                  SELL {selectedSymbol.toUpperCase()}
                </Button>
              </div>

              <div className="mt-4 text-center">
                <div className="text-xs text-muted-foreground">
                  Estimated Value:
                  <span className="text-tx-green font-bold trading-numbers ml-1">
                    {getCurrentPrice(selectedSymbol) > 0 ? `$${(getCurrentPrice(selectedSymbol) * quantity).toLocaleString()}` : '—'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Positions & Market Data */}
        <div className="space-y-6">
          {/* Open Positions */}
          <Card className="terminal-container">
            <CardHeader>
              <CardTitle className="text-tx-green text-sm flex items-center gap-2">
                <Target className="w-4 h-4" />
                Open Positions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {positions.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No open positions</p>
                  </div>
                ) : (
                  positions.map((position, index) => (
                    <div
                      key={index}
                      className="p-3 bg-tx-gray/50 rounded-lg border border-tx-green/20 hover:border-tx-green/40 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs bg-tx-green/20 text-tx-green border-tx-green/30">
                            {position.symbol}
                          </Badge>
                          <Badge variant={position.side === 'BUY' ? 'default' : 'destructive'} className="text-xs">
                            {position.side}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => closePosition(position.symbol)}
                          className="text-xs h-6 px-2"
                        >
                          Close
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Qty:</span>
                          <span className="font-bold trading-numbers ml-1">{(position as any).quantity ?? (position as any).qty ?? 0}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Entry:</span>
                          <span className="font-bold trading-numbers ml-1">
                            ${((position as any).entryPrice ?? (position as any).entry_price ?? (position as any).price ?? 0)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Current:</span>
                          <span className="font-bold trading-numbers ml-1">
                            {getCurrentPrice(position.symbol) > 0 ? `$${getCurrentPrice(position.symbol)}` : '—'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">P&L:</span>
                          <span className={`font-bold trading-numbers ml-1 ${((position as any).pnl ?? 0) >= 0 ? 'text-tx-green' : 'text-tx-red'}`}>
                            {((position as any).pnl ?? 0) >= 0 ? '+' : ''}${(position as any).pnl ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Market Overview */}
          <Card className="terminal-container">
            <CardHeader>
              <CardTitle className="text-tx-green text-sm flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Market Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {symbolsList.map((symbol) => {
                  const currentPrice = getCurrentPrice(symbol.value);
                  return (
                    <div
                      key={symbol.value}
                      className="flex items-center justify-between p-2 bg-tx-gray/30 rounded border border-transparent hover:border-tx-green/30 transition-colors"
                    >
                      <div>
                        <div className="text-sm font-medium">{symbol.value.toUpperCase()}</div>
                        <div className="text-xs text-muted-foreground">{symbol.label}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold trading-numbers">
                          {currentPrice > 0 ? `$${currentPrice.toLocaleString()}` : '—'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <PortfolioPanel onSelectSymbol={setSelectedSymbol} />

        </div>
      </div>
    </div>
  );
};

export default TradingSimulator;
