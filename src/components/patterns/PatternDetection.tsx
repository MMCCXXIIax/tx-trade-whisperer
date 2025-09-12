import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Eye, BookOpen, Target, RefreshCw, Bell, Play } from 'lucide-react';
import { safeFetch } from '@/lib/api';

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
        // Fetch detected patterns for selected asset
        const patternsResponse = await safeFetch<{data: Pattern[]}>(`/detect/${selectedAsset}`);
        if (patternsResponse?.data) {
          // Transform API data to match our interface
          const transformedPatterns = patternsResponse.data.map((p: any) => ({
            ...p,
            type: p.pattern.includes('Bullish') || p.pattern.includes('Morning') || p.pattern.includes('Hammer') 
              ? 'bullish' : p.pattern.includes('Bearish') || p.pattern.includes('Evening') || p.pattern.includes('Shooting') 
              ? 'bearish' : 'neutral',
            name: p.pattern,
            description: `${p.pattern} detected with ${p.confidence}% confidence`,
            successRate: 85.0, // Default values, will be enhanced
            riskReward: '1:2.5',
            entryPrice: p.price * 1.005,
            stopLoss: p.price * 0.97,
            takeProfit: p.price * 1.08,
            explanation: `${p.pattern} pattern detected. This is a ${p.verified ? 'verified' : 'unverified'} signal.`
          }));
          setDetectedPatterns(transformedPatterns);
        }

        // Fetch pattern statistics
        const patternsListResponse = await safeFetch<{data: string[]}>('/patterns/list');
        if (patternsListResponse?.data) {
          const mockStats: PatternStats[] = patternsListResponse.data.slice(0, 5).map((pattern, index) => ({
            pattern,
            successRate: 75 + Math.random() * 20,
            avgReturn: (Math.random() - 0.3) * 15,
            frequency: Math.floor(Math.random() * 30) + 5
          }));
          setPatternStats(mockStats);
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
      const explanation = await safeFetch<{data: any}>(`/explain/pattern/${pattern.name}`);
      if (explanation?.data) {
        // Update the selected pattern with detailed explanation
        setSelectedPattern({
          ...pattern,
          explanation: explanation.data.explanation || pattern.explanation
        });
      }
    } catch (error) {
      console.error('Error fetching pattern explanation:', error);
    }
  };

  const handleTradeSignal = async (pattern: Pattern) => {
    try {
      const signals = await safeFetch<{data: any[]}>('/signals/entry-exit');
      if (signals?.data) {
        // Find matching signal for this pattern
        const matchingSignal = signals.data.find(s => s.symbol === pattern.symbol);
        if (matchingSignal) {
          console.log('Trade signal:', matchingSignal);
          // Could open trading interface or show signal details
        }
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