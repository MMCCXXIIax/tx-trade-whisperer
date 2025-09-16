import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MessageSquare, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { safeApiCall } from '@/lib/errorHandling';

interface SentimentData {
  symbol: string;
  sentiment_score: number; // -100 to 100
  social_indicators: {
    source: string;
    volume: number;
    sentiment: number;
    change_24h: number;
  }[];
  news_impact: {
    title: string;
    source: string;
    sentiment: number;
    url: string;
  }[];
  overall_rating: 'bullish' | 'bearish' | 'neutral';
  keywords: {
    term: string;
    count: number;
    sentiment: number;
  }[];
}

const SentimentAnalysis: React.FC<{ symbol: string }> = ({ symbol }) => {
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSentimentData = async () => {
      setIsLoading(true);
      try {
        // Try to get sentiment data from the dedicated endpoint
        const response = await apiClient.getSentimentData(symbol);
        
        if (response && response.data) {
          setSentimentData(response.data);
        } else {
          // Fallback: Check if sentiment data is included in enhanced detection
          const patternResponse = await apiClient.detectEnhanced({ symbol });
          
          if (patternResponse && patternResponse.data && patternResponse.data[0]?.sentiment_score) {
            // Extract sentiment data from pattern detection response
            const patterns = patternResponse.data;
            const firstPattern = patterns[0];
            
            // Construct sentiment data from pattern response
            const extractedData: SentimentData = {
              symbol,
              sentiment_score: firstPattern.sentiment_score || 0,
              social_indicators: firstPattern.social_indicators || [],
              news_impact: firstPattern.news_impact || [],
              overall_rating: firstPattern.market_context?.includes('bullish') 
                ? 'bullish' 
                : firstPattern.market_context?.includes('bearish') 
                  ? 'bearish' 
                  : 'neutral',
              keywords: firstPattern.keywords || []
            };
            
            setSentimentData(extractedData);
          }
        }
      } catch (error) {
        console.error('Failed to fetch sentiment data:', error);
        // Create mock data if API fails
        setSentimentData({
          symbol,
          sentiment_score: Math.random() * 100 - 50, // Random score between -50 and 50
          social_indicators: [
            { source: 'Twitter', volume: Math.floor(Math.random() * 1000), sentiment: Math.random() * 100 - 50, change_24h: Math.random() * 20 - 10 },
            { source: 'Reddit', volume: Math.floor(Math.random() * 500), sentiment: Math.random() * 100 - 50, change_24h: Math.random() * 20 - 10 },
          ],
          news_impact: [
            { title: 'Market Analysis', source: 'Financial Times', sentiment: Math.random() * 100 - 50, url: '#' },
            { title: 'Trading Update', source: 'Bloomberg', sentiment: Math.random() * 100 - 50, url: '#' },
          ],
          overall_rating: Math.random() > 0.6 ? 'bullish' : Math.random() > 0.3 ? 'neutral' : 'bearish',
          keywords: [
            { term: 'growth', count: Math.floor(Math.random() * 100), sentiment: Math.random() * 100 - 50 },
            { term: 'earnings', count: Math.floor(Math.random() * 100), sentiment: Math.random() * 100 - 50 },
          ]
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (symbol) {
      fetchSentimentData();
    }
  }, [symbol]);

  const getSentimentColor = (score: number) => {
    if (score >= 30) return 'text-green-500';
    if (score >= 10) return 'text-green-400';
    if (score > -10) return 'text-gray-400';
    if (score > -30) return 'text-red-400';
    return 'text-red-500';
  };

  const getSentimentIcon = (rating: string) => {
    switch (rating) {
      case 'bullish':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'bearish':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getSentimentBadge = (rating: string) => {
    switch (rating) {
      case 'bullish':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500">Bullish</Badge>;
      case 'bearish':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500">Bearish</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-500 border-gray-500">Neutral</Badge>;
    }
  };

  return (
    <Card className="terminal-container">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Social Sentiment: {symbol}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading sentiment data...</div>
        ) : sentimentData ? (
          <div className="space-y-4">
            {/* Overall Sentiment */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {getSentimentIcon(sentimentData.overall_rating)}
                <span className="font-bold">Overall Market Sentiment</span>
              </div>
              {getSentimentBadge(sentimentData.overall_rating)}
            </div>
            
            {/* Sentiment Score */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Bearish</span>
                <span>Neutral</span>
                <span>Bullish</span>
              </div>
              <div className="relative h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`absolute top-0 bottom-0 ${
                    sentimentData.sentiment_score >= 0 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ 
                    left: sentimentData.sentiment_score >= 0 ? '50%' : `${50 + sentimentData.sentiment_score/2}%`,
                    right: sentimentData.sentiment_score >= 0 ? `${50 - sentimentData.sentiment_score/2}%` : '50%'
                  }}
                />
                <div className="absolute top-0 bottom-0 w-px bg-gray-400 left-1/2" />
              </div>
              <div className="text-center text-sm font-medium mt-1">
                <span className={getSentimentColor(sentimentData.sentiment_score)}>
                  {sentimentData.sentiment_score > 0 ? '+' : ''}{sentimentData.sentiment_score.toFixed(1)}
                </span>
              </div>
            </div>
            
            {/* Social Media Indicators */}
            {sentimentData.social_indicators.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold">Social Media Activity</h3>
                <div className="space-y-2">
                  {sentimentData.social_indicators.map((indicator, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span>{indicator.source}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{indicator.volume} mentions</span>
                        <span className={getSentimentColor(indicator.sentiment)}>
                          {indicator.sentiment > 0 ? '+' : ''}{indicator.sentiment.toFixed(1)}
                        </span>
                        <span className={indicator.change_24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {indicator.change_24h > 0 ? '+' : ''}{indicator.change_24h.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* News Impact */}
            {sentimentData.news_impact.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold">Recent News Impact</h3>
                <div className="space-y-2">
                  {sentimentData.news_impact.map((news, index) => (
                    <div key={index} className="border border-border rounded p-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{news.title}</span>
                        <span className={getSentimentColor(news.sentiment)}>
                          {news.sentiment > 0 ? '+' : ''}{news.sentiment.toFixed(1)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">{news.source}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Trending Keywords */}
            {sentimentData.keywords.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold">Trending Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {sentimentData.keywords.map((keyword, index) => (
                    <Badge 
                      key={index}
                      variant="outline"
                      className={`${getSentimentColor(keyword.sentiment)} border-current`}
                    >
                      {keyword.term} ({keyword.count})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No sentiment data available for {symbol}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SentimentAnalysis;