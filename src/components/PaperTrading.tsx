import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, TrendingUp, TrendingDown, PieChart, BarChart3, Play, Square, ShoppingCart } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { safeApiCall } from '@/lib/errorHandling';

interface PaperTrade {
  id: number;
  symbol: string;
  action: 'BUY' | 'SELL';
  entry_price: string;
  exit_price?: string;
  quantity: number;
  pnl?: number;
  status: 'open' | 'closed';
  timestamp: string;
  pattern?: string;
  confidence?: string;
}

interface TradingStats {
  total_balance: number;
  total_pnl: number;
  win_rate: number;
  total_trades: number;
  open_positions: number;
  best_trade: number;
  worst_trade: number;
  avg_trade: number;
}

// Helper function to calculate stats from trades when backend doesn't provide them
const calculateStatsFromTrades = (trades: PaperTrade[]): TradingStats => {
  const closedTrades = trades.filter(t => t.status === 'closed');
  const openPositions = trades.filter(t => t.status === 'open').length;
  
  const winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0);
  const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
  
  const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const bestTrade = closedTrades.length > 0 ? Math.max(...closedTrades.map(t => t.pnl || 0)) : 0;
  const worstTrade = closedTrades.length > 0 ? Math.min(...closedTrades.map(t => t.pnl || 0)) : 0;
  const avgTrade = closedTrades.length > 0 ? totalPnl / closedTrades.length : 0;
  
  return {
    total_balance: 100000 + totalPnl, // Start with 100k virtual balance
    total_pnl: totalPnl,
    win_rate: Math.round(winRate),
    total_trades: trades.length,
    open_positions: openPositions,
    best_trade: bestTrade,
    worst_trade: worstTrade,
    avg_trade: avgTrade
  };
};

