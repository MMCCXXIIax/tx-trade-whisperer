import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, TrendingDown, Volume2, VolumeOff, Bell, Target, BarChart3, Wifi, WifiOff } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { useWebSocket } from '@/hooks/useWebSocket';
import { safeFetch } from '@/lib/api';

interface Alert {
  id: string;
  symbol: string;
  pattern: string;
  confidence: number;
  price: number;
  timestamp: string;
  explanation?: string;
  entryPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  riskReward?: string;
}

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

interface SentimentData {
  symbol: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  score: number;
  volume: number;
}

export default function TXDashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [sentiment, setSentiment] = useState<SentimentData[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState('bitcoin');
  const [isLoading, setIsLoading] = useState(true);
  
  // WebSocket connection for real-time alerts
  const { socket, isConnected, alerts: wsAlerts, lastAlert } = useWebSocket();

  // Fetch real data from production API
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch recent alerts
        const alertsResponse = await safeFetch<{data: Alert[]}>('/alerts/recent?limit=10');
        if (alertsResponse?.data) {
          setAlerts(alertsResponse.data);
        }

        // Fetch market data for top assets
        const assets = ['BTC', 'ETH', 'SOL', 'AAPL', 'TSLA'];
        const marketDataPromises = assets.map(async (symbol) => {
          const data = await safeFetch<{data: MarketData}>(`/data/${symbol}`);
          return data?.data;
        });
        
        const marketDataResults = await Promise.all(marketDataPromises);
        const validMarketData = marketDataResults.filter(Boolean) as MarketData[];
        setMarketData(validMarketData);

        // Fetch sentiment data
        const sentimentPromises = assets.slice(0, 3).map(async (symbol) => {
          const data = await safeFetch<{data: SentimentData}>(`/sentiment/${symbol}`);
          return data?.data;
        });
        
        const sentimentResults = await Promise.all(sentimentPromises);
        const validSentiment = sentimentResults.filter(Boolean) as SentimentData[];
        setSentiment(validSentiment);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Fallback to empty arrays instead of mock data
        setAlerts([]);
        setMarketData([]);
        setSentiment([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
    
    // Set up real-time updates every 2 minutes (as per documentation)
    const interval = setInterval(fetchDashboardData, 120000);
    return () => clearInterval(interval);
  }, []);

  const playAlertSound = () => {
    if (soundEnabled) {
      // Create audio notification
      const audio = new Audio('/alert.mp3');
      audio.volume = 0.7;
      audio.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  // Play sound when new WebSocket alert arrives
  useEffect(() => {
    if (lastAlert && soundEnabled) {
      playAlertSound();
      // Add new alert to existing alerts
      setAlerts(prev => [lastAlert, ...prev.slice(0, 9)]); // Keep only 10 latest
    }
  }, [lastAlert, soundEnabled]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'bg-green-500';
    if (confidence >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return '😊';
      case 'bearish': return '😰';
      default: return '😐';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading TX Trading Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-gray-900">TX Trading Platform</h1>
          <Badge variant="outline" className={isConnected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
            {isConnected ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
            {isConnected ? 'Live' : 'Offline'}
          </Badge>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant={soundEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeOff className="h-4 w-4" />}
            Sound {soundEnabled ? 'On' : 'Off'}
          </Button>
          <select 
            value={selectedAsset} 
            onChange={(e) => setSelectedAsset(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white"
          >
            <option value="bitcoin">Bitcoin</option>
            <option value="ethereum">Ethereum</option>
            <option value="solana">Solana</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Alerts - Top Priority */}
        <div className="lg:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Live Trading Alerts</span>
                <Badge variant="destructive">PRIORITY</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <Alert key={alert.id} className="border-l-4 border-l-blue-500">
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-lg">{alert.symbol}</span>
                            <Badge variant="secondary">{alert.pattern}</Badge>
                            <div className={`px-2 py-1 rounded text-white text-sm ${getConfidenceColor(alert.confidence)}`}>
                              {alert.confidence}%
                            </div>
                          </div>
                          <span className="text-lg font-semibold">{formatPrice(alert.price)}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            EXPLAIN
                          </Button>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            TRADE NOW
                          </Button>
                          <Button size="sm" variant="outline">
                            + WATCHLIST
                          </Button>
                        </div>
                      </div>
                      {alert.explanation && (
                        <p className="mt-2 text-sm text-gray-600">{alert.explanation}</p>
                      )}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sentiment Analysis */}
        <div className="lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Sentiment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sentiment.map((item) => (
                  <div key={item.symbol} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{item.symbol}</span>
                      <span className="text-lg">{getSentimentEmoji(item.sentiment)}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium capitalize">{item.sentiment}</div>
                      <div className="text-xs text-gray-500">Vol: {formatLargeNumber(item.volume)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Overview */}
        <div className="lg:col-span-6">
          <Card>
            <CardHeader>
              <CardTitle>Market Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {marketData.map((asset) => (
                  <div key={asset.symbol} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {asset.symbol.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold">{asset.symbol}</div>
                        <div className="text-sm text-gray-500">Vol: {formatLargeNumber(asset.volume)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatPrice(asset.price)}</div>
                      <div className={`flex items-center text-sm ${asset.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {asset.change >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                        {asset.changePercent > 0 ? '+' : ''}{asset.changePercent}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pattern Scanner */}
        <div className="lg:col-span-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Pattern Scanner</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">Scanning 50+ assets for patterns...</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-semibold">Last Scan</div>
                    <div className="text-gray-500">2 min ago</div>
                  </div>
                  <div>
                    <div className="font-semibold">Patterns Found</div>
                    <div className="text-green-600">12 active</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}