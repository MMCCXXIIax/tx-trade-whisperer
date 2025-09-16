import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Eye, BookOpen, Target, RefreshCw, Bell, Play } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

interface Pattern {
  id: string;
  name: string;
  type: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  symbol: string;
  price: number;
  timestamp: string;
  description: string;
  successRate: number;
  riskReward: string;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  explanation: string;
}

interface PatternStats {
  pattern: string;
  successRate: number;
  avgReturn: number;
  frequency: number;
}

export default function PatternDetection() {
  const [detectedPatterns, setDetectedPatterns] = useState<Pattern[]>([]);
  const [patternStats, setPatternStats] = useState<PatternStats[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null);
  const [selectedAsset, setSelectedAsset] = useState('BTC');
  const [timeframe, setTimeframe] = useState('1H');

  // Fetch pattern detection data from production API
  useEffect(() => {
    const fetchPatternData = async () => {
      try {
        // Enhanced detection via Flask endpoint
        const patternsResponse = await apiClient.detectEnhanced({ symbol: selectedAsset, timeframe });
        const detections = Array.isArray(patternsResponse?.data) ? patternsResponse?.data : (patternsResponse?.data?.detections || []);
        if (detections?.length) {
          const transformedPatterns = detections.map((p: any, idx: number) => {
            const priceNum = typeof p.price === 'number' ? p.price : parseFloat(String(p.price || '0').replace(/[^0-9.-]+/g, ''));
            const name = p.pattern || p.name || 'Pattern';
            return {
              id: String(p.id ?? idx),
              name,
              type: /bull/i.test(name) ? 'bullish' : /bear/i.test(name) ? 'bearish' : 'neutral',
              confidence: Math.round(p.confidence ?? p.score ?? 0),
              symbol: p.symbol || selectedAsset,
              price: priceNum || 0,
              timestamp: p.timestamp || new Date().toISOString(),
              description: p.description || `${name} detected with ${Math.round(p.confidence ?? 0)}% confidence`,
              successRate: p.success_rate ?? 0,
              riskReward: p.risk_reward ? String(p.risk_reward) : '—',
              entryPrice: p.entry ?? priceNum ?? 0,
              stopLoss: p.stop_loss ?? (priceNum ? priceNum * 0.97 : 0),
              takeProfit: p.take_profit ?? (priceNum ? priceNum * 1.05 : 0),
              explanation: p.explanation || p.reasoning || ''
            } as Pattern;
          });
          setDetectedPatterns(transformedPatterns);
        } else {
          setDetectedPatterns([]);
        }

        // Fetch pattern list for statistics from Flask endpoint
        const patternsListResponse = await apiClient.getPatternsList();
        const list = (patternsListResponse?.data as string[]) || [];
        if (list.length) {
          const mockStats: PatternStats[] = list.slice(0, 5).map((pattern) => ({
            pattern,
            successRate: 0,
            avgReturn: 0,
            frequency: 0
          }));
          setPatternStats(mockStats);
        } else {
          setPatternStats([]);
        }
      } catch (error) {
        console.error('Error fetching pattern data:', error);
        setDetectedPatterns([]);
        setPatternStats([]);
      }
    };

    fetchPatternData();
  }, [selectedAsset, timeframe]);

  const handleExplainPattern = async (pattern: Pattern) => {
    try {
      // Use Flask endpoint: GET /api/explain/pattern/{pattern_name}
      const explanation = await apiClient.getPatternExplanation(pattern.name);
      const exp = (explanation as any)?.data?.explanation || (explanation as any)?.explanation;
      if (exp) {
        setSelectedPattern({ ...pattern, explanation: exp });
      }
    } catch (error) {
      console.error('Error fetching pattern explanation:', error);
    }
  };

  const handleTradeSignal = async (pattern: Pattern) => {
    try {
      const signals = await apiClient.generateEntryExitSignals({ symbol: pattern.symbol, pattern: pattern.name, timeframe });
      const arr = (signals as any)?.data || [];
      const matchingSignal = Array.isArray(arr) ? arr.find((s:any) => (s.symbol||s.ticker) === pattern.symbol) : arr;
      if (matchingSignal) {
        console.log('Trade signal:', matchingSignal);
      }
    } catch (error) {
      console.error('Error fetching trade signals:', error);
    }
  };

  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'bullish':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'bearish':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-600 bg-green-100';
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Pattern Detection</h2>
          <p className="text-gray-600">20+ candlestick patterns with confidence scoring</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <select 
            value={selectedAsset} 
            onChange={(e) => setSelectedAsset(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white min-w-[120px]"
          >
            <option value="BTC">Bitcoin</option>
            <option value="ETH">Ethereum</option>
            <option value="SOL">Solana</option>
            <option value="AAPL">Apple</option>
            <option value="TSLA">Tesla</option>
          </select>
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white min-w-[100px]"
          >
            <option value="1H">1 Hour</option>
            <option value="4H">4 Hours</option>
            <option value="1D">1 Day</option>
            <option value="1W">1 Week</option>
          </select>
        </div>
      </div>

      <Tabs defaultValue="detected" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="detected">Detected Patterns</TabsTrigger>
          <TabsTrigger value="statistics">Pattern Statistics</TabsTrigger>
          <TabsTrigger value="education">Pattern Education</TabsTrigger>
        </TabsList>

        <TabsContent value="detected" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pattern List */}
            <div className="space-y-4">
              {detectedPatterns.map((pattern) => (
                <Card 
                  key={pattern.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedPattern?.id === pattern.id ? 'border-blue-500 shadow-md' : ''
                  }`}
                  onClick={() => setSelectedPattern(pattern)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getPatternIcon(pattern.type)}
                        <span className="font-semibold">{pattern.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {pattern.symbol}
                        </Badge>
                      </div>
                      <Badge className={`${getConfidenceColor(pattern.confidence)}`}>
                        {pattern.confidence}%
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Price:</span>
                        <span className="font-medium">{formatPrice(pattern.price)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Success Rate:</span>
                        <span className="font-medium">{pattern.successRate}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Risk/Reward:</span>
                        <span className="font-medium">{pattern.riskReward}</span>
                      </div>
                    </div>

                    <Progress value={pattern.confidence} className="mt-3" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pattern Details */}
            <div>
              {selectedPattern ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      {getPatternIcon(selectedPattern.type)}
                      <span>{selectedPattern.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Description</h4>
                      <p className="text-sm text-gray-600">{selectedPattern.description}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Trading Signals</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Entry:</span>
                          <div className="font-medium">{formatPrice(selectedPattern.entryPrice)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Stop Loss:</span>
                          <div className="font-medium text-red-600">{formatPrice(selectedPattern.stopLoss)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Take Profit:</span>
                          <div className="font-medium text-green-600">{formatPrice(selectedPattern.takeProfit)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Risk/Reward:</span>
                          <div className="font-medium">{selectedPattern.riskReward}</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Pattern Analysis</h4>
                      <p className="text-sm text-gray-600">{selectedPattern.explanation}</p>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-green-600 hover:bg-green-700" 
                        onClick={() => handleTradeSignal(selectedPattern)}
                      >
                        <Target className="h-4 w-4 mr-1" />
                        Trade Signal
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleExplainPattern(selectedPattern)}
                      >
                        <BookOpen className="h-4 w-4 mr-1" />
                        Explain
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Eye className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Select a pattern to view details</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="statistics">
          <Card>
            <CardHeader>
              <CardTitle>Pattern Performance Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={patternStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="pattern" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="successRate" fill="#3b82f6" name="Success Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Pattern Education Center</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Learn Trading Patterns</h3>
                <p className="text-gray-600 mb-4">
                  Master candlestick patterns with our comprehensive educational resources
                </p>
                <Button>
                  Start Learning
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}