import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, TrendingUp, Activity, DollarSign, Play, X, Clock } from 'lucide-react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useEffect, useState } from 'react';
import { BackendAlert } from '@/types/alerts';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

export function TXDashboard() {
  const { isConnected, lastBatchAlert } = useWebSocket();
  const [alerts, setAlerts] = useState<BackendAlert[]>([]);
  const [features, setFeatures] = useState<any>(null);
  const { toast } = useToast();

  // Fetch initial alerts and features
  useEffect(() => {
    const fetchData = async () => {
      const [alertsRes, featuresRes] = await Promise.all([
        apiClient.getActiveAlerts(),
        apiClient.getFeatures()
      ]);
      
      if (alertsRes.success && alertsRes.data?.alerts) {
        setAlerts(alertsRes.data.alerts);
      }
      
      if (featuresRes.success && featuresRes.data) {
        setFeatures(featuresRes.data);
      }
    };
    
    fetchData();
  }, []);

  // Update alerts from WebSocket - batch alerts take priority
  useEffect(() => {
    if (lastBatchAlert) {
      setAlerts(prev => [lastBatchAlert, ...prev.slice(0, 19)]);
    }
  }, [lastBatchAlert]);

  const handleExecuteTrade = async (alert: BackendAlert) => {
    if (!features?.paper_trading_enabled) {
      toast({
        title: "Paper Trading Disabled",
        description: "Paper trading is currently disabled on the backend.",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await apiClient.executeFromAlert({
        symbol: alert.symbol,
        suggested_action: alert.metadata.suggested_action,
        risk_suggestions: alert.metadata.risk_suggestions,
        confidence: alert.confidence,
        pattern: alert.alert_type,
        quantity: 1
      });

      if (response.success) {
        toast({
          title: "Trade Executed",
          description: `${alert.metadata.suggested_action} order placed for ${alert.symbol}`,
        });
      } else {
        toast({
          title: "Trade Failed",
          description: response.error || "Failed to execute trade",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to execute trade",
        variant: "destructive"
      });
    }
  };

  const handleDismiss = async (alertId: number) => {
    try {
      await apiClient.dismissAlert(alertId.toString());
      setAlerts(prev => prev.filter(a => a.id !== alertId));
      toast({
        title: "Alert Dismissed",
        description: "Alert has been dismissed",
      });
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
    }
  };

  const handleSnooze = async (alertId: number) => {
    try {
      await apiClient.handleAlertResponse({
        alert_id: alertId,
        response: 'snooze'
      });
      toast({
        title: "Alert Snoozed",
        description: "Alert has been snoozed for 1 hour",
      });
    } catch (error) {
      console.error('Failed to snooze alert:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Bell className="h-4 w-4 text-tx-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-tx-text">{alerts.length}</div>
            <p className="text-xs text-tx-text-muted">
              {isConnected ? 'Live monitoring' : 'Disconnected'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Confidence</CardTitle>
            <TrendingUp className="h-4 w-4 text-tx-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-tx-text">
              {alerts.filter(a => a.confidence_pct > 85).length}
            </div>
            <p className="text-xs text-tx-text-muted">&gt;85% confidence</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Buy Signals</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-tx-text">
              {alerts.filter(a => a.metadata?.suggested_action === 'BUY').length}
            </div>
            <p className="text-xs text-tx-text-muted">Active buy opportunities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sell Signals</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-tx-text">
              {alerts.filter(a => a.metadata?.suggested_action === 'SELL').length}
            </div>
            <p className="text-xs text-tx-text-muted">Active sell opportunities</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-tx-green" />
            Recent Alerts
            {isConnected && (
              <Badge className="bg-tx-green/20 text-tx-green border-tx-green/30">
                Live
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <p className="text-center text-tx-text-muted py-8">
                No alerts available. Waiting for pattern detections...
              </p>
            ) : (
              alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="p-4 bg-tx-dark/30 rounded-lg border border-tx-green/20 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-tx-text text-lg">{alert.symbol}</span>
                        <Badge variant={alert.confidence_pct > 85 ? 'default' : 'secondary'}>
                          {alert.alert_type}
                        </Badge>
                        <Badge 
                          className={
                            alert.metadata.suggested_action === 'BUY' 
                              ? 'bg-green-500/20 text-green-400 border-green-500/30'
                              : alert.metadata.suggested_action === 'SELL'
                              ? 'bg-red-500/20 text-red-400 border-red-500/30'
                              : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                          }
                        >
                          {alert.metadata.suggested_action}
                        </Badge>
                      </div>
                      <p className="text-sm text-tx-text-muted mb-2">{alert.metadata.explanation}</p>
                      <div className="flex items-center gap-3 text-xs text-tx-text-muted">
                        <span className="font-mono">{alert.confidence_pct.toFixed(1)}% confidence</span>
                        <span>{alert.metadata.timeframe}</span>
                        <span title={alert.metadata.timestamp_eat}>
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Risk Suggestions */}
                  {alert.metadata.risk_suggestions && (
                    <div className="grid grid-cols-4 gap-2 p-3 bg-tx-dark/50 rounded border border-tx-green/10">
                      <div>
                        <div className="text-xs text-tx-text-muted">Entry</div>
                        <div className="text-sm font-semibold text-tx-green">
                          ${alert.metadata.risk_suggestions.entry.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-tx-text-muted">Stop Loss</div>
                        <div className="text-sm font-semibold text-red-400">
                          ${alert.metadata.risk_suggestions.stop_loss.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-tx-text-muted">Target</div>
                        <div className="text-sm font-semibold text-green-400">
                          ${alert.metadata.risk_suggestions.take_profit.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-tx-text-muted">R:R</div>
                        <div className="text-sm font-semibold text-tx-text">
                          1:{alert.metadata.risk_suggestions.rr.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {features?.paper_trading_enabled && alert.metadata.suggested_action !== 'CONTINUATION' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleExecuteTrade(alert)}
                        className="bg-tx-green hover:bg-tx-green/80"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Execute
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleSnooze(alert.id)}
                      className="border-tx-green/30"
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      Snooze
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleDismiss(alert.id)}
                      className="text-tx-text-muted hover:text-tx-text"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Dismiss
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default TXDashboard;
