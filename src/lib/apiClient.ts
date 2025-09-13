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
  trades: any[];
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

export interface Portfolio {
  balance: number;
  positions: any[];
  pnl: number;
  win_rate: number;
  trade_history: any[];
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

export interface Strategy {
  name: string;
  conditions: any[];
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
    return this.request<any>(`/profiles/${id}`);
  }

  async createProfile(profileData: any) {
    return this.request<any>('/profiles', {
      method: 'POST',
      body: JSON.stringify(profileData)
    });
  }

  // Health check
  async healthCheck() {
    return this.request<{ status: string; timestamp: string }>('/health');
  }

  // 1. Alert System
  async getRecentAlerts(limit = 20) {
    return this.request<Alert[]>(`/alerts/recent?limit=${limit}`);
  }

  // 2. Backtesting Engine
  async runBacktest(params: BacktestParams) {
    return this.request<BacktestResult>('/backtest/run', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  // 3. Candlestick Pattern Detection
  async detectPatterns(symbol: string, timeframe = '1h') {
    return this.request<PatternDetection[]>(`/detect/${symbol}?timeframe=${timeframe}`);
  }

  async getMarketScan() {
    return this.request<any>('/scan');
  }

  // 4. Data Coverage
  async getAssetsList() {
    return this.request<Asset[]>('/assets/list');
  }

  // 5. Entry/Exit Signals
  async getTradingSignals() {
    return this.request<TradingSignal[]>('/signals/entry-exit');
  }

  // 6. Feature Monitoring
  async getScannerStatus() {
    return this.request<ScannerStatus>('/scan/status');
  }

  async startScanner() {
    return this.request('/scan/start', { method: 'POST' });
  }

  async stopScanner() {
    return this.request('/scan/stop', { method: 'POST' });
  }

  // 8. Historical Analysis
  async runHistoricalAnalysis(symbol: string, lookback_days = 90) {
    return this.request('/backtest/run', {
      method: 'POST',
      body: JSON.stringify({ symbol, lookback_days })
    });
  }

  // 11. Key Performance Indicators
  async getPortfolioMetrics() {
    return this.request<Portfolio>('/paper/portfolio');
  }

  async getPatternStatistics() {
    return this.request<any>('/analytics/patterns');
  }

  async getPerformanceMetrics() {
    return this.request<PerformanceData>('/analytics/performance');
  }

  // 14. No-Code Strategy Builder
  async getStrategyTemplates() {
    return this.request<any>('/strategy/list');
  }

  async createStrategy(strategy: Strategy) {
    return this.request('/strategy/create', {
      method: 'POST',
      body: JSON.stringify(strategy)
    });
  }

  // 16. Paper Trading
  async getPaperPortfolio() {
    return this.request<Portfolio>('/paper/portfolio');
  }

  async executePaperTrade(trade: PaperTrade) {
    return this.request('/paper/trade', {
      method: 'POST',
      body: JSON.stringify(trade)
    });
  }

  async getPaperTradeHistory(limit = 50) {
    return this.request<any>(`/paper/history?limit=${limit}`);
  }

  // 19. Sentiment Analysis
  async getSentimentData(symbol: string) {
    return this.request<SentimentData>(`/sentiment/${symbol}`);
  }

  // 20. Technical Pattern Registry
  async getPatternRegistry() {
    return this.request<{ patterns: PatternInfo[] }>('/patterns');
  }

  // 22. Volume & Price Analysis
  async getVolumeAnalysis(symbol: string) {
    return this.request<VolumeAnalysisData>(`/volume-analysis/${symbol}`);
  }

  // 24. Extended Timeframe Support
  async getTimeframes() {
    return this.request<any>('/timeframes');
  }

  async getMultiTimeframeAnalysis(symbol: string, timeframes: string[]) {
    return this.request<TimeframeConsensus>(`/analyze/multi-timeframe/${symbol}?timeframes=${timeframes.join(',')}`);
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
  onScanUpdate: (callback: (scan: any) => void) => {
    socketService.onScanUpdate(callback);
    return () => socketService.off('scan_update', callback);
  },

  // Connection state
  onConnectionStateChange: (callback: (state: string) => void) => {
    return socketService.onConnectionStateChange(callback);
  }
};

export const apiClient = new ApiClient();

// Mock auth state management for migration
class AuthManager {
  private listeners: Array<(event: string, session: any) => void> = [];

  onAuthStateChange(callback: (event: string, session: any) => void) {
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
