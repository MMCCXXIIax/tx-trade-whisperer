import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, TrendingUp, MessageSquare, Twitter, Radio, Newspaper } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

interface SentimentData {
  symbol: string;
  overall_sentiment: string;
  confidence: number;
  sources: {
    twitter: { sentiment: number; volume: number };
    reddit: { sentiment: number; volume: number };
    news: { sentiment: number; volume: number };
  };
  trending_score: number;
  key_phrases: string[];
}

export function TXSentimentDashboard() {
  const [symbol, setSymbol] = useState('BTC');
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSentiment();
  }, []);

  const loadSentiment = async () => {
    setLoading(true);
    try {
      const result = await apiClient.getSentiment(symbol);
      if (result.success && result.data) {
        setSentiment(result.data as any);
      }
    } catch (error) {
      console.error('Failed to load sentiment:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    if (sentiment === 'bullish') return 'text-tx-green';
    if (sentiment === 'bearish') return 'text-tx-red';
    return 'text-muted-foreground';
  };

  const getSentimentBg = (sentiment: string) => {
    if (sentiment === 'bullish') return 'bg-tx-green/20';
    if (sentiment === 'bearish') return 'bg-tx-red/20';
    return 'bg-muted/20';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="tx-heading-xl">Sentiment Analysis</h1>
        <p className="text-muted-foreground">AI-powered market sentiment tracking</p>
      </div>

      {/* Search Bar */}
      <Card className="tx-terminal-glass">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter symbol (e.g., BTC, ETH)..."
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="flex-1"
            />
            <Button onClick={loadSentiment} className="tx-btn-primary">
              Analyze
            </Button>
          </div>
        </CardContent>
      </Card>

      {sentiment && (
        <>
          {/* Overall Sentiment */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="tx-terminal-glass">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Overall Sentiment</p>
                    <p className={`text-2xl font-bold capitalize ${getSentimentColor(sentiment.overall_sentiment)}`}>
                      {sentiment.overall_sentiment}
                    </p>
                  </div>
                  {sentiment.overall_sentiment === 'bullish' ? (
                    <ThumbsUp className="w-8 h-8 text-tx-green/60" />
                  ) : (
                    <ThumbsDown className="w-8 h-8 text-tx-red/60" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="tx-terminal-glass">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Confidence</p>
                    <p className="text-2xl font-bold text-foreground">{sentiment.confidence}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-tx-blue/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="tx-terminal-glass">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Trending Score</p>
                    <p className="text-2xl font-bold text-foreground">{sentiment.trending_score}/100</p>
                  </div>
                  <Radio className="w-8 h-8 text-tx-orange/60" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Source Breakdown */}
          <Card className="tx-terminal-glass">
            <CardHeader>
              <CardTitle>Sentiment by Source</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Twitter */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Twitter className="w-4 h-4 text-tx-blue" />
                    <span className="font-medium">Twitter</span>
                  </div>
                  <Badge variant="secondary">{sentiment.sources.twitter.volume} mentions</Badge>
                </div>
                <Progress value={sentiment.sources.twitter.sentiment} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{sentiment.sources.twitter.sentiment}% positive</p>
              </div>

              {/* Reddit */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-tx-orange" />
                    <span className="font-medium">Reddit</span>
                  </div>
                  <Badge variant="secondary">{sentiment.sources.reddit.volume} posts</Badge>
                </div>
                <Progress value={sentiment.sources.reddit.sentiment} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{sentiment.sources.reddit.sentiment}% positive</p>
              </div>

              {/* News */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Newspaper className="w-4 h-4 text-tx-green" />
                    <span className="font-medium">News</span>
                  </div>
                  <Badge variant="secondary">{sentiment.sources.news.volume} articles</Badge>
                </div>
                <Progress value={sentiment.sources.news.sentiment} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{sentiment.sources.news.sentiment}% positive</p>
              </div>
            </CardContent>
          </Card>

          {/* Key Phrases */}
          <Card className="tx-terminal-glass">
            <CardHeader>
              <CardTitle>Trending Keywords</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {sentiment.key_phrases.map((phrase, idx) => (
                  <Badge key={idx} variant="outline" className="text-sm">
                    {phrase}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!sentiment && !loading && (
        <Card className="tx-terminal-glass">
          <CardContent className="p-12 text-center">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">Enter a symbol to analyze market sentiment</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}