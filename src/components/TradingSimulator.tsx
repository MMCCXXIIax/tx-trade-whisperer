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

import { apiClient } from '@/lib/apiClient';
import { safeApiCall } from '@/lib/errorHandling';

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
    // First try to get symbols from scan results
    const results = marketData?.last_scan?.results;
    if (Array.isArray(results) && results.length) {
      return results.map((r: any) => ({
        value: r.symbol,
        label: r.label || String(r.symbol || '').toUpperCase(),
      }));
    }
    // Fallback to supported assets list if available
    if (marketData?.assets && Array.isArray(marketData.assets)) {
      return marketData.assets.map((asset: any) => ({
        value: asset.symbol || asset.ticker,
        label: asset.name || asset.symbol || asset.ticker,
      }));
    }
    return symbols;
  }, [marketData]);

  // Fetch live market data and assets list
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        // Fetch current scan data
        const scanResponse = await safeApiCall(apiClient.getMarketScan());
        if (scanResponse.success && scanResponse.data) {
          setMarketData(scanResponse.data);

          // append current price to series for the selected symbol
          const res = scanResponse.data?.last_scan?.results?.find((r: any) => r.symbol === selectedSymbol);
          if (res?.price) {
            const priceNum = parseFloat(String(res.price).replace(/[^0-9.-]+/g, ''));
            setPriceSeries((prev) => {
              const next = [...prev, { time: new Date().toLocaleTimeString(), price: priceNum }];
              return next.slice(-120); // keep last 120 points
            });
          }
        }

        // Fetch supported assets list if not available in scan
        if (!scanResponse.data?.assets) {
          try {
            const assetsResponse = await safeApiCall(apiClient.getAssetsList());
            if (assetsResponse.success && assetsResponse.data && scanResponse.data) {
              setMarketData(prev => prev ? { ...prev, assets: assetsResponse.data } : prev);
            }
          } catch (error) {
            console.log('Assets list not available:', error);
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
        const response = await safeApiCall(apiClient.getPaperPortfolio());
        if (response.success && response.data) {
          if (response.data.positions) {
            setPositions(response.data.positions || []);
          } else if (response.data.paper_trades) {
            setPositions(response.data.paper_trades || []);
          } else if (Array.isArray(response.data)) {
            setPositions(response.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch positions:', error);
      }
    };

    fetchPositions();
    // Refresh positions every 30 seconds
    const interval = setInterval(fetchPositions, 30000);
    return () => clearInterval(interval);
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

      const response = await safeApiCall(
        apiClient.executePaperTrade({
          symbol: selectedSymbol,
          action: side.toLowerCase(),
          price: currentPrice,
          quantity: quantity,
          pattern: 'Manual',
          confidence: 1.0,
        })
      );

      if (response.success) {
        toast.success(`${side} order executed: ${quantity} ${selectedSymbol}`);
        setQuantity(1);
        setPrice('');
        // Refresh positions
        try {
          const portfolioResponse = await safeApiCall(apiClient.getPaperPortfolio());
          if (portfolioResponse.success && portfolioResponse.data) {
            if (portfolioResponse.data.positions) {
              setPositions(portfolioResponse.data.positions || []);
            } else if (portfolioResponse.data.paper_trades) {
              setPositions(portfolioResponse.data.paper_trades || []);
            } else if (Array.isArray(portfolioResponse.data)) {
              setPositions(portfolioResponse.data);
            }
          }
        } catch (error) {
          console.error('Failed to refresh positions after trade:', error);
        }
      } else {
        toast.error(response.error || 'Failed to execute trade');
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
          const scanResponse = await safeApiCall(apiClient.getMarketScan());
          if (scanResponse.success && scanResponse.data) {
            const found = scanResponse.data?.last_scan?.results?.find((x: any) => x.symbol === symbol);
            if (found?.price) currentPrice = parseFloat(String(found.price).replace(/[^0-9.-]+/g, ''));
          }
        } catch (error) {
          console.error('Failed to refresh price for position close:', error);
        }
      }
      
      if (!currentPrice || currentPrice <= 0) {
        toast.error('Live price unavailable to close position');
        return;
      }

      // Find the position to get trade ID
      const position = positions.find(p => p.symbol === symbol);
      if (!position || !(position as any).id) {
        toast.error('Position not found or missing trade ID');
        return;
      }

      const response = await safeApiCall(
        apiClient.closePaperTrade((position as any).id, currentPrice)
      );

      if (response.success) {
        toast.success(`Position closed for ${symbol}`);
        const portfolioResponse = await safeApiCall(apiClient.getPaperPortfolio());
        if (portfolioResponse.success && portfolioResponse.data) {
          if (portfolioResponse.data.positions) {
            setPositions(portfolioResponse.data.positions || []);
          } else if (portfolioResponse.data.paper_trades) {
            setPositions(portfolioResponse.data.paper_trades || []);
          } else if (Array.isArray(portfolioResponse.data)) {
            setPositions(portfolioResponse.data);
          }
        }
      } else {
        toast.error(response.error || 'Failed to close position');
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
                            {symbol.label}
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
                        <SelectItem value="market">Market</SelectItem>
                        <SelectItem value="limit">Limit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Quantity</label>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="terminal-input font-mono"
                      min={0.001}
                      step={0.001}
                    />
                  </div>
                  {orderType === 'limit' && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Price</label>
                      <Input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="terminal-input font-mono"
                        min={0.01}
                        step={0.01}
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-4 flex flex-col justify-between">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Order Preview</label>
                    <Card className="terminal-container border-tx-gray/30 p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Asset:</span>
                        <span className="font-mono">{selectedSymbol.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-mono">{orderType.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Quantity:</span>
                        <span className="font-mono">{quantity}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-mono">
                          {orderType === 'market'
                            ? getCurrentPrice(selectedSymbol) > 0
                              ? `$${getCurrentPrice(selectedSymbol).toLocaleString()}`
                              : '—'
                            : price
                            ? `$${parseFloat(price).toLocaleString()}`
                            : '—'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total:</span>
                        <span className="font-mono">
                          {orderType === 'market'
                            ? getCurrentPrice(selectedSymbol) > 0
                              ? `$${(getCurrentPrice(selectedSymbol) * quantity).toLocaleString()}`
                              : '—'
                            : price
                            ? `$${(parseFloat(price) * quantity).toLocaleString()}`
                            : '—'}
                        </span>
                      </div>
                    </Card>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={() => executeTrade('BUY')}
                      disabled={isLoading || (orderType === 'limit' && !price)}
                      className="w-full bg-tx-green hover:bg-tx-green/80 text-tx-black"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      BUY
                    </Button>
                    <Button
                      onClick={() => executeTrade('SELL')}
                      disabled={isLoading || (orderType === 'limit' && !price)}
                      className="w-full bg-tx-red hover:bg-tx-red/80 text-white"
                    >
                      <TrendingDown className="w-4 h-4 mr-2" />
                      SELL
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Panel */}
        <div className="space-y-6">
          <Card className="terminal-container">
            <CardHeader>
              <CardTitle className="text-tx-green text-lg font-semibold">Portfolio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Balance</span>
                  <span className="font-mono text-lg font-bold">${balance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Open Positions</span>
                  <span className="font-mono">{positions.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total P&L</span>
                  <span className="font-mono text-green-400">+$0.00</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="terminal-container">
            <CardHeader>
              <CardTitle className="text-tx-green text-lg font-semibold">Open Positions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {positions.length === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="w-12 h-12 mx-auto text-muted-foreground opacity-20 mb-2" />
                    <p className="text-muted-foreground">No open positions</p>
                  </div>
                ) : (
                  positions.map((position, index) => (
                    <Card key={index} className="terminal-container border-tx-gray/30 p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{position.symbol.toUpperCase()}</span>
                          <Badge
                            className={
                              position.side === 'BUY'
                                ? 'bg-tx-green/20 text-tx-green border-tx-green/30'
                                : 'bg-tx-red/20 text-tx-red border-tx-red/30'
                            }
                          >
                            {position.side}
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => closePosition(position.symbol)}
                          className="h-7 px-2 text-xs"
                        >
                          Close
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Quantity:</span>
                          <span className="font-mono ml-2">{position.quantity}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Entry:</span>
                          <span className="font-mono ml-2">${position.entryPrice?.toLocaleString() || '—'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Current:</span>
                          <span className="font-mono ml-2">
                            ${getCurrentPrice(position.symbol)?.toLocaleString() || '—'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">P&L:</span>
                          <span
                            className={`font-mono ml-2 ${
                              position.pnl > 0 ? 'text-green-400' : position.pnl < 0 ? 'text-red-400' : ''
                            }`}
                          >
                            {position.pnl > 0 ? '+' : ''}${position.pnl?.toLocaleString() || '0.00'}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="terminal-container">
            <CardHeader>
              <CardTitle className="text-tx-green text-lg font-semibold">Market Scanner</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!marketData?.last_scan?.results ? (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 mx-auto text-muted-foreground opacity-20 mb-2" />
                    <p className="text-muted-foreground">No scan data available</p>
                  </div>
                ) : (
                  marketData.last_scan.results.slice(0, 5).map((result: any, index: number) => (
                    <div key={index} className="flex justify-between items-center border-b border-tx-gray/20 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{result.symbol.toUpperCase()}</span>
                        {result.status === 'pattern' && (
                          <Badge className="bg-tx-green/20 text-tx-green border-tx-green/30">Pattern</Badge>
                        )}
                      </div>
                      <span className="font-mono">${parseFloat(String(result.price).replace(/[^0-9.-]+/g, '')).toLocaleString()}</span>
                    </div>
                  ))
                )}
                <div className="text-center pt-2">
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                    View All Assets
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TradingSimulator;