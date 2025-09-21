import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, BookOpen, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

interface PatternInfo {
  name: string;
  type: 'bullish' | 'bearish' | 'neutral';
  description: string;
  success_rate: number;
  timeframe_weight: Record<string, number>;
  confirmation_factors: string[];
  image_url?: string;
  example_url?: string;
}

const PatternRegistry: React.FC = () => {
  const [patterns, setPatterns] = useState<PatternInfo[]>([]);
  const [filteredPatterns, setFilteredPatterns] = useState<PatternInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPatterns = async () => {
      setIsLoading(true);
      try {
        // Try to get patterns from dedicated endpoint
        const response = await apiClient.getPatternRegistry();
        
        if (response && response.data?.patterns) {
          setPatterns(response.data.patterns);
        } else {
          // Fallback: Get patterns from scan results
          const scanResponse = await apiClient.getMarketScan();
          
          if (scanResponse && scanResponse.data) {
            // Extract unique patterns from scan results
            const patternSet = new Set<string>();
            const patternInfoMap: Record<string, Partial<PatternInfo>> = {};
            
            // Process scan results to extract pattern information
            if (scanResponse.data.results) {
              scanResponse.data.results.forEach((result: any) => {
                if (result.pattern) {
                  patternSet.add(result.pattern);
                  
                  // Initialize pattern info if not exists
                  if (!patternInfoMap[result.pattern]) {
                    patternInfoMap[result.pattern] = {
                      name: result.pattern,
                      type: result.action === 'buy' ? 'bullish' : result.action === 'sell' ? 'bearish' : 'neutral',
                      description: result.explanation || `${result.pattern} pattern`,
                      success_rate: 0,
                      timeframe_weight: {},
                      confirmation_factors: []
                    };
                  }
                  
                  // Update pattern info with additional data if available
                  if (result.confidence) {
                    patternInfoMap[result.pattern].success_rate = parseFloat(result.confidence);
                  }
                  
                  if (result.timeframe) {
                    patternInfoMap[result.pattern].timeframe_weight = {
                      ...patternInfoMap[result.pattern].timeframe_weight,
                      [result.timeframe]: 1.0
                    };
                  }
                }
              });
            }
            
            // Convert to array of PatternInfo objects
            const extractedPatterns: PatternInfo[] = Array.from(patternSet).map(name => ({
              name,
              type: patternInfoMap[name]?.type || 'neutral',
              description: patternInfoMap[name]?.description || `${name} pattern`,
              success_rate: patternInfoMap[name]?.success_rate || 0,
              timeframe_weight: patternInfoMap[name]?.timeframe_weight || {},
              confirmation_factors: patternInfoMap[name]?.confirmation_factors || [],
              image_url: patternInfoMap[name]?.image_url,
              example_url: patternInfoMap[name]?.example_url
            }));
            
            setPatterns(extractedPatterns);
          } else {
            // Fallback to hardcoded patterns if no API data available
            setPatterns([
              {
                name: 'Hammer',
                type: 'bullish',
                description: 'A single candlestick pattern with a small body and a long lower shadow, at least twice the size of the body.',
                success_rate: 67,
                timeframe_weight: { '1h': 0.7, '4h': 0.8, '1d': 1.0 },
                confirmation_factors: ['Volume increase', 'Support level', 'Oversold conditions']
              },
              {
                name: 'Shooting Star',
                type: 'bearish',
                description: 'A single candlestick pattern with a small body and a long upper shadow, at least twice the size of the body.',
                success_rate: 65,
                timeframe_weight: { '1h': 0.7, '4h': 0.8, '1d': 1.0 },
                confirmation_factors: ['Volume increase', 'Resistance level', 'Overbought conditions']
              },
              {
                name: 'Engulfing',
                type: 'bullish',
                description: 'A two-candlestick pattern where the second candle completely engulfs the first one.',
                success_rate: 78,
                timeframe_weight: { '1h': 0.8, '4h': 0.9, '1d': 1.0 },
                confirmation_factors: ['Volume increase', 'Support level', 'Trend reversal']
              },
              {
                name: 'Evening Star',
                type: 'bearish',
                description: 'A three-candlestick pattern signaling a potential reversal from an uptrend to a downtrend.',
                success_rate: 72,
                timeframe_weight: { '1h': 0.7, '4h': 0.9, '1d': 1.0 },
                confirmation_factors: ['Volume confirmation', 'Resistance level', 'Overbought conditions']
              },
              {
                name: 'Morning Star',
                type: 'bullish',
                description: 'A three-candlestick pattern signaling a potential reversal from a downtrend to an uptrend.',
                success_rate: 76,
                timeframe_weight: { '1h': 0.7, '4h': 0.9, '1d': 1.0 },
                confirmation_factors: ['Volume confirmation', 'Support level', 'Oversold conditions']
              },
              {
                name: 'Doji',
                type: 'neutral',
                description: 'A candlestick with a very small body, indicating indecision in the market.',
                success_rate: 50,
                timeframe_weight: { '1h': 0.6, '4h': 0.7, '1d': 0.8 },
                confirmation_factors: ['Volume analysis', 'Support/Resistance', 'Market context']
              }
            ]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch pattern registry:', error);
        // Fallback to empty array
        setPatterns([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatterns();
  }, []);

  // Filter patterns based on search term and active tab
  useEffect(() => {
    let filtered = patterns;
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(pattern => 
        pattern.name.toLowerCase().includes(term) || 
        pattern.description.toLowerCase().includes(term)
      );
    }
    
    // Filter by type
    if (activeTab !== 'all') {
      filtered = filtered.filter(pattern => pattern.type === activeTab);
    }
    
    setFilteredPatterns(filtered);
  }, [patterns, searchTerm, activeTab]);

  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'bullish':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'bearish':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSuccessRateBadge = (rate: number) => {
    if (rate >= 75) {
      return <Badge className="bg-green-500/20 text-green-500 border-green-500">{rate}% Success</Badge>;
    } else if (rate >= 60) {
      return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500">{rate}% Success</Badge>;
    } else {
      return <Badge className="bg-orange-500/20 text-orange-500 border-orange-500">{rate}% Success</Badge>;
    }
  };

  return (
    <Card className="terminal-container">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Technical Pattern Registry
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patterns..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="bullish">Bullish</TabsTrigger>
              <TabsTrigger value="bearish">Bearish</TabsTrigger>
              <TabsTrigger value="neutral">Neutral</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Pattern List */}
          {isLoading ? (
            <div className="text-center py-8">Loading pattern registry...</div>
          ) : filteredPatterns.length > 0 ? (
            <div className="space-y-3">
              {filteredPatterns.map((pattern, index) => (
                <div key={index} className="border border-border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {getPatternIcon(pattern.type)}
                      <h3 className="font-bold">{pattern.name}</h3>
                    </div>
                    {getSuccessRateBadge(pattern.success_rate)}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-2">{pattern.description}</p>
                  
                  {pattern.confirmation_factors.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-xs font-semibold text-muted-foreground mb-1">Confirmation Factors</h4>
                      <div className="flex flex-wrap gap-1">
                        {pattern.confirmation_factors.map((factor, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{factor}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {Object.keys(pattern.timeframe_weight).length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-xs font-semibold text-muted-foreground mb-1">Timeframe Effectiveness</h4>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(pattern.timeframe_weight).map(([timeframe, weight], idx) => (
                          <Badge 
                            key={idx} 
                            variant="outline" 
                            className={`text-xs ${weight >= 0.9 ? 'border-green-500 text-green-500' : 
                              weight >= 0.7 ? 'border-yellow-500 text-yellow-500' : 
                              'border-gray-500 text-gray-500'}`}
                          >
                            {timeframe}: {(weight * 100).toFixed(0)}%
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No patterns found matching your criteria
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PatternRegistry;