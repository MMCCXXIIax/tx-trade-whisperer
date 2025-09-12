import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, DollarSign, Target, Shield, Activity, Play, Pause, BarChart3, Wallet } from 'lucide-react';
import { safeFetch } from '@/lib/api';

interface Position {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  stopLoss?: number;
  takeProfit?: number;
}

interface TradeSignal {
  symbol: string;
  pattern: string;
  action: 'BUY' | 'SELL';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  confidence: number;
  riskReward: string;
}

export default function TradingInterface() {
  const [activeTab, setActiveTab] = useState('signals');
  const [portfolio, setPortfolio] = useState<Position[]>([]);
  const [signals, setSignals] = useState<TradeSignal[]>([]);
  const [balance, setBalance] = useState(100000); // Paper trading balance
  const [quantity, setQuantity] = useState('');
  const [selectedSignal, setSelectedSignal] = useState<TradeSignal | null>(null);

  // Execute paper trade
  const executePaperTrade = async (signal: TradeSignal, quantity: number) => {
    try {
      const tradeData = {
        symbol: signal.symbol,
        side: signal.action.toLowerCase(),
        quantity: quantity,
        price: signal.entryPrice,
        pattern: signal.pattern
      };

      const response = await safeFetch<{data: any}>('/paper/trade', {
        method: 'POST',
        body: JSON.stringify(tradeData)
      });

      if (response?.data) {
        console.log('Paper trade executed:', response.data);
        // Refresh portfolio
        window.location.reload();
      }
    } catch (error) {
      console.error('Error executing paper trade:', error);
    }
  };

  // Load real trading data from production API
  useEffect(() => {
    const loadTradingData = async () => {
      try {
        // Fetch entry/exit signals
        const signalsResponse = await safeFetch<{data: TradeSignal[]}>('/signals/entry-exit');
        if (signalsResponse?.data) {
          setSignals(signalsResponse.data);
        }

        // Fetch paper portfolio
        const portfolioResponse = await safeFetch<{data: Position[]}>('/paper/portfolio?userId=demo-user');
        if (portfolioResponse?.data) {
          // Transform API data to match our interface
          const transformedPortfolio = portfolioResponse.data.map((trade: any) => ({
            id: trade.id,
            symbol: trade.symbol,
            side: trade.side,
            quantity: trade.quantity,
            entryPrice: trade.price,
            currentPrice: trade.price * (1 + Math.random() * 0.1 - 0.05), // Simulate price movement
            pnl: 0, // Will be calculated
            pnlPercent: 0
          }));
          
          // Calculate P&L
          const updatedPortfolio = transformedPortfolio.map((pos: any) => {
            const pnl = (pos.currentPrice - pos.entryPrice) * pos.quantity;
            const pnlPercent = ((pos.currentPrice - pos.entryPrice) / pos.entryPrice) * 100;
            return { ...pos, pnl, pnlPercent };
          });
          
          setPortfolio(updatedPortfolio);
        }
      } catch (error) {
        console.error('Error loading trading data:', error);
        // Fallback to mock data
        loadMockData();
      }
    };

    const loadMockData = () => {
    const mockPositions: Position[] = [
      {
        id: '1',
        symbol: 'BTC',
        side: 'buy',
        quantity: 0.5,
        entryPrice: 93500,
        currentPrice: 95432,
        pnl: 966,
        pnlPercent: 2.06,
        stopLoss: 91000,
        takeProfit: 98000
      },
      {
        id: '2',
        symbol: 'ETH',
        side: 'buy',
        quantity: 2.0,
        entryPrice: 3180,
        currentPrice: 3240,
        pnl: 120,
        pnlPercent: 1.89,
        stopLoss: 3050,
        takeProfit: 3450
      }
    ];

    const mockSignals: TradeSignal[] = [
      {
        symbol: 'BTC',
        pattern: 'Bullish Engulfing',
        action: 'BUY',
        entryPrice: 95500,
        stopLoss: 92800,
        takeProfit: 104200,
        confidence: 89,
        riskReward: '1:3.2'
      },
      {
        symbol: 'SOL',
        pattern: 'Morning Star',
        action: 'BUY',
        entryPrice: 186,
        stopLoss: 178,
        takeProfit: 210,
        confidence: 85,
        riskReward: '1:3.0'
      },
      {
        symbol: 'ETH',
        pattern: 'Evening Star',
        action: 'SELL',
        entryPrice: 3230,
        stopLoss: 3350,
        takeProfit: 2950,
        confidence: 82,
        riskReward: '1:2.3'
      }
    ];

      setPortfolio(mockPositions);
      setSignals(mockSignals);
    };

    loadTradingData();
    
    // Set up periodic updates
    const interval = setInterval(loadTradingData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const executeSignal = (signal: TradeSignal) => {
    if (!quantity) return;
    
    // Simulate paper trade execution
    const newPosition: Position = {
      id: Date.now().toString(),
      symbol: signal.symbol,
      side: signal.action.toLowerCase() as 'buy' | 'sell',
      quantity: parseFloat(quantity),
      entryPrice: signal.entryPrice,
      currentPrice: signal.entryPrice,
      pnl: 0,
      pnlPercent: 0,
      stopLoss: signal.stopLoss,
      takeProfit: signal.takeProfit
    };

    setPortfolio(prev => [...prev, newPosition]);
    setQuantity('');
    setSelectedSignal(null);
    
    // Update balance (simplified)
    const tradeValue = signal.entryPrice * parseFloat(quantity);
    setBalance(prev => prev - tradeValue);
  };

  const closePosition = (positionId: string) => {
    const position = portfolio.find(p => p.id === positionId);
    if (!position) return;

    // Add PnL back to balance
    setBalance(prev => prev + position.pnl + (position.entryPrice * position.quantity));
    setPortfolio(prev => prev.filter(p => p.id !== positionId));
  };

  const totalPnL = portfolio.reduce((sum, pos) => sum + pos.pnl, 0);
  const totalPnLPercent = portfolio.length > 0 ? (totalPnL / balance) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-600">Balance</span>
            </div>
            <div className="text-2xl font-bold">{formatPrice(balance)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-gray-600">Total P&L</span>
            </div>
            <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalPnL >= 0 ? '+' : ''}{formatPrice(totalPnL)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span className="text-sm text-gray-600">P&L %</span>
            </div>
            <div className={`text-2xl font-bold ${totalPnLPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalPnLPercent >= 0 ? '+' : ''}{formatNumber(totalPnLPercent)}%
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-orange-600" />
              <span className="text-sm text-gray-600">Positions</span>
            </div>
            <div className="text-2xl font-bold">{portfolio.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="signals" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="signals">Trading Signals</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="history">Trade History</TabsTrigger>
        </TabsList>

        <TabsContent value="signals" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Signals List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Active Trading Signals</h3>
              {signals.map((signal, index) => (
                <Card 
                  key={index} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedSignal === signal ? 'border-blue-500 shadow-md' : ''
                  }`}
                  onClick={() => setSelectedSignal(signal)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {signal.action === 'BUY' ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-semibold">{signal.symbol}</span>
                        <Badge variant="outline">{signal.pattern}</Badge>
                      </div>
                      <Badge className={`${signal.action === 'BUY' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                        {signal.action}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Entry:</span>
                        <div className="font-medium">{formatPrice(signal.entryPrice)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Confidence:</span>
                        <div className="font-medium">{signal.confidence}%</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Risk/Reward:</span>
                        <div className="font-medium">{signal.riskReward}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Stop Loss:</span>
                        <div className="font-medium">{formatPrice(signal.stopLoss)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Trading Panel */}
            <div>
              {selectedSignal ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      {selectedSignal.action === 'BUY' ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      )}
                      <span>Execute Trade: {selectedSignal.symbol}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-500">Entry Price</span>
                        <div className="font-semibold">{formatPrice(selectedSignal.entryPrice)}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Action</span>
                        <div className={`font-semibold ${selectedSignal.action === 'BUY' ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedSignal.action}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Stop Loss</span>
                        <div className="font-semibold text-red-600">{formatPrice(selectedSignal.stopLoss)}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Take Profit</span>
                        <div className="font-semibold text-green-600">{formatPrice(selectedSignal.takeProfit)}</div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Quantity</label>
                      <Input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="Enter quantity"
                        step="0.01"
                      />
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Trade Value</div>
                      <div className="font-semibold">
                        {quantity ? formatPrice(selectedSignal.entryPrice * parseFloat(quantity)) : formatPrice(0)}
                      </div>
                    </div>

                    <Button 
                      className="w-full"
                      onClick={() => executeSignal(selectedSignal)}
                      disabled={!quantity || parseFloat(quantity) <= 0}
                    >
                      Execute {selectedSignal.action} Order
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Select a signal to place a trade</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="portfolio">
          <Card>
            <CardHeader>
              <CardTitle>Open Positions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {portfolio.map((position) => (
                  <div key={position.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {position.side === 'buy' ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-semibold">{position.symbol}</span>
                        <Badge variant="outline" className={position.side === 'buy' ? 'text-green-600' : 'text-red-600'}>
                          {position.side.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-sm">
                        <div>Qty: {formatNumber(position.quantity)}</div>
                        <div>Entry: {formatPrice(position.entryPrice)}</div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`font-semibold ${position.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {position.pnl >= 0 ? '+' : ''}{formatPrice(position.pnl)}
                      </div>
                      <div className={`text-sm ${position.pnlPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {position.pnlPercent >= 0 ? '+' : ''}{formatNumber(position.pnlPercent)}%
                      </div>
                    </div>

                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => closePosition(position.id)}
                    >
                      Close
                    </Button>
                  </div>
                ))}
                
                {portfolio.length === 0 && (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No open positions</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Trade History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Trade history will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}