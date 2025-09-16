/**
 * TX Trade Whisperer API Client
 * Comprehensive client for all backend API interactions
 */
import { API_BASE } from './api';
import socketService from './socket';

const API_BASE_URL = `${API_BASE}/api`;

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// Type definitions for API responses
export interface Alert {
  id: string;
  symbol: string;
  pattern: string;
  confidence: number;
  price: string | number;
  timestamp: string;
  explanation: string;
  risk_level: string;
}

export interface BacktestParams {
  symbol: string;
  patterns?: string[];
  timeframe?: string;
  lookback_days?: number;
}

export interface BacktestResult {
  win_rate: number;
  total_return: number;
  sharpe_ratio: number;
  max_drawdown: number;
  profit_factor: number;
  trades: Array<Record<string, unknown>>;
}

export interface PatternDetection {
  pattern: string;
  confidence: number;
  explanation: string;
  timeframe_weight: number;
  reasoning?: string;
  market_context?: string;
  suggested_actions?: string;
  // Volume analysis fields
  volume_current?: number;
  volume_average_5d?: number;
  volume_change_24h?: number;
  volume_profile?: Array<{time: string; volume: number; price: number}>;
  price_action_strength?: number;
  volume_confirmation?: number;
  key_levels?: Array<{type: 'support' | 'resistance'; price: number; strength: number; volume_cluster: number}>;
  volume_zones?: Array<{price_low: number; price_high: number; volume: number; type: 'accumulation' | 'distribution' | 'neutral'}>;
  // Sentiment fields
  sentiment_score?: number;
  social_indicators?: Array<{source: string; volume: number; sentiment: number; change_24h: number}>;
  news_impact?: Array<{title: string; source: string; sentiment: number; url: string}>;
  keywords?: Array<{term: string; count: number; sentiment: number}>;
}

export interface Asset {
  symbol: string;
  name: string;
  type: 'crypto' | 'stock' | 'forex';
  current_price: number;
  price_display: string;
  change_24h?: number;
}

export interface TradingSignal {
  symbol: string;
  signal_type: string;
  action: 'buy' | 'sell';
  confidence: number;
  price: number;
  stop_loss: number;
  take_profit: number;
  risk_reward_ratio: number;
}

export interface ScannerStatus {
  status: 'running' | 'stopped';
  last_scan: string;
  next_scan: string;
  total_scans: number;
  scan_interval: number;
  symbols_monitored: number;
}

export interface PaperTrade {
  symbol: string;
  action: 'buy' | 'sell';
  amount: number;
  price?: number;
  quantity?: number;
}

export interface PortfolioPosition {
  symbol?: string;
  ticker?: string;
  quantity?: number;
  qty?: number;
  price?: number;
  avg_price?: number;
  [key: string]: unknown;
}

export interface Portfolio {
  balance: number;
  positions: PortfolioPosition[];
  pnl: number;
  win_rate: number;
  trade_history: Array<Record<string, unknown>>;
  // Performance metrics
  profit_factor?: number;
  sharpe_ratio?: number;
  total_return?: number;
  max_drawdown?: number;
  total_trades?: number;
  winning_trades?: number;
  losing_trades?: number;
  avg_win_size?: number;
  avg_loss_size?: number;
  avg_hold_time?: number;
  performance_by_pattern?: Array<{pattern: string; trades: number; win_rate: number; avg_return: number}>;
  performance_by_timeframe?: Array<{timeframe: string; trades: number; win_rate: number; avg_return: number}>;
  monthly_performance?: Array<{month: string; return: number; trades: number}>;
}

export interface StrategyCondition {
  id?: string;
  type?: string;
  operator?: string;
  value?: string | number;
  logicOperator?: 'AND' | 'OR';
}

export interface Strategy {
  name: string;
  conditions: StrategyCondition[];
}

export interface TimeframeConsensus {
  symbol: string;
  timeframes: Record<string, PatternDetection[]>;
  consensus_patterns: {
    pattern: string;
    confidence: number;
    timeframes: string[];
    overall_strength: number;
  }[];
}

export interface SentimentData {
  symbol: string;
  sentiment_score: number;
  social_indicators: Array<{source: string; volume: number; sentiment: number; change_24h: number}>;
  news_impact: Array<{title: string; source: string; sentiment: number; url: string}>;
  overall_rating: 'bullish' | 'bearish' | 'neutral';
  keywords: Array<{term: string; count: number; sentiment: number}>;
}

