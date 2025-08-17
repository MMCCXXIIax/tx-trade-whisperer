import React, { useState, useEffect } from 'react';
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

interface PaperTrade {
  id: number;
  symbol: string;
  action: string;
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

const API_BASE = 'https://tx-predictive-intelligence.onrender.com/';

const PaperTrading: React.FC = () => {
  const [paperTrades, setPaperTrades] = useState<PaperTrade[]>([]);
  const [tradingStats, setTradingStats] = useState<TradingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Trading form state
  const [symbol, setSymbol] = useState('');
  const [action, setAction] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [isTrading, setIsTrading] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchPaperTrades();
    fetchTradingStats();
  }, []);

  const fetchPaperTrades = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/get_paper_trades`);
      if (response.ok) {
        const data = await response.json();
        setPaperTrades(data.trades || []);
      }
    } catch (error) {
      console.error('Failed to fetch paper trades:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTradingStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/get_trading_stats`);
      if (response.ok) {
        const data = await response.json();
        setTradingStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch trading stats:', error);
    }
  };

  const placePaperTrade = async () => {
    if (!symbol || !quantity || !price) {
      toast({
        title: "Missing Information",
        description: "Please fill in all trade details",
        variant: "destructive"
      });
      return;
    }

    setIsTrading(true);
    try {
      const response = await fetch(`${API_BASE}/api/paper-trade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: symbol.toUpperCase(),
          action,
          quantity: parseFloat(quantity),
          price: parseFloat(price)
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Trade Placed Successfully",
          description: `${action} ${quantity} shares of ${symbol.toUpperCase()} at $${price}`,
        });
        
        // Reset form
        setSymbol('');
        setQuantity('');
        setPrice('');
        
        // Refresh data
        fetchPaperTrades();
        fetchTradingStats();
      } else {
        throw new Error('Failed to place trade');
      }
    } catch (error) {
      toast({
        title: "Trade Failed",
        description: "Unable to place trade. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsTrading(false);
    }
  };

  const closePosition = async (tradeId: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/close-position`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trade_id: tradeId }),
      });

      if (response.ok) {
        toast({
          title: "Position Closed",
          description: "Position closed successfully",
        });
        
        // Refresh data
        fetchPaperTrades();
        fetchTradingStats();
      } else {
        throw new Error('Failed to close position');
      }
    } catch (error) {
      toast({
        title: "Close Failed",
        description: "Unable to close position. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatPnL = (pnl: number) => {
    const isPositive = pnl >= 0;
    return (
      <span className={isPositive ? 'text-green-400' : 'text-red-400'}>
        {isPositive ? '+' : ''}${pnl.toFixed(2)}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    return status === 'open' ? 
      <Badge variant="default" className="bg-blue-500/20 text-blue-400 border-blue-500">Open</Badge> :
      <Badge variant="secondary">Closed</Badge>;
  };

  const getActionBadge = (action: string) => {
    return action === 'BUY' ? 
      <Badge className="bg-green-500/20 text-green-400 border-green-500">BUY</Badge> :
      <Badge className="bg-red-500/20 text-red-400 border-red-500">SELL</Badge>;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="text-primary text-xl font-bold">Loading Paper Trading...</div>
        </div>
      </div>
    );
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
                              onClick={() => closePosition(trade.id)}
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
