import { API_BASE } from './api';
import socketService from './socket';

const API_BASE_URL = `${API_BASE}/api`;

export interface ApiResponse<T> {
  success?: boolean;
  data: T | null;
  error: string | null;
}

// Type definitions for API responses
export interface Alert {
  id: number;
  symbol: string;
  alert_type: string;
  message: string;
  confidence: number;
  timestamp: string;
  is_active: boolean;
}

export interface BacktestParams {
  symbol: string;
  strategy_id?: number;
  start_date?: string;
  end_date?: string;
  patterns?: string[];
  timeframe?: string;
  lookback_days?: number;
}

export interface BacktestResult {
  symbol: string;
  strategy_id: number;
  period: string;
  total_return: number;
  annualized_return: number;
  sharpe_ratio: number;
  max_drawdown: number;
  win_rate: number;
  total_trades: number;
  profitable_trades: number;
  trades: Array<any>;
  timestamp: string;
}

export interface PatternDetection {
  symbol: string;
  pattern_type: string;
  confidence: number;
  price: number;
  volume: number;
  timestamp: string;
  metadata?: any;
}

export interface Asset {
  symbol: string;
  price: number;
  change: number;
  change_percent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  market_cap?: number;
  pe_ratio?: number;
  timestamp: string;
}

export interface TradingSignal {
  type: string;
  action: string;
  pattern: string;
  confidence: number;
  price: number;
  stop_loss: number;
  take_profit: number;
  risk_reward_ratio: number;
  timeframe: string;
  timestamp: string;
}

export interface ScannerStatus {
  active: boolean;
  start_time: string;
  symbols_scanned: number;
  patterns_found: number;
  last_scan: string;
}

export interface PaperTrade {
  id?: number;
  symbol: string;
  side: string;
  quantity: number;
  price: number;
  executed_at: string;
  status?: string;
  pnl?: number;
  pattern?: string;
  confidence?: number;
}

export interface PortfolioPosition {
  symbol: string;
  quantity: number;
  avg_entry: number;
  pnl: number;
  pattern?: string;
  confidence?: number;
  last_update: string;
}

export interface Portfolio {
  positions: { [symbol: string]: PortfolioPosition };
  total_pnl: number;
  total_value: number;
  timestamp: string;
}

export interface Strategy {
  id: number;
  name: string;
  description: string;
  type: string;
  parameters: any;
}

export interface SentimentData {
  symbol: string;
  sentiment_score: number;
  overall_rating: string;
  social_indicators: Array<any>;
  news_impact: Array<any>;
  keywords: Array<string>;
  timestamp: string;
}

class ApiClient {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Handle Flask response format: { success: boolean, data: T, error?: string }
      if (result.success === false) {
        return {
          success: false,
          data: null,
          error: result.error || 'Request failed'
        };
      }
      
