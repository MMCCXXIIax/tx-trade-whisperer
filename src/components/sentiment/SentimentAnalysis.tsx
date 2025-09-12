import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { MessageCircle, TrendingUp, TrendingDown, Activity, AlertCircle, Twitter, Globe, Hash } from 'lucide-react';
import { txApi, SentimentData } from '@/lib/txApi';

interface SocialPost {
  id: string;
  platform: 'twitter' | 'reddit' | 'news';
  content: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  score: number;
  timestamp: string;
  author: string;
  engagement: number;
}

interface TrendingTopic {
  keyword: string;
  volume: number;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  change24h: number;
}

interface SentimentHistory {
  timestamp: string;
  bullish: number;
  bearish: number;
  neutral: number;
  volume: number;
}

export default function SentimentAnalysis() {
  const [selectedAsset, setSelectedAsset] = useState('BTC');
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [sentimentHistory, setSentimentHistory] = useState<SentimentHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const assets = ['BTC', 'ETH', 'SOL', 'AAPL', 'TSLA', 'MSFT'];

  useEffect(() => {
    const fetchSentimentData = async () => {
      setIsLoading(true);
      try {
        const response = await txApi.getSentiment(selectedAsset);
        
        if (response.success) {
          setSentimentData(response.data);
        } else {
          // Mock sentiment data
          const mockSentiment: SentimentData = {
            symbol: selectedAsset,
            sentiment: Math.random() > 0.6 ? 'bullish' : Math.random() > 0.3 ? 'neutral' : 'bearish',
            score: Math.floor(Math.random() * 40) + 30, // 30-70
            sources: {
              twitter: Math.floor(Math.random() * 50) + 25,
              reddit: Math.floor(Math.random() * 30) + 15,
              news: Math.floor(Math.random() * 20) + 10
            },
            volume: Math.floor(Math.random() * 5000) + 1000,
            trending: Math.random() > 0.7
          };
          setSentimentData(mockSentiment);
        }

        // Mock social posts
        const platforms: Array<'twitter' | 'reddit' | 'news'> = ['twitter', 'reddit', 'news'];
        const sentiments: Array<'bullish' | 'bearish' | 'neutral'> = ['bullish', 'bearish', 'neutral'];
        
        const mockPosts: SocialPost[] = Array.from({ length: 20 }, (_, i) => ({
          id: i.toString(),
          platform: platforms[Math.floor(Math.random() * platforms.length)],
          content: generateMockContent(selectedAsset, sentiments[Math.floor(Math.random() * sentiments.length)]),
          sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
          score: Math.floor(Math.random() * 100),
          timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          author: `user_${Math.floor(Math.random() * 1000)}`,
          engagement: Math.floor(Math.random() * 500)
        }));
        setSocialPosts(mockPosts);

        // Mock trending topics
        const topics = ['breakout', 'resistance', 'support', 'HODL', 'moon', 'dip', 'whale', 'adoption'];
        const mockTrending: TrendingTopic[] = topics.slice(0, 6).map(topic => ({
          keyword: `#${topic}`,
          volume: Math.floor(Math.random() * 1000) + 100,
          sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
          change24h: (Math.random() - 0.5) * 200
        }));
        setTrendingTopics(mockTrending);

        // Mock sentiment history
        const history: SentimentHistory[] = Array.from({ length: 24 }, (_, i) => {
          const bullish = Math.random() * 60 + 20;
          const bearish = Math.random() * 60 + 20;
          const neutral = 100 - bullish - bearish;
          
          return {
            timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
            bullish,
            bearish,
            neutral: Math.max(0, neutral),
            volume: Math.floor(Math.random() * 1000) + 200
          };
        });
        setSentimentHistory(history);

      } catch (error) {
        console.error('Failed to fetch sentiment data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSentimentData();
  }, [selectedAsset]);

  const generateMockContent = (symbol: string, sentiment: string): string => {
    const bullishPhrases = [
      `${symbol} looking strong! 🚀`,
      `Bullish pattern forming on ${symbol}`,
      `${symbol} breaking resistance levels`,
      `Time to accumulate more ${symbol}`,
      `${symbol} moon mission incoming 🌙`
    ];
    
    const bearishPhrases = [
      `${symbol} showing weakness`,
      `Concerned about ${symbol} momentum`,
      `${symbol} needs to hold support`,
      `Selling pressure on ${symbol}`,
      `${symbol} looking bearish short term`
    ];
    
    const neutralPhrases = [
      `${symbol} consolidating nicely`,
      `Watching ${symbol} for next move`,
      `${symbol} in wait and see mode`,
      `Mixed signals on ${symbol}`,
      `${symbol} range bound for now`
    ];

    switch (sentiment) {
      case 'bullish':
        return bullishPhrases[Math.floor(Math.random() * bullishPhrases.length)];
      case 'bearish':
        return bearishPhrases[Math.floor(Math.random() * bearishPhrases.length)];
      default:
        return neutralPhrases[Math.floor(Math.random() * neutralPhrases.length)];
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return 'text-green-600 bg-green-100';
      case 'bearish':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return '😊';
      case 'bearish':
        return '😰';
      default:
        return '😐';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return <Twitter className="h-4 w-4" />;
      case 'reddit':
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 3600));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours === 1) return '1 hour ago';
    return `${diffInHours} hours ago`;
  };

  const pieData = sentimentData ? [
    { name: 'Bullish', value: sentimentData.sources.twitter + sentimentData.sources.reddit, fill: '#10b981' },
    { name: 'Bearish', value: sentimentData.sources.news, fill: '#ef4444' },
    { name: 'Neutral', value: Math.max(0, sentimentData.volume - sentimentData.sources.twitter - sentimentData.sources.reddit - sentimentData.sources.news), fill: '#6b7280' }
  ] : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4 animate-pulse" />
          <p className="text-gray-600">Analyzing market sentiment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sentiment Analysis</h2>
          <p className="text-gray-600">Real-time sentiment from social media, news, and community discussions</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white"
          >
            {assets.map(asset => (
              <option key={asset} value={asset}>{asset}</option>
            ))}
          </select>
          {sentimentData?.trending && (
            <Badge className="bg-orange-100 text-orange-800">
              <AlertCircle className="h-3 w-3 mr-1" />
              Trending
            </Badge>
          )}
        </div>
      </div>

      {/* Sentiment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{getSentimentEmoji(sentimentData?.sentiment || 'neutral')}</span>
              <div>
                <div className="text-sm text-gray-600">Overall Sentiment</div>
                <div className={`font-bold capitalize ${getSentimentColor(sentimentData?.sentiment || 'neutral').split(' ')[0]}`}>
                  {sentimentData?.sentiment || 'Neutral'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-sm text-gray-600">Sentiment Score</div>
                <div className="text-2xl font-bold">{sentimentData?.score || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm text-gray-600">Social Volume</div>
                <div className="text-2xl font-bold">{sentimentData?.volume.toLocaleString() || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-sm text-gray-600">Trending Score</div>
                <div className="text-2xl font-bold">
                  {sentimentData?.trending ? 'HIGH' : 'NORMAL'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="social">Social Feed</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sentiment Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Source Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Source Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Twitter className="h-4 w-4 text-blue-500" />
                      <span>Twitter</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{sentimentData?.sources.twitter || 0}</div>
                      <div className="text-xs text-gray-500">mentions</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="h-4 w-4 text-orange-500" />
                      <span>Reddit</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{sentimentData?.sources.reddit || 0}</div>
                      <div className="text-xs text-gray-500">posts</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-green-500" />
                      <span>News</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{sentimentData?.sources.news || 0}</div>
                      <div className="text-xs text-gray-500">articles</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            <div className="space-y-4">
              {socialPosts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getPlatformIcon(post.platform)}
                        <span className="font-medium">{post.author}</span>
                        <Badge variant="outline" className={`text-xs ${getSentimentColor(post.sentiment)}`}>
                          {post.sentiment}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500">{formatTimeAgo(post.timestamp)}</span>
                    </div>
                    <p className="text-gray-700 mb-2">{post.content}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Score: {post.score}</span>
                      <span>{post.engagement} interactions</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Hash className="h-5 w-5" />
                <span>Trending Topics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingTopics.map((topic, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-blue-600">{topic.keyword}</span>
                      <Badge variant="outline" className={getSentimentColor(topic.sentiment)}>
                        {getSentimentEmoji(topic.sentiment)}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>Volume: {topic.volume.toLocaleString()}</div>
                      <div className={topic.change24h > 0 ? 'text-green-600' : 'text-red-600'}>
                        24h: {topic.change24h > 0 ? '+' : ''}{topic.change24h.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Sentiment History (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sentimentHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).getHours() + ':00'}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                      formatter={(value, name) => [`${Number(value).toFixed(1)}%`, name]}
                    />
                    <Bar dataKey="bullish" stackId="a" fill="#10b981" name="Bullish" />
                    <Bar dataKey="neutral" stackId="a" fill="#6b7280" name="Neutral" />
                    <Bar dataKey="bearish" stackId="a" fill="#ef4444" name="Bearish" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}