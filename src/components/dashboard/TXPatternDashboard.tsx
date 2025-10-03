import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, TrendingUp, Search, Filter, Play, Info } from 'lucide-react';
import { txApi } from '@/lib/txApi';

interface Pattern {
  id: string;
  symbol: string;
  pattern: string;
  confidence: number;
  price: number;
  timestamp: string;
  metadata?: any;
}

export function TXPatternDashboard() {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    loadPatterns();
  }, []);

  const loadPatterns = async () => {
    try {
      // Mock data for demonstration
      const mockData: Pattern[] = Array.from({ length: 12 }, (_, i) => ({
        id: `pat_${i}`,
        symbol: ['BTC', 'ETH', 'SOL', 'ADA'][Math.floor(Math.random() * 4)],
        pattern: ['Bullish Engulfing', 'Morning Star', 'Hammer', 'Doji', 'Evening Star', 'Shooting Star'][Math.floor(Math.random() * 6)],
        confidence: Math.floor(Math.random() * 30) + 70,
        price: Math.random() * 100000 + 30000,
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString()
      }));
      setPatterns(mockData);
    } catch (error) {
      console.error('Failed to load patterns:', error);
    }
  };

  const runScan = async () => {
    setScanning(true);
    try {
      await txApi.startLiveScanning();
      setTimeout(() => {
        loadPatterns();
        setScanning(false);
      }, 2000);
    } catch (error) {
      console.error('Scan failed:', error);
      setScanning(false);
    }
  };

  const filteredPatterns = patterns.filter(p => {
    const matchesSymbol = selectedSymbol === 'all' || p.symbol === selectedSymbol;
    const matchesSearch = p.pattern.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSymbol && matchesSearch;
  });

  const getPatternType = (pattern: string) => {
    const bullish = ['Bullish Engulfing', 'Morning Star', 'Hammer'];
    return bullish.some(p => pattern.includes(p)) ? 'bullish' : 'bearish';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="tx-heading-xl">Pattern Detection</h1>
        <p className="text-muted-foreground">AI-powered technical pattern recognition</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        <Card className="flex-1 tx-terminal-glass">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search patterns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                <SelectTrigger className="w-full lg:w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Symbols</SelectItem>
                  <SelectItem value="BTC">BTC</SelectItem>
                  <SelectItem value="ETH">ETH</SelectItem>
                  <SelectItem value="SOL">SOL</SelectItem>
                  <SelectItem value="ADA">ADA</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        <Button 
          onClick={runScan} 
          disabled={scanning}
          className="tx-btn-primary lg:w-auto"
        >
          <Play className="w-4 h-4 mr-2" />
          {scanning ? 'Scanning...' : 'Run Scan'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="tx-terminal-glass">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active Patterns</p>
            <p className="text-2xl font-bold">{filteredPatterns.length}</p>
          </CardContent>
        </Card>
        <Card className="tx-terminal-glass">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Bullish</p>
            <p className="text-2xl font-bold text-tx-green">
              {filteredPatterns.filter(p => getPatternType(p.pattern) === 'bullish').length}
            </p>
          </CardContent>
        </Card>
        <Card className="tx-terminal-glass">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Bearish</p>
            <p className="text-2xl font-bold text-tx-red">
              {filteredPatterns.filter(p => getPatternType(p.pattern) === 'bearish').length}
            </p>
          </CardContent>
        </Card>
        <Card className="tx-terminal-glass">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">High Confidence</p>
            <p className="text-2xl font-bold text-tx-blue">
              {filteredPatterns.filter(p => p.confidence >= 85).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pattern Grid */}
      <div className="grid lg:grid-cols-2 gap-4">
        {filteredPatterns.map((pattern) => {
          const type = getPatternType(pattern.pattern);
          return (
            <Card key={pattern.id} className="tx-terminal-glass hover:bg-card/50 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className={`w-5 h-5 ${type === 'bullish' ? 'text-tx-green' : 'text-tx-red'}`} />
                    <CardTitle className="text-lg">{pattern.pattern}</CardTitle>
                  </div>
                  <Badge className={type === 'bullish' ? 'bg-tx-green/20 text-tx-green' : 'bg-tx-red/20 text-tx-red'}>
                    {type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">{pattern.symbol}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(pattern.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <span className="font-mono">${pattern.price.toLocaleString()}</span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Confidence</span>
                    <Badge className={
                      pattern.confidence >= 85 ? 'bg-tx-green/20 text-tx-green' :
                      pattern.confidence >= 70 ? 'bg-tx-blue/20 text-tx-blue' :
                      'bg-muted'
                    }>
                      {pattern.confidence}%
                    </Badge>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${type === 'bullish' ? 'bg-tx-green' : 'bg-tx-red'}`}
                      style={{ width: `${pattern.confidence}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Info className="w-4 h-4 mr-1" />
                    Details
                  </Button>
                  <Button size="sm" className="tx-btn-primary flex-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Trade
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredPatterns.length === 0 && (
        <Card className="tx-terminal-glass">
          <CardContent className="p-12 text-center">
            <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">No patterns detected. Run a scan to find patterns.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}