      return {
        success: true,
        data: result.data || result, // Some endpoints return data directly, some nested
        error: null
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // === HEALTH ENDPOINTS ===
  async healthCheck() {
    return this.request<{ status: string; service: string; version: string; database: string; timestamp: string }>('/health');
  }

  // === MARKET DATA ENDPOINTS ===
  async getMarketScan(type?: 'trending' | 'volume') {
    const params = type ? `?type=${type}` : '';
    return this.request<Asset[]>(`/market-scan${params}`);
  }

  async getStockData(symbol: string) {
    return this.request<Asset>(`/stock/${symbol}`);
  }

  async getCandles(symbol: string, period: string = '1d', interval: string = '1h') {
    const params = new URLSearchParams({
      symbol: symbol.toUpperCase(),
      period,
      interval
    });
    return this.request<any>(`/candles?${params.toString()}`);
  }

  // === SCANNING ENDPOINTS ===
  async startLiveScanning(symbols: string[] = ['AAPL', 'GOOGL', 'MSFT'], interval: number = 60) {
    return this.request<{ success: boolean; message: string; config: any }>('/scan/start', {
      method: 'POST',
      body: JSON.stringify({ symbols, interval })
    });
  }

  async stopLiveScanning() {
    return this.request<{ success: boolean; message: string; final_stats: any }>('/scan/stop', {
      method: 'POST'
    });
  }

  async getScanningStatus() {
    return this.request<ScannerStatus>('/scan/status');
  }

  // === PATTERN DETECTION ENDPOINTS ===
  async detectPatterns(symbol: string) {
    return this.request<PatternDetection[]>('/detect-enhanced', {
      method: 'POST',
      body: JSON.stringify({ symbol: symbol.toUpperCase() })
    });
  }

  async getPatternStats() {
    return this.request<any[]>('/pattern-stats');
  }

  async getAvailablePatterns() {
    return this.request<any[]>('/patterns/list');
  }

  async explainPattern(patternName: string) {
    return this.request<any>(`/explain/pattern/${encodeURIComponent(patternName)}`);
  }

  async explainAlert(alertId: number) {
    return this.request<any>('/explain/alert', {
      method: 'POST',
      body: JSON.stringify({ alert_id: alertId })
    });
  }

  // === SENTIMENT ENDPOINTS ===
  async getSentiment(symbol: string) {
    return this.request<SentimentData>(`/sentiment/${symbol.toUpperCase()}`);
  }

  async enhanceConfidence(symbol: string, baseConfidence: number, patternType: string) {
    return this.request<any>('/sentiment/enhance-confidence', {
      method: 'POST',
      body: JSON.stringify({ 
        symbol: symbol.toUpperCase(), 
        base_confidence: baseConfidence,
        pattern_type: patternType 
      })
    });
  }

  async checkSentimentAlert(symbol: string, conditionType: string = 'bullish_surge', threshold: number = 0.7) {
    return this.request<any>('/sentiment/alert-condition', {
      method: 'POST',
      body: JSON.stringify({ 
        symbol: symbol.toUpperCase(),
        condition_type: conditionType,
        threshold: threshold
      })
    });
  }

  // === TRADING SIGNALS ENDPOINTS ===
  async getEntryExitSignals(symbol?: string, timeframe: string = '1d', signalType: string = 'all') {
    const params = new URLSearchParams();
    if (symbol) params.append('symbol', symbol.toUpperCase());
    params.append('timeframe', timeframe);
    params.append('type', signalType);
    
    return this.request<any>(`/signals/entry-exit?${params.toString()}`);
  }

  async generateSignals(symbols: string[] = ['AAPL', 'GOOGL', 'MSFT'], timeframe: string = '1d', minConfidence: number = 0.7) {
    return this.request<any>('/signals/entry-exit', {
      method: 'POST',
      body: JSON.stringify({
        symbols: symbols.map(s => s.toUpperCase()),
        timeframe,
        min_confidence: minConfidence
      })
    });
  }

  // === ALERTS ENDPOINTS ===
  async getActiveAlerts() {
    return this.request<Alert[]>('/get_active_alerts');
  }

  async dismissAlert(alertId: number) {
    return this.request<{ success: boolean; message: string }>(`/alerts/dismiss/${alertId}`, {
      method: 'POST'
    });
  }

  async handleAlertResponse(alertId: number, response: string, userAction?: string) {
    return this.request<{ success: boolean; message: string; data: any }>('/handle_alert_response', {
      method: 'POST',
      body: JSON.stringify({
        alert_id: alertId,
        response: response,
        action: userAction
      })
    });
  }

  async getLatestDetectionId() {
    return this.request<{ latest_detection_id: number }>('/get_latest_detection_id');
  }

  // === PAPER TRADING ENDPOINTS ===
  async getPaperPortfolio() {
    return this.request<Portfolio>('/paper-trades');
  }

  async executePaperTrade(symbol: string, side: 'BUY' | 'SELL', quantity: number, price?: number, pattern?: string, confidence?: number) {
    return this.request<any>('/paper-trades', {
      method: 'POST',
      body: JSON.stringify({
        symbol: symbol.toUpperCase(),
        side: side.toUpperCase(),
        quantity: quantity,
        price: price,
        pattern: pattern,
        confidence: confidence
      })
    });
  }

  async closePosition(symbol?: string, tradeId?: number) {
    return this.request<any>('/close-position', {
      method: 'POST',
      body: JSON.stringify({
        symbol: symbol ? symbol.toUpperCase() : undefined,
        trade_id: tradeId
      })
    });
  }

  // === BACKTESTING ENDPOINTS ===
  async getStrategies() {
    return this.request<Strategy[]>('/strategies');
  }

  async runBacktest(params: BacktestParams) {
    return this.request<BacktestResult>('/backtest', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  async backtestPattern(patternName: string, symbol: string, startDate: string = '2023-01-01', endDate: string = '2024-01-01') {
    return this.request<BacktestResult>('/backtest/pattern', {
      method: 'POST',
      body: JSON.stringify({
        pattern_name: patternName,
        symbol: symbol.toUpperCase(),
        start_date: startDate,
        end_date: endDate
      })
    });
  }

  // === ANALYTICS ENDPOINTS ===
  async getAnalyticsSummary() {
    return this.request<any>('/analytics/summary');
  }

  async getTradingStats() {
    return this.request<any>('/trading-stats');
  }

  async getDetectionStats() {
    return this.request<any>('/detection_stats');
  }

  async getDetectionLogs(limit: number = 50, offset: number = 0, symbol?: string, pattern?: string) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });
    if (symbol) params.append('symbol', symbol.toUpperCase());
    if (pattern) params.append('pattern', pattern);
    
    return this.request<any>(`/detection_logs?${params.toString()}`);
  }