export interface VolumeAnalysisData {
  symbol: string;
  volume_current: number;
  volume_average_5d: number;
  volume_change_24h: number;
  volume_profile: Array<{time: string; volume: number; price: number}>;
  price_strength: number;
  volume_confirmation: number;
  key_levels: Array<{type: 'support' | 'resistance'; price: number; strength: number; volume_cluster: number}>;
  volume_zones: Array<{price_low: number; price_high: number; volume: number; type: 'accumulation' | 'distribution' | 'neutral'}>;
}

export interface PatternInfo {
  name: string;
  type: 'bullish' | 'bearish' | 'neutral';
  description: string;
  success_rate: number;
  timeframe_weight: Record<string, number>;
  confirmation_factors: string[];
  image_url?: string;
  example_url?: string;
}

export interface PerformanceData {
  win_rate: number;
  profit_factor: number;
  sharpe_ratio: number;
  total_return: number;
  max_drawdown: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  avg_win_size: number;
  avg_loss_size: number;
  avg_hold_time: number;
  performance_by_pattern: Array<{pattern: string; trades: number; win_rate: number; avg_return: number}>;
  performance_by_timeframe: Array<{timeframe: string; trades: number; win_rate: number; avg_return: number}>;
  monthly_performance: Array<{month: string; return: number; trades: number}>;
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

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Auth methods
  async getSession() {
    return this.request<{ session: { user: { id: string } } | null }>('/auth/session', {
      method: 'POST'
    });
  }

  async getUser() {
    return this.request<{ user: { id: string; email?: string } | null }>('/auth/user', {
      method: 'GET'
    });
  }

  // Profile methods
  async getProfile(id: string) {
    return this.request<{ id: string; email?: string; name?: string }>(`/profiles/${id}`);
  }

  async createProfile(profileData: { email: string; name?: string }) {
    return this.request<{ id: string; email: string; name?: string }>('/profiles', {
      method: 'POST',
      body: JSON.stringify(profileData)
    });
  }

