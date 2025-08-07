import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, AlertTriangle, CheckCircle, Clock, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Alert {
  id?: number;
  symbol: string;
  pattern: string;
  confidence: string;
  price: string;
  time: string;
  explanation: string;
  action?: string;
  status?: 'active' | 'acknowledged' | 'expired';
}

interface AlertStats {
  total_alerts: number;
  active_alerts: number;
  success_rate: number;
  top_patterns: Array<{ pattern: string; count: number }>;
}

const API_BASE = 'https://446d0049-85a3-42b8-af8d-1b8de4387858-00-3abv9kw983fr2.janeway.replit.dev:8080';

const AlertCenter: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertStats, setAlertStats] = useState<AlertStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSymbol, setFilterSymbol] = useState<string>('all');

  useEffect(() => {
    fetchAlerts();
    fetchAlertStats();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/get_all_alerts`);
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAlertStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/get_alert_stats`);
      if (response.ok) {
        const data = await response.json();
        setAlertStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch alert stats:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'acknowledged':
        return <CheckCircle className="w-4 h-4 text-primary" />;
      case 'expired':
        return <Clock className="w-4 h-4 text-muted-foreground" />;
      default:
        return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "destructive" | "default" | "secondary" | "outline" } = {
      active: 'destructive',
      acknowledged: 'default',
      expired: 'secondary'
    };
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status || 'pending'}
      </Badge>
    );
  };

  const filteredAlerts = alerts.filter(alert => {
    const statusMatch = filterStatus === 'all' || alert.status === filterStatus;
    const symbolMatch = filterSymbol === 'all' || alert.symbol === filterSymbol;
    return statusMatch && symbolMatch;
  });

  const uniqueSymbols = [...new Set(alerts.map(alert => alert.symbol))];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="text-primary text-xl font-bold">Loading Alert Center...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert Statistics */}
      {alertStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="terminal-container">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{alertStats.total_alerts}</div>
                <div className="text-sm text-muted-foreground">Total Alerts</div>
              </div>
            </CardContent>
          </Card>
          <Card className="terminal-container">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">{alertStats.active_alerts}</div>
                <div className="text-sm text-muted-foreground">Active Alerts</div>
              </div>
            </CardContent>
          </Card>
          <Card className="terminal-container">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{alertStats.success_rate}%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </CardContent>
          </Card>
          <Card className="terminal-container">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{alertStats.top_patterns?.[0]?.pattern || 'N/A'}</div>
                <div className="text-sm text-muted-foreground">Top Pattern</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="terminal-container">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={filterSymbol} onValueChange={setFilterSymbol}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by symbol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Symbols</SelectItem>
                  {uniqueSymbols.map(symbol => (
                    <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                setFilterStatus('all');
                setFilterSymbol('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alert History */}
      <Card className="terminal-container">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Alert History ({filteredAlerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-3">
              {filteredAlerts.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-bold mb-2">No alerts found</h3>
                  <p className="text-muted-foreground">Try adjusting your filters</p>
                </div>
              ) : (
                filteredAlerts.map((alert, index) => (
                  <div
                    key={alert.id || index}
                    className="border border-border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(alert.status || 'pending')}
                        <span className="font-bold text-primary">{alert.symbol}</span>
                        <Badge variant="outline">{alert.pattern}</Badge>
                        <Badge variant="secondary">{alert.confidence}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(alert.status || 'pending')}
                        <span className="text-sm text-muted-foreground">{alert.time}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-mono">{alert.price}</span>
                      </div>
                      
                      {alert.explanation && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Analysis:</span>
                          <p className="mt-1 text-accent-foreground italic">{alert.explanation}</p>
                        </div>
                      )}
                      
                      {alert.action && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Action Taken:</span>
                          <Badge variant="outline" className="ml-2">{alert.action}</Badge>
                        </div>
                      )}
                    </div>
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

export default AlertCenter;