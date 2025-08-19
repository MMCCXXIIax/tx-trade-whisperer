import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search, FileText, TrendingUp, Calendar, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Detection {
  id: number;
  symbol: string;
  pattern: string;
  confidence: string;
  timestamp: string;
  outcome?: 'win' | 'loss' | null;
  price?: string;
  timeframe?: string;
  details?: string;
}

interface DetectionStats {
  total_detections: number;
  success_rate: number;
  pattern_breakdown: Array<{ pattern: string; count: number; success_rate: number }>;
  recent_activity: number;
}

const API_BASE = "/api";

const DetectionLogs: React.FC = () => {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [detectionStats, setDetectionStats] = useState<DetectionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPattern, setFilterPattern] = useState('all');
  const [filterOutcome, setFilterOutcome] = useState('all');
  const [dateRange, setDateRange] = useState('7'); // days

  useEffect(() => {
    fetchDetections();
    fetchDetectionStats();
  }, [dateRange]);

  const fetchDetections = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/get_detection_logs?days=${dateRange}`);
      if (response.ok) {
        const data = await response.json();
        setDetections(data.detections || []);
      }
    } catch (error) {
      console.error('Failed to fetch detections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDetectionStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/get_detection_stats?days=${dateRange}`);
      if (response.ok) {
        const data = await response.json();
        setDetectionStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch detection stats:', error);
    }
  };

  const exportLogs = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/export_detection_logs?days=${dateRange}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tx_detection_logs_${dateRange}days.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export logs:', error);
    }
  };

  const getOutcomeBadge = (outcome: string | null) => {
    if (!outcome) return <Badge variant="outline">Pending</Badge>;
    return outcome === 'win' ? 
      <Badge className="bg-green-500/20 text-green-400 border-green-500">Win</Badge> :
      <Badge className="bg-red-500/20 text-red-400 border-red-500">Loss</Badge>;
  };

  const getConfidenceColor = (confidence: string) => {
    const level = parseFloat(confidence.replace('%', ''));
    if (level >= 80) return 'text-green-400';
    if (level >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const filteredDetections = detections.filter(detection => {
    const searchMatch = searchTerm === '' || 
      detection.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detection.pattern.toLowerCase().includes(searchTerm.toLowerCase());
    
    const patternMatch = filterPattern === 'all' || detection.pattern === filterPattern;
    const outcomeMatch = filterOutcome === 'all' || detection.outcome === filterOutcome;
    
    return searchMatch && patternMatch && outcomeMatch;
  });

  const uniquePatterns = [...new Set(detections.map(d => d.pattern))];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="text-primary text-xl font-bold">Loading Detection Logs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Detection Statistics */}
      {detectionStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="terminal-container">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{detectionStats.total_detections}</div>
                <div className="text-sm text-muted-foreground">Total Detections</div>
              </div>
            </CardContent>
          </Card>
          <Card className="terminal-container">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{detectionStats.success_rate}%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </CardContent>
          </Card>
          <Card className="terminal-container">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{detectionStats.recent_activity}</div>
                <div className="text-sm text-muted-foreground">Recent Activity</div>
              </div>
            </CardContent>
          </Card>
          <Card className="terminal-container">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{uniquePatterns.length}</div>
                <div className="text-sm text-muted-foreground">Pattern Types</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pattern Breakdown */}
      {detectionStats?.pattern_breakdown && (
        <Card className="terminal-container">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Pattern Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {detectionStats.pattern_breakdown.map((pattern, index) => (
                <div key={index} className="border border-border rounded p-3">
                  <div className="font-bold text-sm">{pattern.pattern}</div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-muted-foreground">{pattern.count} detections</span>
                    <Badge variant={pattern.success_rate >= 70 ? 'default' : 'secondary'}>
                      {pattern.success_rate}% success
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card className="terminal-container">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search symbol or pattern..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filterPattern} onValueChange={setFilterPattern}>
              <SelectTrigger>
                <SelectValue placeholder="Pattern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Patterns</SelectItem>
                {uniquePatterns.map(pattern => (
                  <SelectItem key={pattern} value={pattern}>{pattern}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterOutcome} onValueChange={setFilterOutcome}>
              <SelectTrigger>
                <SelectValue placeholder="Outcome" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Outcomes</SelectItem>
                <SelectItem value="win">Wins</SelectItem>
                <SelectItem value="loss">Losses</SelectItem>
                <SelectItem value="null">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last 24 hours</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-between items-center mt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setFilterPattern('all');
                setFilterOutcome('all');
              }}
            >
              Clear Filters
            </Button>
            <Button 
              variant="outline" 
              onClick={exportLogs}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detection Logs */}
      <Card className="terminal-container">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Detection History ({filteredDetections.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-3">
              {filteredDetections.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-bold mb-2">No detections found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or filters</p>
                </div>
              ) : (
                filteredDetections.map((detection) => (
                  <div
                    key={detection.id}
                    className="border border-border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-primary text-lg">{detection.symbol}</span>
                        <Badge variant="outline">{detection.pattern}</Badge>
                        <span className={`font-mono text-sm ${getConfidenceColor(detection.confidence)}`}>
                          {detection.confidence}
                        </span>
                        {detection.timeframe && (
                          <Badge variant="secondary">{detection.timeframe}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {getOutcomeBadge(detection.outcome)}
                        <span className="text-sm text-muted-foreground">
                          {new Date(detection.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Detection ID:</span>
                        <div className="font-mono">{detection.id}</div>
                      </div>
                      {detection.price && (
                        <div>
                          <span className="text-muted-foreground">Price:</span>
                          <div className="font-mono">{detection.price}</div>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Confidence:</span>
                        <div className={getConfidenceColor(detection.confidence)}>{detection.confidence}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <div>{detection.outcome || 'Pending feedback'}</div>
                      </div>
                    </div>
                    
                    {detection.details && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Details:</span>
                        <p className="mt-1 text-accent-foreground italic">{detection.details}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default DetectionLogs;
