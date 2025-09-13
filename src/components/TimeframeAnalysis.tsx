import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { PatternDetection } from '@/lib/apiClient';
import { safeApiCall } from '@/lib/errorHandling';

interface TimeframeOption {
  value: string;
  label: string;
  description: string;
  weight: number;
}

interface TimeframeConsensus {
  symbol: string;
  timeframes: Record<string, PatternDetection[]>;
  consensus_patterns: {
    pattern: string;
    confidence: number;
    timeframes: string[];
    overall_strength: number;
  }[];
}

const timeframeOptions: TimeframeOption[] = [
  { value: '1m', label: '1 Minute', description: 'Very short-term noise, high false signals', weight: 0.3 },
  { value: '5m', label: '5 Minutes', description: 'Short-term trading signals', weight: 0.5 },
  { value: '15m', label: '15 Minutes', description: 'Intraday trading patterns', weight: 0.7 },
  { value: '1h', label: '1 Hour', description: 'Medium-term trend confirmation', weight: 0.8 },
  { value: '4h', label: '4 Hours', description: 'Strong trend signals', weight: 0.9 },
  { value: '1d', label: '1 Day', description: 'Long-term market direction', weight: 1.0 },
];

const TimeframeAnalysis: React.FC<{ symbol: string }> = ({ symbol }) => {
  const [selectedTimeframes, setSelectedTimeframes] = useState<string[]>(['1h', '4h', '1d']);
  const [activeTab, setActiveTab] = useState('consensus');
  const [isLoading, setIsLoading] = useState(false);
  const [patternsByTimeframe, setPatternsByTimeframe] = useState<Record<string, PatternDetection[]>>({});
  const [consensusPatterns, setConsensusPatterns] = useState<TimeframeConsensus['consensus_patterns']>([]);

  // Fetch patterns for a specific timeframe
  const fetchTimeframePatterns = async (timeframe: string) => {
    const response = await apiClient.detectPatterns(symbol, timeframe);
    if (response && response.data) {
      return response.data;
    }
    return [];
  };

  // Fetch multi-timeframe consensus
  const fetchConsensusAnalysis = async () => {
    try {
      setIsLoading(true);
      
      if (selectedTimeframes.length === 0) {
        return;
      }
      
      // Option 1: Use dedicated multi-timeframe endpoint if available
      try {
        const response = await apiClient.getMultiTimeframeAnalysis(symbol, selectedTimeframes);
        
        if (response && response.data) {
          setPatternsByTimeframe(response.data.timeframes);
          setConsensusPatterns(response.data.consensus_patterns);
          return;
        }
      } catch (error) {
        console.log('Multi-timeframe endpoint not available, falling back to individual timeframe analysis');
      }
      
      // Option 2: Fallback to fetching individual timeframes and calculating consensus
      const timeframeResults: Record<string, PatternDetection[]> = {};
      
      // Fetch patterns for each selected timeframe
      await Promise.all(
        selectedTimeframes.map(async (timeframe) => {
          const patterns = await fetchTimeframePatterns(timeframe);
          timeframeResults[timeframe] = patterns;
        })
      );
      
      setPatternsByTimeframe(timeframeResults);
      
      // Calculate consensus patterns (patterns that appear in multiple timeframes)
      const patternMap: Record<string, {
        pattern: string;
        confidence: number;
        timeframes: string[];
        overall_strength: number;
      }> = {};
      
      // Process each timeframe's patterns
      Object.entries(timeframeResults).forEach(([timeframe, patterns]) => {
        const timeframeWeight = timeframeOptions.find(t => t.value === timeframe)?.weight || 0.5;
        
        patterns.forEach(pattern => {
          if (!patternMap[pattern.pattern]) {
            patternMap[pattern.pattern] = {
              pattern: pattern.pattern,
              confidence: 0,
              timeframes: [],
              overall_strength: 0
            };
          }
          
          patternMap[pattern.pattern].timeframes.push(timeframe);
          patternMap[pattern.pattern].confidence += pattern.confidence * timeframeWeight;
          patternMap[pattern.pattern].overall_strength += timeframeWeight;
        });
      });
      
      // Normalize confidence scores and sort by strength
      const consensusResults = Object.values(patternMap)
        .map(item => ({
          ...item,
          confidence: item.timeframes.length > 0 
            ? item.confidence / item.timeframes.length 
            : 0
        }))
        .filter(item => item.timeframes.length > 1) // Only include patterns found in multiple timeframes
        .sort((a, b) => b.overall_strength - a.overall_strength);
      
      setConsensusPatterns(consensusResults);
    } catch (error) {
      console.error('Failed to fetch timeframe analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when selected timeframes change
  useEffect(() => {
    fetchConsensusAnalysis();
  }, [symbol, selectedTimeframes]);

  // Handle timeframe selection
  const toggleTimeframe = (timeframe: string) => {
    setSelectedTimeframes(prev => {
      if (prev.includes(timeframe)) {
        return prev.filter(t => t !== timeframe);
      } else {
        return [...prev, timeframe];
      }
    });
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) {
      return <Badge className="bg-green-500/20 text-green-500 border-green-500">Strong ({confidence.toFixed(0)}%)</Badge>;
    } else if (confidence >= 60) {
      return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500">Medium ({confidence.toFixed(0)}%)</Badge>;
    } else {
      return <Badge className="bg-orange-500/20 text-orange-500 border-orange-500">Weak ({confidence.toFixed(0)}%)</Badge>;
    }
  };

  return (
    <Card className="terminal-container">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Multi-Timeframe Analysis: {symbol}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Timeframe Selection */}
          <div className="flex flex-wrap gap-2">
            {timeframeOptions.map(option => (
              <Button
                key={option.value}
                variant={selectedTimeframes.includes(option.value) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleTimeframe(option.value)}
                title={option.description}
              >
                {option.label}
              </Button>
            ))}
          </div>

          {/* Analysis Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="consensus">Consensus Patterns</TabsTrigger>
              <TabsTrigger value="individual">Individual Timeframes</TabsTrigger>
            </TabsList>

            {/* Consensus View */}
            <TabsContent value="consensus" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-4">Loading consensus analysis...</div>
              ) : consensusPatterns.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {consensusPatterns.map((pattern, index) => (
                    <div key={index} className="border border-border rounded p-3">
                      <div className="font-bold text-sm flex justify-between items-center">
                        <span>{pattern.pattern}</span>
                        {getConfidenceBadge(pattern.confidence)}
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Confirmed in {pattern.timeframes.length} timeframes: {pattern.timeframes.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <AlertTriangle className="w-5 h-5 mx-auto mb-2" />
                  No consensus patterns found across selected timeframes.
                </div>
              )}
            </TabsContent>

            {/* Individual Timeframes View */}
            <TabsContent value="individual">
              {isLoading ? (
                <div className="text-center py-4">Loading timeframe data...</div>
              ) : (
                <div className="space-y-4">
                  {selectedTimeframes.map(timeframe => (
                    <div key={timeframe} className="border border-border rounded p-3">
                      <h3 className="font-bold mb-2">
                        {timeframeOptions.find(t => t.value === timeframe)?.label || timeframe}
                      </h3>
                      
                      {patternsByTimeframe[timeframe]?.length > 0 ? (
                        <div className="space-y-2">
                          {patternsByTimeframe[timeframe].map((pattern, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span>{pattern.pattern}</span>
                              {getConfidenceBadge(pattern.confidence)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">No patterns detected</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeframeAnalysis;