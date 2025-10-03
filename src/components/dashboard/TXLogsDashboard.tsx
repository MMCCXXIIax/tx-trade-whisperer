import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, Clock, Search, Filter } from 'lucide-react';
import { txApi } from '@/lib/txApi';

interface Detection {
  id: string;
  symbol: string;
  pattern: string;
  confidence: number;
  price: number;
  timestamp: string;
  outcome?: string;
  verified: boolean;
}

export function TXLogsDashboard() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDetections();
  }, []);

  const loadDetections = async () => {
    try {
      // Mock data for demonstration
      const mockData: Detection[] = Array.from({ length: 20 }, (_, i) => ({
        id: `det_${i}`,
        symbol: ['BTC', 'ETH', 'SOL', 'ADA'][Math.floor(Math.random() * 4)],
        pattern: ['Bullish Engulfing', 'Morning Star', 'Hammer', 'Doji', 'Evening Star'][Math.floor(Math.random() * 5)],
        confidence: Math.floor(Math.random() * 30) + 70,
        price: Math.random() * 100000 + 30000,
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
        outcome: Math.random() > 0.3 ? (Math.random() > 0.5 ? 'success' : 'failed') : undefined,
        verified: Math.random() > 0.3
      }));
      setDetections(mockData);
    } catch (error) {
      console.error('Failed to load detections:', error);
    }
  };

  const filteredDetections = detections.filter(d => {
    const matchesSearch = d.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         d.pattern.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'verified' && d.verified) ||
                         (filter === 'pending' && !d.outcome) ||
                         (filter === 'success' && d.outcome === 'success') ||
                         (filter === 'failed' && d.outcome === 'failed');
    return matchesSearch && matchesFilter;
  });

  const getOutcomeIcon = (detection: Detection) => {
    if (!detection.outcome) return <Clock className="w-4 h-4 text-muted-foreground" />;
    if (detection.outcome === 'success') return <CheckCircle className="w-4 h-4 text-tx-green" />;
    return <XCircle className="w-4 h-4 text-tx-red" />;
  };

  const getOutcomeBadge = (detection: Detection) => {
    if (!detection.outcome) return <Badge variant="secondary">Pending</Badge>;
    if (detection.outcome === 'success') return <Badge className="bg-tx-green/20 text-tx-green">Success</Badge>;
    return <Badge className="bg-tx-red/20 text-tx-red">Failed</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="tx-heading-xl">Detection Logs</h1>
        <p className="text-muted-foreground">Historical pattern detection records</p>
      </div>

      {/* Filters */}
      <Card className="tx-terminal-glass">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by symbol or pattern..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Detections</SelectItem>
                <SelectItem value="verified">Verified Only</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="tx-terminal-glass">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{detections.length}</p>
          </CardContent>
        </Card>
        <Card className="tx-terminal-glass">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Success</p>
            <p className="text-2xl font-bold text-tx-green">
              {detections.filter(d => d.outcome === 'success').length}
            </p>
          </CardContent>
        </Card>
        <Card className="tx-terminal-glass">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Failed</p>
            <p className="text-2xl font-bold text-tx-red">
              {detections.filter(d => d.outcome === 'failed').length}
            </p>
          </CardContent>
        </Card>
        <Card className="tx-terminal-glass">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-muted-foreground">
              {detections.filter(d => !d.outcome).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detection List */}
      <Card className="tx-terminal-glass">
        <CardHeader>
          <CardTitle>Detection History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredDetections.length > 0 ? (
              filteredDetections.map((detection) => (
                <div key={detection.id} className="flex items-center justify-between p-4 bg-card/30 rounded-lg hover:bg-card/50 transition-colors">
                  <div className="flex items-center gap-4">
                    {getOutcomeIcon(detection)}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono">{detection.symbol}</Badge>
                      <span className="text-sm font-medium">{detection.pattern}</span>
                    </div>
                    <Badge className={detection.confidence >= 85 ? 'bg-tx-green/20 text-tx-green' : detection.confidence >= 70 ? 'bg-tx-blue/20 text-tx-blue' : 'bg-muted'}>
                      {detection.confidence}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm">${detection.price.toLocaleString()}</span>
                    {getOutcomeBadge(detection)}
                    {detection.verified && (
                      <Badge variant="secondary" className="text-xs">✓ Verified</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(detection.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No detections found matching your filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}