  // Health check (outside /api prefix)
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE}/health`, {
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Health check failed:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' } as unknown as ApiResponse<{ status: string; timestamp: string }>;
    }
  }

  // 1. Alerts
  async getActiveAlerts() {
    return this.request<{ alerts: Alert[] }>(`/get_active_alerts`);
  }

  async handleAlertResponse(payload: { alert_id?: string; action: 'BUY' | 'SELL' | 'IGNORE' }) {
    return this.request<{ status: string }>(`/handle_alert_response`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getLatestDetectionId() {
    return this.request<{ detection_id: string }>(`/get_latest_detection_id`);
  }

  async logOutcome(payload: { detection_id: string; outcome: 'profitable' | 'loss' }) {
    return this.request<{ status: string }>(`/log_outcome`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // 2. Backtesting
  async backtestPattern(params: { pattern: string; symbol: string; days?: number }) {
    return this.request<BacktestResult>('/backtest/pattern', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  async backtestStrategy(params: Record<string, unknown>) {
    return this.request('/backtest/strategy', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  // 3. Detection & Scan
  async getCandles(symbol: string, timeframe: string) {
    return this.request<any>(`/candles?symbol=${encodeURIComponent(symbol)}&timeframe=${encodeURIComponent(timeframe)}`);
  }

  async getMarketScan() {
    return this.request<{ last_scan?: { results?: Array<Record<string, unknown>> }; alerts?: Array<Record<string, unknown>>; paper_trades?: Array<Record<string, unknown>>; last_signal?: Record<string, unknown> }>("/scan");
  }

  // 4. Data Coverage
  async getAssetsList() {
    return this.request<Asset[]>("/assets/list");
  }

  async getPatternsList() {
    return this.request<string[]>("/patterns/list");
  }

  // 5. Entry/Exit Signals
  async getTradingSignals() {
    return this.request<TradingSignal[]>('/signals/entry-exit');
  }

  async generateEntryExitSignals(payload: { symbol?: string; pattern?: string; timeframe?: string }) {
    return this.request('/signals/entry-exit', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // 6. System Status
  async getStatus() {
    return this.request<{ status: string; details?: any }>('/status');
  }

  async getFeatures() {
    return this.request<Record<string, boolean>>('/features');
  }



  // 11. Analytics & Stats
  async getPortfolioMetrics() {
    return this.request<Portfolio>('/trading-stats');
  }

  async getDetectionStats() {
    return this.request<any>('/detection_stats');
  }

  async getDetectionLogs() {
    return this.request<any>('/detection_logs');
  }

  async exportDetectionLogs() {
    return this.request<any>('/export_detection_logs');
  }

  async getAnalyticsSummary() {
    return this.request<any>('/analytics/summary');
  }



  // 14. Strategy & Risk Management (Flask-supported)
  async getStrategies() {
    return this.request<Strategy[]>('/strategies');
  }

  async createStrategy(strategy: Strategy) {
    return this.request('/strategies', {
      method: 'POST',
      body: JSON.stringify(strategy)
    });
  }

  async getRiskSettings() {
    return this.request<any>('/risk-settings');
  }

  async updateRiskSettings(payload: Record<string, unknown>) {
    return this.request('/risk-settings', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // 16. Paper Trading
  async getPaperPortfolio() {
    return this.request<any>('/paper-trades');
  }

  async executePaperTrade(trade: { symbol: string; action: 'buy' | 'sell'; quantity: number; price: number; pattern?: string; confidence?: number }) {
    return this.request('/paper-trades', {
      method: 'POST',
      body: JSON.stringify({
        symbol: trade.symbol,
        side: trade.action.toUpperCase(),
        amount_usd: Number.isFinite(trade.price * trade.quantity) ? trade.price * trade.quantity : undefined,
        price: trade.price,
        quantity: trade.quantity,
        pattern: trade.pattern,
        confidence: trade.confidence,
      })
    });
  }

  async closePaperPosition(payload: { symbol?: string; trade_id?: string | number }) {
    return this.request('/close-position', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Removed unsupported paper history placeholder

  // 19. Sentiment & AI Features
  async getSentimentData(symbol: string) {
    return this.request<SentimentData>(`/sentiment/${symbol}`);
  }

  async enhanceConfidence(payload: { symbol: string; pattern: string }) {
    return this.request(`/sentiment/enhance-confidence`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async sentimentAlertCondition(payload: { symbol: string; threshold?: number }) {
    return this.request(`/sentiment/alert-condition`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async detectEnhanced(payload: Record<string, unknown>) {
    return this.request(`/detect/enhanced`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async recommendComplete(payload: Record<string, unknown>) {
    return this.request(`/recommend/complete`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getPatternExplanation(pattern_name: string) {
    return this.request(`/explain/pattern/${encodeURIComponent(pattern_name)}`);
  }

  async explainAlert(payload: { alert_id?: string; details?: Record<string, unknown> }) {
    return this.request(`/explain/alert`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // 20. Pattern Registry → use list endpoint
  async getPatternList() {
    return this.request<string[]>('/patterns/list');
  }

  // 22. Volume & Price Analysis → use candles
  // (call getCandles for OHLC data)

  // Removed unsupported timeframe/multi-timeframe analysis endpoints
}

// Socket event handlers
export const socketHandlers = {
  // 1. Alert System
  onNewAlert: (callback: (alert: Alert) => void) => {
    socketService.onNewAlert(callback);
    return () => socketService.off('new_alert', callback);
  },

  // 7. Genuine Market Data
  onMarketUpdate: (callback: (markets: Record<string, { price: number, change_24h: number }>) => void) => {
    socketService.onMarketUpdate(callback);
    return () => socketService.off('market_update', callback);
  },

  // 12. Live Market Scanning
  onScanUpdate: (callback: (scan: Record<string, unknown>) => void) => {
    socketService.onScanUpdate(callback as (data: unknown) => void);
    return () => socketService.off('scan_update', callback as (data: unknown) => void);
  },

  // Connection state
  onConnectionStateChange: (callback: (state: string) => void) => {
    return socketService.onConnectionStateChange(callback);
  }
};

export const apiClient = new ApiClient();

// Mock auth state management for migration
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
    return apiClient.getSession();
  }

  async getUser() {
    return apiClient.getUser();
  }
}

export const auth = new AuthManager();
