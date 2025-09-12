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
import { safeFetch } from '@/lib/api'; // same helper as PortfolioPanel

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

<<<<<<< HEAD
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

=======
>>>>>>> c646b09155e6d424b19520438c4cb96f629963d5
// Use centralized API utilities

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
<<<<<<< HEAD
    try {
      const json = await safeFetch<{ paper_trades: PaperTrade[]; positions: PaperTrade[] }>('/api/paper/portfolio');
      if (json?.paper_trades) {
        setPaperTrades(json.paper_trades);
      } else if (json?.positions) {
        setPaperTrades(json.positions);
      } else if (Array.isArray(json)) {
        // Handle direct array response
        setPaperTrades(json);
      }
    } catch (error) {
      console.error('Failed to fetch paper trades:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTradingStats = async () => {
    try {
      const json = await safeFetch<TradingStats>('/api/paper/portfolio');
      if (json && json.total_balance !== undefined) {
        // Backend returned portfolio with stats
        setTradingStats({
          total_balance: json.total_balance || 100000,
          total_pnl: json.total_pnl || 0,
          win_rate: json.win_rate || 0,
          total_trades: json.total_trades || paperTrades.length,
          open_positions: json.open_positions || paperTrades.filter(t => t.status === 'open').length,
          best_trade: json.best_trade || 0,
          worst_trade: json.worst_trade || 0,
          avg_trade: json.avg_trade || 0
        });
      } else {
        // If no stats in portfolio response, calculate from trades
        const stats = calculateStatsFromTrades(paperTrades);
        setTradingStats(stats);
      }
    } catch (error) {
      console.error('Failed to fetch trading stats:', error);
      // Fallback to calculated stats
      const stats = calculateStatsFromTrades(paperTrades);
      setTradingStats(stats);
    }
=======
    const json = await safeFetch<{ paper_trades: PaperTrade[] }>('/api/paper-trades');
    if (json?.paper_trades) setPaperTrades(json.paper_trades);
    setIsLoading(false);
  };

  const fetchTradingStats = async () => {
    const json = await safeFetch<TradingStats>('/api/get_trading_stats');
    if (json) setTradingStats(json);
>>>>>>> c646b09155e6d424b19520438c4cb96f629963d5
  };

  const placePaperTrade = async () => {
    if (!symbol || !quantity || !price) {
      toast({ title: 'Missing Information', description: 'Please fill in all trade details', variant: 'destructive' });
      return;
    }
    setIsTrading(true);
<<<<<<< HEAD
    const result = await safeFetch('/api/paper/trade', {
=======
    const result = await safeFetch('/api/paper-trades', {
>>>>>>> c646b09155e6d424b19520438c4cb96f629963d5
      method: 'POST',
      body: JSON.stringify({
        symbol: symbol.toUpperCase(),
        side: action.toLowerCase(),
<<<<<<< HEAD
        quantity: parseFloat(quantity),
=======
        qty: parseFloat(quantity),
>>>>>>> c646b09155e6d424b19520438c4cb96f629963d5
        price: parseFloat(price),
        pattern: 'Manual',
        confidence: 1.0,
      }),
    });
    if (result) {
      toast({ title: 'Trade Placed', description: `${action} ${quantity} ${symbol.toUpperCase()} @ $${price}` });
      setSymbol('');
      setQuantity('');
      setPrice('');
      setAction('BUY');
      fetchPaperTrades();
      fetchTradingStats();
<<<<<<< HEAD
    } else {
      toast({ title: 'Trade Failed', description: 'Unable to place paper trade. Please try again.', variant: 'destructive' });
=======
>>>>>>> c646b09155e6d424b19520438c4cb96f629963d5
    }
    setIsTrading(false);
  };

  const closePosition = async (symbol: string) => {
<<<<<<< HEAD
    try {
      // Find the trade to close
      const trade = paperTrades.find(t => t.symbol === symbol && t.status === 'open');
      if (!trade || !trade.id) {
        toast({ title: 'Error', description: 'Trade not found or missing ID', variant: 'destructive' });
        return;
      }

      const result = await safeFetch(`/api/paper/trade/${trade.id}/close`, {
        method: 'POST',
        body: JSON.stringify({ price: 0 }), // Backend will get current price
      });
      if (result) {
        toast({ title: 'Position Closed', description: `${symbol} position closed successfully` });
        fetchPaperTrades();
        fetchTradingStats();
      } else {
        toast({ title: 'Close Failed', description: `Unable to close ${symbol} position. Please try again.`, variant: 'destructive' });
      }
    } catch (error) {
      console.error('Failed to close position:', error);
      toast({ title: 'Close Failed', description: `Error closing ${symbol} position.`, variant: 'destructive' });
=======
    const result = await safeFetch('/api/close-position', {
      method: 'POST',
      body: JSON.stringify({ symbol, price: 0 }), // Backend will get current price
    });
    if (result) {
      toast({ title: 'Position Closed', description: `${symbol} position closed successfully` });
      fetchPaperTrades();
      fetchTradingStats();
>>>>>>> c646b09155e6d424b19520438c4cb96f629963d5
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

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="terminal-container">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Performance Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Win Rate</span>
                      <span>{tradingStats.win_rate}%</span>
                    </div>
                    <Progress value={tradingStats.win_rate} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center p-3 border border-border rounded">
                      <div className="text-sm text-muted-foreground">Best Trade</div>
                      <div className="font-bold text-green-400">+${tradingStats.best_trade.toFixed(2)}</div>
                    </div>
                    <div className="text-center p-3 border border-border rounded">
                      <div className="text-sm text-muted-foreground">Worst Trade</div>
                      <div className="font-bold text-red-400">${tradingStats.worst_trade.toFixed(2)}</div>
                    </div>
                  </div>
                  
                  <div className="text-center p-3 border border-border rounded">
                    <div className="text-sm text-muted-foreground">Average P&L</div>
                    <div className="font-bold">{formatPnL(tradingStats.avg_trade)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="terminal-container">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Current Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border border-border rounded">
                    <div className="text-2xl font-bold text-blue-400">{tradingStats.open_positions}</div>
                    <div className="text-sm text-muted-foreground">Open Positions</div>
                  </div>
                  <div className="text-center p-4 border border-border rounded">
                    <div className="text-2xl font-bold text-accent">{tradingStats.total_trades - tradingStats.open_positions}</div>
                    <div className="text-sm text-muted-foreground">Closed Trades</div>
                  </div>
                </div>
                
                {tradingStats.total_pnl > 0 ? (
                  <div className="text-center p-3 bg-green-500/10 border border-green-500/30 rounded">
                    <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-1" />
                    <div className="text-sm text-green-400">Portfolio Growing</div>
                  </div>
                ) : (
                  <div className="text-center p-3 bg-red-500/10 border border-red-500/30 rounded">
                    <TrendingDown className="w-6 h-6 text-red-400 mx-auto mb-1" />
                    <div className="text-sm text-red-400">Portfolio Declining</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Trading Tabs */}
      <Tabs defaultValue="open" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="open">Open Positions</TabsTrigger>
          <TabsTrigger value="history">Trading History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="open" className="mt-6">
          <Card className="terminal-container">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <Play className="w-5 h-5" />
                Open Positions ({paperTrades.filter(t => t.status === 'open').length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {paperTrades.filter(t => t.status === 'open').length === 0 ? (
                    <div className="text-center py-12">
                      <Play className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-bold mb-2">No open positions</h3>
                      <p className="text-muted-foreground">Place a trade to start building your portfolio</p>
                    </div>
                  ) : (
                    paperTrades.filter(t => t.status === 'open').map((trade) => (
                      <div
                        key={trade.id}
                        className="border border-border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-primary text-lg">{trade.symbol}</span>
                            {getActionBadge(trade.action)}
                            {getStatusBadge(trade.status)}
                            {trade.pattern && (
                              <Badge variant="outline">{trade.pattern}</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => closePosition(trade.symbol)}
                              className="text-red-400 border-red-400 hover:bg-red-400/10"
                            >
                              <Square className="w-4 h-4 mr-1" />
                              Close
                            </Button>
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">
                                {new Date(trade.timestamp).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Entry Price:</span>
                            <div className="font-mono">${trade.entry_price}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Quantity:</span>
                            <div className="font-mono">{trade.quantity}</div>
                          </div>
                          {trade.confidence && (
                            <div>
                              <span className="text-muted-foreground">Confidence:</span>
                              <div className="font-mono">{trade.confidence}</div>
                            </div>
                          )}
                          <div>
                            <span className="text-muted-foreground">Trade ID:</span>
                            <div className="font-mono">#{trade.id}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card className="terminal-container">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Complete Trading History ({paperTrades.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {paperTrades.length === 0 ? (
                    <div className="text-center py-12">
                      <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-bold mb-2">No paper trades yet</h3>
                      <p className="text-muted-foreground">Start trading to see your history here</p>
                    </div>
                  ) : (
                    paperTrades.map((trade) => (
                      <div
                        key={trade.id}
                        className="border border-border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-primary text-lg">{trade.symbol}</span>
                            {getActionBadge(trade.action)}
                            {getStatusBadge(trade.status)}
                            {trade.pattern && (
                              <Badge variant="outline">{trade.pattern}</Badge>
                            )}
                          </div>
                          <div className="text-right">
                            {trade.pnl !== undefined && (
                              <div className="font-bold text-lg">{formatPnL(trade.pnl)}</div>
                            )}
                            <div className="text-sm text-muted-foreground">
                              {new Date(trade.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Entry Price:</span>
                            <div className="font-mono">${trade.entry_price}</div>
                          </div>
                          {trade.exit_price && (
                            <div>
                              <span className="text-muted-foreground">Exit Price:</span>
                              <div className="font-mono">${trade.exit_price}</div>
                            </div>
                          )}
                          <div>
                            <span className="text-muted-foreground">Quantity:</span>
                            <div className="font-mono">{trade.quantity}</div>
                          </div>
                          {trade.confidence && (
                            <div>
                              <span className="text-muted-foreground">Confidence:</span>
                              <div className="font-mono">{trade.confidence}</div>
                            </div>
                          )}
                          <div>
                            <span className="text-muted-foreground">Trade ID:</span>
                            <div className="font-mono">#{trade.id}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaperTrading;
