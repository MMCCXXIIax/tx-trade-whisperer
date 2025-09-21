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

  // === BACKEND TEAM APPROVED ENDPOINTS ===

  // Health: GET /, GET /health
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

  async getHealth() {
    return this.request<{ status: string; timestamp: string }>('/health');
  }

  async getRoot() {
    return this.request<{ status: string; message: string }>('/');
  }

  // Market data: GET /api/market-scan (type=trending|volume), GET /api/scan (alias), GET /api/stock/, GET /api/candles?symbol=...&period=...&interval=...
  async getMarketScan(type?: 'trending' | 'volume') {
    const params = type ? `?type=${type}` : '';
    return this.request<{ last_scan?: { results?: Array<Record<string, unknown>> }; alerts?: Array<Record<string, unknown>>; paper_trades?: Array<Record<string, unknown>>; last_signal?: Record<string, unknown> }>(`/market-scan${params}`);
  }

  async getScan(type?: 'trending' | 'volume') {
    const params = type ? `?type=${type}` : '';
    return this.request<{ last_scan?: { results?: Array<Record<string, unknown>> }; alerts?: Array<Record<string, unknown>>; paper_trades?: Array<Record<string, unknown>>; last_signal?: Record<string, unknown> }>(`/scan${params}`);
  }

  async getStock() {
    return this.request<Asset[]>('/stock/');
  }

  async getCandles(symbol: string, period?: string, interval?: string) {
    const params = new URLSearchParams();
    params.append('symbol', symbol);
    if (period) params.append('period', period);
    if (interval) params.append('interval', interval);
    return this.request<any>(`/candles?${params.toString()}`);
  }

  // Live scanning: POST /api/scan/start, POST /api/scan/stop, GET /api/scan/status
  async startScan() {
    return this.request<{ status: string }>('/scan/start', {
      method: 'POST'
    });
  }

  async stopScan() {
    return this.request<{ status: string }>('/scan/stop', {
      method: 'POST'
    });
  }

  async getScanStatus() {
    return this.request<ScannerStatus>('/scan/status');
  }

  // Pattern detection: POST /api/detect-enhanced, POST /api/detect/enhanced, GET /api/pattern-stats, GET /api/patterns/list, GET /api/explain/pattern/<pattern_name>, POST /api/explain/alert
  async detectEnhanced(payload: Record<string, unknown>) {
    return this.request<PatternDetection>('/detect-enhanced', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async detectEnhancedAlt(payload: Record<string, unknown>) {
    return this.request<PatternDetection>('/detect/enhanced', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getPatternStats() {
    return this.request<any[]>('/pattern-stats');
  }

  async getPatternsList() {
    return this.request<string[]>('/patterns/list');
  }

  async getPatternExplanation(pattern_name: string) {
    return this.request<any>(`/explain/pattern/${encodeURIComponent(pattern_name)}`);
  }

  async explainAlert(payload: { alert_id?: string; details?: Record<string, unknown> }) {
    return this.request<any>('/explain/alert', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Sentiment: GET /api/sentiment/, POST /api/sentiment/enhance-confidence, POST /api/sentiment/alert-condition
  async getSentiment() {
    return this.request<SentimentData>('/sentiment/');
  }

  async getSentimentData(symbol: string) {
    return this.request<SentimentData>(`/sentiment/?symbol=${encodeURIComponent(symbol)}`);
  }

  async enhanceConfidence(payload: { symbol: string; pattern: string }) {
    return this.request<any>('/sentiment/enhance-confidence', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async sentimentAlertCondition(payload: { symbol: string; threshold?: number }) {
    return this.request<any>('/sentiment/alert-condition', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Signals: GET /api/signals/entry-exit, POST /api/signals/entry-exit
  async getTradingSignals() {
    return this.request<TradingSignal[]>('/signals/entry-exit');
  }

  async generateEntryExitSignals(payload: { symbol?: string; pattern?: string; timeframe?: string }) {
    return this.request<TradingSignal[]>('/signals/entry-exit', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Alerts: GET /api/get_active_alerts, POST /api/alerts/dismiss/, POST /api/handle_alert_response, GET /api/get_latest_detection_id
  async getActiveAlerts() {
    return this.request<{ alerts: Alert[] }>('/get_active_alerts');
  }

  async dismissAlert(alertId: string) {
    return this.request<{ status: string }>(`/alerts/dismiss/`, {
      method: 'POST',
      body: JSON.stringify({ alert_id: alertId })
    });
  }

  async handleAlertResponse(payload: { alert_id?: string; action: 'BUY' | 'SELL' | 'IGNORE' }) {
    return this.request<{ status: string }>('/handle_alert_response', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getLatestDetectionId() {
    return this.request<{ detection_id: string | number }>('/get_latest_detection_id');
  }

  // Paper trading: GET /api/paper-trades, POST /api/paper-trades, POST /api/close-position
  async getPaperPortfolio() {
    return this.request<Portfolio>('/paper-trades');
  }

  async executePaperTrade(trade: { symbol: string; action: 'buy' | 'sell'; quantity: number; price: number; pattern?: string; confidence?: number }) {
    return this.request<any>('/paper-trades', {
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
    return this.request<any>('/close-position', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Backtesting: POST /api/backtest, POST /api/backtest/pattern, POST /api/backtest/strategy
  async backtest(params: BacktestParams) {
    return this.request<BacktestResult>('/backtest', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  async backtestPattern(params: { pattern: string; symbol: string; days?: number }) {
    return this.request<BacktestResult>('/backtest/pattern', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  async backtestStrategy(params: Record<string, unknown>) {
    return this.request<BacktestResult>('/backtest/strategy', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  // === LEGACY METHODS FOR BACKWARD COMPATIBILITY ===
  // These methods map to the new endpoints above or provide graceful fallbacks

  async getAssetsList() {
    return this.getStock();
  }

  async getPortfolioMetrics() {
    return this.getPaperPortfolio();
  }

  async getPatternRegistry() {
    // Since there's no /patterns/registry endpoint, we'll use pattern stats
    return this.getPatternStats().then(stats => ({
      data: { patterns: stats || [] },
      error: null
    }));
  }

  // Methods that don't exist in backend - return empty/default responses
  async getDetectionStats() {
    console.warn('getDetectionStats: Endpoint not available in backend');
    return { data: [], error: null };
  }

  async getDetectionLogs() {
    console.warn('getDetectionLogs: Endpoint not available in backend');
    return { data: [], error: null };
  }

  async exportDetectionLogs() {
    console.warn('exportDetectionLogs: Endpoint not available in backend');
    return { data: null, error: 'Feature not available' };
  }

  async getAnalyticsSummary() {
    console.warn('getAnalyticsSummary: Endpoint not available in backend');
    return { data: {}, error: null };
  }

  async getStrategies() {
    console.warn('getStrategies: Endpoint not available in backend');
    return { data: [], error: null };
  }

  async createStrategy(strategy: Strategy) {
    console.warn('createStrategy: Endpoint not available in backend');
    return { data: null, error: 'Feature not available' };
  }

  async getRiskSettings() {
    console.warn('getRiskSettings: Endpoint not available in backend');
    return { data: {}, error: null };
  }

  async updateRiskSettings(payload: Record<string, unknown>) {
    console.warn('updateRiskSettings: Endpoint not available in backend');
    return { data: null, error: 'Feature not available' };
  }

  async getStatus() {
    // Map to scan status
    return this.getScanStatus();
  }

  async getFeatures() {
    console.warn('getFeatures: Endpoint not available in backend');
    return { data: {}, error: null };
  }

  async logOutcome(payload: { detection_id: string; outcome: 'profitable' | 'loss' }) {
    console.warn('logOutcome: Endpoint not available in backend');
    return { data: null, error: 'Feature not available' };
  }

  async recommendComplete(payload: Record<string, unknown>) {
    console.warn('recommendComplete: Endpoint not available in backend');
    return { data: null, error: 'Feature not available' };
  }

  // Methods that need to be mapped to existing endpoints
  async getVolumeAnalysis(symbol: string) {
    // Use candles endpoint for volume data
    return this.getCandles(symbol, '1d', '1h');
  }

  async detectPatterns(symbol: string, timeframe?: string) {
    // Use detect-enhanced endpoint
    return this.detectEnhanced({ symbol, timeframe });
  }

  async getMultiTimeframeAnalysis(symbol: string, timeframes: string[]) {
    // Call detect-enhanced for each timeframe
    const results = await Promise.all(
      timeframes.map(tf => this.detectEnhanced({ symbol, timeframe: tf }))
    );
    return { data: results, error: null };
  }

  async closePaperTrade(tradeId: string | number, currentPrice: number) {
    // Map to close position
    return this.closePaperPosition({ trade_id: tradeId });
  }
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