const PaperTrading: React.FC = () => {
  const [paperTrades, setPaperTrades] = useState<PaperTrade[]>([]);
  const [tradingStats, setTradingStats] = useState<TradingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [symbol, setSymbol] = useState('');
  const [action, setAction] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [isTrading, setIsTrading] = useState(false);

  const { toast } = useToast();
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const fetchPaperTrades = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getPaperPortfolio();
      if (response && response.data) {
        const portfolio = response.data;
        if (portfolio.positions) {
          setPaperTrades(portfolio.positions);
        } else if (Array.isArray(portfolio)) {
          // Handle direct array response
          setPaperTrades(portfolio);
        }
      }
    } catch (error) {
      console.error('Failed to fetch paper trades:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTradingStats = async () => {
    try {
      const response = await apiClient.getPaperPortfolio();
      if (response && response.data) {
        const portfolio = response.data;
        if (portfolio.balance !== undefined) {
          // Backend returned portfolio with stats
          setTradingStats({
            total_balance: portfolio.balance || 100000,
            total_pnl: portfolio.pnl || 0,
            win_rate: portfolio.win_rate || 0,
            total_trades: portfolio.total_trades || paperTrades.length,
            open_positions: portfolio.positions?.filter(p => p.status === 'open').length || 0,
            best_trade: portfolio.best_trade || 0,
            worst_trade: portfolio.worst_trade || 0,
            avg_trade: portfolio.avg_trade || 0
          });
        } else {
          // If no stats in portfolio response, calculate from trades
          const stats = calculateStatsFromTrades(paperTrades);
          setTradingStats(stats);
        }
      }
    } catch (error) {
      console.error('Failed to fetch trading stats:', error);
      // Fallback to calculated stats
      const stats = calculateStatsFromTrades(paperTrades);
      setTradingStats(stats);
    }
  };

  const placePaperTrade = async () => {
    if (!symbol || !quantity || !price) {
      toast({ title: 'Missing Information', description: 'Please fill in all trade details', variant: 'destructive' });
      return;
    }
    setIsTrading(true);
    
    try {
      const result = await safeApiCall(
        apiClient.executePaperTrade({
          symbol: symbol.toUpperCase(),
          action: action.toLowerCase(),
          quantity: parseFloat(quantity),
          price: parseFloat(price),
          pattern: 'Manual',
          confidence: 1.0,
        })
      );
      
      if (result.success) {
        toast({ title: 'Trade Placed', description: `${action} ${quantity} ${symbol.toUpperCase()} @ $${price}` });
        setSymbol('');
        setQuantity('');
        setPrice('');
        setAction('BUY');
        fetchPaperTrades();
        fetchTradingStats();
      } else {
        toast({ title: 'Trade Failed', description: 'Unable to place paper trade. Please try again.', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error placing paper trade:', error);
      toast({ title: 'Trade Failed', description: 'Unable to place paper trade. Please try again.', variant: 'destructive' });
    } finally {
      setIsTrading(false);
    }
  };

  const closePosition = async (symbol: string) => {
    try {
      // Find the trade to close
      const trade = paperTrades.find(t => t.symbol === symbol && t.status === 'open');
      if (!trade || !trade.id) {
        toast({ title: 'Error', description: 'Trade not found or missing ID', variant: 'destructive' });
        return;
      }

      const result = await safeApiCall(
        apiClient.closePaperTrade(trade.id)
      );
      
      if (result.success) {
        toast({ title: 'Position Closed', description: `${symbol} position closed successfully` });
        fetchPaperTrades();
        fetchTradingStats();
      } else {
        toast({ title: 'Close Failed', description: `Unable to close ${symbol} position. Please try again.`, variant: 'destructive' });
      }
    } catch (error) {
      console.error('Failed to close position:', error);
      toast({ title: 'Close Failed', description: `Error closing ${symbol} position.`, variant: 'destructive' });
    }
  };

  const formatPnL = (pnl: number) => (
    <span className={pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
      {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
    </span>
  );

  const getStatusBadge = (status: string) =>
    status === 'open'
      ? <Badge className="bg-blue-500/20 text-blue-400 border-blue-500">Open</Badge>
      : <Badge variant="secondary">Closed</Badge>;

  const getActionBadge = (act: string) =>
    act === 'BUY'
      ? <Badge className="bg-green-500/20 text-green-400 border-green-500">BUY</Badge>
      : <Badge className="bg-red-500/20 text-red-400 border-red-500">SELL</Badge>;

  useEffect(() => {
    fetchPaperTrades();
    fetchTradingStats();
    timerRef.current = setInterval(() => {
      fetchPaperTrades();
      fetchTradingStats();
    }, 15000);
    return () => timerRef.current && clearInterval(timerRef.current);
  }, []);

  if (isLoading) {
    return <div className="p-6 text-center text-primary font-bold">Loading Paper Trading…</div>;
  }

  return (
    <div className="space-y-6">
      {/* Trading Interface */}
      <Card className="terminal-container">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Place Paper Trade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Symbol</label>
              <Input
                placeholder="e.g., AAPL"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Action</label>
              <Select value={action} onValueChange={(value: 'BUY' | 'SELL') => setAction(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BUY">BUY</SelectItem>
                  <SelectItem value="SELL">SELL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity</label>
              <Input
                type="number"
                placeholder="100"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Price ($)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="150.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">&nbsp;</label>
              <Button 
                onClick={placePaperTrade}
                disabled={isTrading}
                className="w-full"
                variant={action === 'BUY' ? 'default' : 'destructive'}
              >
                {isTrading ? (
                  <>
                    <Play className="w-4 h-4 mr-2 animate-spin" />
                    Placing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    {action} {symbol || 'Stock'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Trading Statistics */}
      {tradingStats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="terminal-container">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">${tradingStats.total_balance.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Portfolio Balance</div>
                </div>
              </CardContent>
            </Card>
            <Card className="terminal-container">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {formatPnL(tradingStats.total_pnl)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total P&L</div>
                </div>
              </CardContent>
            </Card>
            <Card className="terminal-container">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{tradingStats.win_rate}%</div>
                  <div className="text-sm text-muted-foreground">Win Rate</div>
                </div>
              </CardContent>
            </Card>
            <Card className="terminal-container">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">{tradingStats.total_trades}</div>
                  <div className="text-sm text-muted-foreground">Total Trades</div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="terminal-container">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Open Positions</span>
                    <span className="font-mono">{tradingStats.open_positions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Best Trade</span>
                    <span className="font-mono text-green-400">+${tradingStats.best_trade.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Worst Trade</span>
                    <span className="font-mono text-red-400">${tradingStats.worst_trade.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Average Trade</span>
                    <span className="font-mono">${tradingStats.avg_trade.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="terminal-container">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Performance Chart
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[150px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Detailed performance charts coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
      
      {/* Paper Trades */}
      <Card className="terminal-container">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Paper Trades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="open">
            <TabsList className="mb-4">
              <TabsTrigger value="open">Open Positions</TabsTrigger>
              <TabsTrigger value="closed">Trade History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="open">
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {paperTrades.filter(t => t.status === 'open').length === 0 ? (
                    <div className="text-center py-12">
                      <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-bold mb-2">No Open Positions</h3>
                      <p className="text-muted-foreground">Place a paper trade to get started</p>
                    </div>
                  ) : (
                    paperTrades
                      .filter(t => t.status === 'open')
                      .map((trade, index) => (
                        <div
                          key={trade.id || index}
                          className="border border-border rounded-lg p-4 space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-primary">{trade.symbol}</span>
                              {getActionBadge(trade.action)}
                              {trade.pattern && <Badge variant="outline">{trade.pattern}</Badge>}
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(trade.status)}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => closePosition(trade.symbol)}
                              >
                                Close
                              </Button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Quantity:</span>
                              <div className="font-mono">{trade.quantity}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Entry Price:</span>
                              <div className="font-mono">${trade.entry_price}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Current Value:</span>
                              <div className="font-mono">$---.--</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Unrealized P&L:</span>
                              <div className="font-mono">$---.--</div>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="closed">
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {paperTrades.filter(t => t.status === 'closed').length === 0 ? (
                    <div className="text-center py-12">
                      <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-bold mb-2">No Trade History</h3>
                      <p className="text-muted-foreground">Closed trades will appear here</p>
                    </div>
                  ) : (
                    paperTrades
                      .filter(t => t.status === 'closed')
                      .map((trade, index) => (
                        <div
                          key={trade.id || index}
                          className="border border-border rounded-lg p-4 space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-primary">{trade.symbol}</span>
                              {getActionBadge(trade.action)}
                              {trade.pattern && <Badge variant="outline">{trade.pattern}</Badge>}
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(trade.status)}
                              {trade.pnl !== undefined && formatPnL(trade.pnl)}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Quantity:</span>
                              <div className="font-mono">{trade.quantity}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Entry Price:</span>
                              <div className="font-mono">${trade.entry_price}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Exit Price:</span>
                              <div className="font-mono">${trade.exit_price || '---.--'}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Date:</span>
                              <div className="font-mono">{new Date(trade.timestamp).toLocaleDateString()}</div>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaperTrading;