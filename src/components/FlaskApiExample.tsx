// Example component demonstrating Flask API integration
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  useMarketData, 
  useCandlestickData, 
  usePatternDetection, 
  useSentimentData,
  useEntryExitSignals,
  useScanner,
  useSystemHealth,
  useBacktest
} from '@/hooks/useFlaskApi';
import { Activity, TrendingUp, Brain, MessageSquare, Target, Search, Heart, BarChart3 } from 'lucide-react';

const FlaskApiExample: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('BTC-USD');
  
  // Use Flask API hooks
  const { marketData, loading: marketLoading, error: marketError, refetch: refetchMarket } = useMarketData(selectedSymbol);
  const { candleData, loading: candleLoading, error: candleError } = useCandlestickData(selectedSymbol);
  const { patterns, loading: patternLoading, error: patternError } = usePatternDetection(selectedSymbol);
  const { sentiment, loading: sentimentLoading, error: sentimentError } = useSentimentData(selectedSymbol);
  const { signals, loading: signalsLoading, error: signalsError } = useEntryExitSignals(selectedSymbol);
  const { scanStatus, loading: scannerLoading, startScan, stopScan } = useScanner();
  const { health, coverage, loading: healthLoading } = useSystemHealth();
  const { results: backtestResults, loading: backtestLoading, runBacktest } = useBacktest();

  const handleStartScanner = () => {
    startScan(['BTC-USD', 'ETH-USD', 'AAPL'], 60, true);
  };

  const handleRunBacktest = () => {
    runBacktest({
      strategy_name: 'Demo Strategy',
      symbols: ['BTC-USD', 'ETH-USD'],
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      initial_capital: 100000,
      patterns: ['Bullish Engulfing', 'Hammer'],
      entry_strategy: 'immediate',
      exit_strategy: 'fixed_profit',
      stop_loss_pct: 5.0,
      take_profit_pct: 10.0
    });
  };

  return (
    <div className="space-y-6">
      <Card className="terminal-container">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Flask API Integration Demo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Input
              placeholder="Enter symbol (e.g., BTC-USD, AAPL)"
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value.toUpperCase())}
              className="max-w-xs"
            />
            <Button onClick={refetchMarket} disabled={marketLoading}>
              {marketLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>

          <Tabs defaultValue="market" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="market">Market</TabsTrigger>
              <TabsTrigger value="patterns">Patterns</TabsTrigger>
              <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>

            <TabsContent value="market" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Market Data */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Market Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {marketLoading && <p>Loading market data...</p>}
                    {marketError && <p className="text-red-400">Error: {marketError}</p>}
                    {marketData && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Symbol:</span>
                          <span className="font-mono">{marketData.symbol}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Price:</span>
                          <span className="font-mono">${marketData.price?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Change:</span>
                          <span className={`font-mono ${marketData.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {marketData.change?.toFixed(2)} ({marketData.change_percent?.toFixed(2)}%)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Volume:</span>
                          <span className="font-mono">{marketData.volume?.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Candlestick Data */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Candlestick Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {candleLoading && <p>Loading candle data...</p>}
                    {candleError && <p className="text-red-400">Error: {candleError}</p>}
                    {candleData && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Period:</span>
                          <span className="font-mono">{candleData.period}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Interval:</span>
                          <span className="font-mono">{candleData.interval}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Candles:</span>
                          <span className="font-mono">{candleData.candles?.length || 0}</span>
                        </div>
                        {candleData.candles && candleData.candles.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            Latest: {new Date(candleData.candles[candleData.candles.length - 1].timestamp).toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Entry/Exit Signals */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Entry/Exit Signals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {signalsLoading && <p>Loading signals...</p>}
                  {signalsError && <p className="text-red-400">Error: {signalsError}</p>}
                  {signals && signals.length > 0 && (
                    <div className="space-y-2">
                      {signals.slice(0, 3).map((signal, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border border-border rounded">
                          <div className="flex items-center gap-2">
                            <Badge variant={signal.action === 'BUY' ? 'default' : 'destructive'}>
                              {signal.action}
                            </Badge>
                            <span className="text-sm">{signal.pattern}</span>
                          </div>
                          <div className="text-right text-sm">
                            <div className="font-mono">{signal.confidence_pct}% confidence</div>
                            <div className="text-muted-foreground">R:R {signal.risk_reward_ratio}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="patterns" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Enhanced Pattern Detection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {patternLoading && <p>Analyzing patterns...</p>}
                  {patternError && <p className="text-red-400">Error: {patternError}</p>}
                  {patterns && patterns.length > 0 ? (
                    <div className="space-y-3">
                      {patterns.map((pattern, index) => (
                        <div key={index} className="border border-border rounded p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">{pattern.pattern_type}</span>
                            <Badge variant="outline">{pattern.confidence_pct}% confidence</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div>Price: ${pattern.price?.toFixed(2)}</div>
                            <div>Volume: {pattern.volume?.toLocaleString()}</div>
                            <div>Sentiment: {pattern.sentiment_score?.toFixed(2)}</div>
                            <div>Keywords: {pattern.keywords?.join(', ')}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No patterns detected</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sentiment" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Sentiment Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sentimentLoading && <p>Analyzing sentiment...</p>}
                  {sentimentError && <p className="text-red-400">Error: {sentimentError}</p>}
                  {sentiment && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Overall Sentiment:</span>
                        <Badge variant={sentiment.overall_sentiment === 'bullish' ? 'default' : sentiment.overall_sentiment === 'bearish' ? 'destructive' : 'secondary'}>
                          {sentiment.sentiment_label}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Confidence:</span>
                          <span>{sentiment.confidence}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Volume:</span>
                          <span>{sentiment.volume?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Trending Score:</span>
                          <span>{sentiment.trending_score}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-semibold">Sources:</span>
                        <div className="grid grid-cols-3 gap-2 mt-1">
                          <div className="text-center p-2 border border-border rounded">
                            <div className="font-mono text-sm">{sentiment.sources?.twitter || 'N/A'}</div>
                            <div className="text-xs text-muted-foreground">Twitter</div>
                          </div>
                          <div className="text-center p-2 border border-border rounded">
                            <div className="font-mono text-sm">{sentiment.sources?.reddit || 'N/A'}</div>
                            <div className="text-xs text-muted-foreground">Reddit</div>
                          </div>
                          <div className="text-center p-2 border border-border rounded">
                            <div className="font-mono text-sm">{sentiment.sources?.news || 'N/A'}</div>
                            <div className="text-xs text-muted-foreground">News</div>
                          </div>
                        </div>
                      </div>
                      {sentiment.key_phrases && (
                        <div>
                          <span className="text-sm font-semibold">Key Phrases:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {sentiment.key_phrases.slice(0, 5).map((phrase, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {phrase}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* System Health */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      System Health
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {healthLoading && <p>Checking system health...</p>}
                    {health && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Version:</span>
                          <span className="font-mono">{health.version}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Check:</span>
                          <span className="text-sm">{new Date(health.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                    {coverage && (
                      <div className="space-y-2 mt-4">
                        <div className="text-sm font-semibold">Data Coverage:</div>
                        <div className="flex flex-wrap gap-1">
                          {coverage.sources?.yahoo && <Badge variant="outline">Yahoo Finance</Badge>}
                          {coverage.sources?.crypto && <Badge variant="outline">Crypto</Badge>}
                          {coverage.sources?.stocks && <Badge variant="outline">Stocks</Badge>}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Scanner Control */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Market Scanner
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <Badge variant={scanStatus?.active ? 'default' : 'secondary'}>
                          {scanStatus?.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      {scanStatus && (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Symbols:</span>
                            <span>{scanStatus.symbols_scanned?.length || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Patterns Found:</span>
                            <span>{scanStatus.patterns_found || 0}</span>
                          </div>
                          {scanStatus.last_scan && (
                            <div className="flex justify-between">
                              <span>Last Scan:</span>
                              <span>{scanStatus.last_scan}</span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={handleStartScanner} 
                          disabled={scannerLoading || scanStatus?.active}
                        >
                          Start Scanner
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={stopScan} 
                          disabled={scannerLoading || !scanStatus?.active}
                        >
                          Stop Scanner
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Backtesting */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Strategy Backtesting
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button onClick={handleRunBacktest} disabled={backtestLoading}>
                      {backtestLoading ? 'Running Backtest...' : 'Run Demo Backtest'}
                    </Button>
                    
                    {backtestResults && (
                      <div className="space-y-2 p-3 border border-border rounded">
                        <div className="font-semibold">{backtestResults.strategy_name}</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>Total Trades: {backtestResults.portfolio?.total_trades}</div>
                          <div>Win Rate: {backtestResults.portfolio?.win_rate?.toFixed(1)}%</div>
                          <div>Total P&L: ${backtestResults.portfolio?.total_pnl?.toFixed(2)}</div>
                          <div>Profit Factor: {backtestResults.portfolio?.profit_factor?.toFixed(2)}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default FlaskApiExample;