  // === RISK MANAGEMENT ENDPOINTS ===
  async getRiskSettings() {
    return this.request<any>('/risk-settings');
  }

  async updateRiskSettings(settings: any) {
    return this.request<any>('/risk-settings', {
      method: 'POST',
      body: JSON.stringify(settings)
    });
  }

  // === DATA COVERAGE ENDPOINTS ===
  async getSupportedAssets() {
    return this.request<any>('/assets/list');
  }

  async getFeatureStatus() {
    return this.request<any>('/features');
  }

  // === COMPATIBILITY METHODS FOR EXISTING FRONTEND ===
  async getMarketScanLegacy(type?: 'trending' | 'volume') {
    const response = await this.getMarketScan(type);
    if (response.data && Array.isArray(response.data)) {
      return {
        data: {
          last_scan: {
            results: response.data.map((asset: Asset) => ({
              symbol: asset.symbol,
              status: 'active',
              price: asset.price,
              change: asset.change_percent
            }))
          },
          alerts: [],
          paper_trades: [],
          last_signal: null
        },
        error: response.error
      };
    }
    return response;
  }

  async getActiveAlertsLegacy() {
    const response = await this.getActiveAlerts();
    return {
      data: { alerts: response.data || [] },
      error: response.error
    };
  }
}

// Socket event handlers
export const socketHandlers = {
  onNewAlert: (callback: (alert: Alert) => void) => {
    socketService.onNewAlert(callback);
    return () => socketService.off('new_alert', callback);
  },

  onMarketUpdate: (callback: (data: any) => void) => {
    socketService.onMarketUpdate(callback);
    return () => socketService.off('market_scan_update', callback);
  },

  onScanUpdate: (callback: (data: any) => void) => {
    socketService.onScanUpdate(callback);
    return () => socketService.off('scan_update', callback);
  },

  onConnectionStateChange: (callback: (state: string) => void) => {
    return socketService.onConnectionStateChange(callback);
  }
};

export const apiClient = new ApiClient();

// Mock auth for compatibility
class AuthManager {
  private listeners: Array<(event: string, session: unknown) => void> = [];

  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    this.listeners.push(callback);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const index = this.listeners.indexOf(callback);
            if (index > -1) {
              this.listeners.splice(index, 1);
            }
          }
        }
      }
    };
  }

  async getSession() {
    return { data: { session: { user: { id: 'demo-user' } } }, error: null };
  }

  async getUser() {
    return { data: { user: { id: 'demo-user', email: 'demo@example.com' } }, error: null };
  }
}

export const auth = new AuthManager();
