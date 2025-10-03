import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, DollarSign, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

interface PaperTrade {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  qty: number;
  price: number;
  opened_at: string;
  closed_at?: string;
  pnl?: number;
  status: 'open' | 'closed';
}

export function TXTradingDashboard() {
  const { toast } = useToast();
  const [trades, setTrades] = useState<PaperTrade[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState('BTC');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState('1');
  const [portfolio, setPortfolio] = useState({ balance: 10000, equity: 10000 });

  useEffect(() => {
    loadTrades();
  }, []);

  const loadTrades = async () => {
    try {
      const result = await apiClient.getPaperPortfolio('demo-user');
      if (result.success && result.data) {
        setTrades(result.data as any);
      }
    } catch (error) {
      console.error('Failed to load trades:', error);
    }
  };

  const executeTrade = async () => {
    try {
      const result = await apiClient.executePaperTrade({
        symbol: selectedSymbol,
        side: tradeType,
        qty: parseFloat(quantity),
        price: 95000, // Mock price
        user_id: 'demo-user'
      });

      if (result.success) {
        toast({ title: 'Trade Executed', description: `${tradeType.toUpperCase()} ${quantity} ${selectedSymbol}` });
        loadTrades();
      }
    } catch (error) {
      toast({ title: 'Trade Failed', description: 'Unable to execute trade', variant: 'destructive' });
    }
  };

  const openTrades = trades.filter(t => t.status === 'open');
  const closedTrades = trades.filter(t => t.status === 'closed');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="tx-heading-xl">Paper Trading</h1>
        <p className="text-muted-foreground">Practice trading with virtual funds</p>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="tx-terminal-glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className="text-2xl font-bold text-foreground">${portfolio.balance.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-tx-green/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="tx-terminal-glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Equity</p>
                <p className="text-2xl font-bold text-foreground">${portfolio.equity.toLocaleString()}</p>
              </div>
              <Activity className="w-8 h-8 text-tx-blue/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="tx-terminal-glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Positions</p>
                <p className="text-2xl font-bold text-foreground">{openTrades.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-tx-orange/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Trading Panel */}
        <Card className="lg:col-span-1 tx-terminal-glass">
          <CardHeader>
            <CardTitle>Execute Trade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Symbol</Label>
              <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
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
              <Label>Type</Label>
              <Select value={tradeType} onValueChange={(v) => setTradeType(v as 'buy' | 'sell')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                step="0.01"
                min="0"
              />
            </div>

            <Button 
              className={tradeType === 'buy' ? 'tx-btn-primary w-full' : 'bg-tx-red hover:bg-tx-red/90 w-full'}
              onClick={executeTrade}
            >
              {tradeType === 'buy' ? <ArrowUpRight className="w-4 h-4 mr-2" /> : <ArrowDownRight className="w-4 h-4 mr-2" />}
              {tradeType.toUpperCase()} {selectedSymbol}
            </Button>
          </CardContent>
        </Card>

        {/* Open Positions */}
        <Card className="lg:col-span-2 tx-terminal-glass">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Open Positions
              <Badge variant="secondary">{openTrades.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {openTrades.length > 0 ? (
              <div className="space-y-3">
                {openTrades.map((trade) => (
                  <div key={trade.id} className="p-4 bg-card/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant={trade.side === 'buy' ? 'default' : 'secondary'}>
                          {trade.side.toUpperCase()}
                        </Badge>
                        <span className="font-medium">{trade.symbol}</span>
                        <span className="text-sm text-muted-foreground">×{trade.qty}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-mono">${trade.price.toLocaleString()}</p>
                        <Button size="sm" variant="outline" className="mt-2">Close</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No open positions</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trade History */}
      <Card className="tx-terminal-glass">
        <CardHeader>
          <CardTitle>Trade History</CardTitle>
        </CardHeader>
        <CardContent>
          {closedTrades.length > 0 ? (
            <div className="space-y-2">
              {closedTrades.map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-3 bg-card/20 rounded">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{trade.symbol}</Badge>
                    <span className="text-sm">{trade.side}</span>
                    <span className="text-sm text-muted-foreground">×{trade.qty}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono">${trade.price}</span>
                    {trade.pnl && (
                      <Badge className={trade.pnl >= 0 ? 'bg-tx-green/20 text-tx-green' : 'bg-tx-red/20 text-tx-red'}>
                        {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}%
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No trade history</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}