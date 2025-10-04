// API client aligned with Flask backend endpoints
import { API_BASE } from './api';
const API_BASE_URL = `${API_BASE}/api`;

interface FlaskApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  version?: string;
  timestamp?: string;
}

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<FlaskApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        // Check if it's a CORS error
        const isCorsError = response.type === 'opaque' || response.status === 0;
        if (isCorsError) {
          return {
            success: false,
            error: 'CORS Error: Flask backend must allow requests from this domain. Add your frontend URL to CORS configuration.'
          };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle Flask response format: { success, data?, error? }
      if (typeof data.success === 'boolean') {
        return data;
      }
      
      // Legacy format compatibility
      return {
        success: true,
        data: data as T
      };
    } catch (error) {
      console.error('API request failed:', error);
      
      // Check for network/CORS errors
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return {
          success: false,
          error: 'Network Error: Unable to reach Flask backend. Check if the backend is running and CORS is configured correctly.'
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Flask backend endpoints (matching your API documentation)
  async getHealth() {
    return this.request<{ version: string; timestamp: string }>('/health');
  }

  async getCoverage() {
    return this.request<{ sources: any; intervals: any; patterns_supported: any }>('/coverage');
  }

  async getMarket(symbol: string) {
    return this.request<{ symbol: string; price: number; change: number; change_percent: number; volume: number; high: number; low: number; open: number; market_cap?: number; pe_ratio?: number; timestamp: string }>(`/market/${symbol}`);
  }

  async getCandles(symbol: string, period: string = '1d', interval: string = '1m') {
    return this.request<{ symbol: string; period: string; interval: string; candles: Array<{ timestamp: string; open: number; high: number; low: number; close: number; volume: number }> }>(`/candles?symbol=${symbol}&period=${period}&interval=${interval}`);
  }

  async detectEnhanced(symbol: string) {
    return this.request<Array<{ symbol: string; pattern_type: string; confidence: number; confidence_pct: number; price: number; volume: number; timestamp: string; metadata: any; entry_signal: any; exit_signal: any; market_context: any; keywords: string[]; sentiment_score: number }>>('/detect-enhanced', {
      method: 'POST',
      body: JSON.stringify({ symbol })
    });
  }

  async getPatternStats() {
    return this.request<Array<{ pattern: string; count: number; avg_confidence: number }>>('/pattern-stats');
  }

  async getSignalsEntryExit(symbol?: string, timeframe: string = '1d', type: string = 'all') {
    const params = new URLSearchParams({ timeframe, type });
    if (symbol) params.set('symbol', symbol);
    return this.request<{ symbol: string; timeframe: string; signals: any[] }>(`/signals/entry-exit?${params}`);
  }

  async postSignalsEntryExit(symbols: string[], timeframe: string = '1d', minConfidence: number = 0.6) {
    return this.request<{ data: Array<{ symbol: string; signals: any[] }>; meta: { min_confidence_threshold: number }; timestamp: string }>('/signals/entry-exit', {
      method: 'POST',
      body: JSON.stringify({ symbols, timeframe, min_confidence: minConfidence })
    });
  }

  async getSentiment(symbol: string) {
    return this.request<{ symbol: string; overall_sentiment: string; confidence: number; sources: { twitter: any; reddit: any; news: any }; volume: number; trending_score: number; key_phrases: string[]; timestamp: string; sentiment_label: string }>(`/sentiment/${symbol}`);
  }

  async enhanceConfidence(symbol: string, baseConfidence: number, patternType: string) {
    return this.request<{ symbol: string; base_confidence: number; enhanced_confidence: number; sentiment: any; enhancement_factor: number; timestamp: string }>('/sentiment/enhance-confidence', {
      method: 'POST',
      body: JSON.stringify({ symbol, base_confidence: baseConfidence, pattern_type: patternType })
    });
  }

  async checkAlertCondition(symbol: string, patternType: string) {
    return this.request<{ should_alert: boolean; sentiment_data: any; alert_reason: string; priority: string }>('/sentiment/alert-condition', {
      method: 'POST',
      body: JSON.stringify({ symbol, pattern_type: patternType })
    });
  }

  async backtestStrategy(config: {
    strategy_name: string;
    symbols: string[];
    start_date: string;
    end_date: string;
    initial_capital: number;
    patterns: string[];
    entry_strategy: string;
    exit_strategy: string;
    stop_loss_pct: number;
    take_profit_pct: number;
  }) {
    return this.request<{ strategy_name: string; symbols: string[]; patterns_used: string[]; period: string; initial_capital: number; summary_by_symbol: any; portfolio: any; sample_trades: any[]; timestamp: string }>('/backtest/strategy', {
      method: 'POST',
      body: JSON.stringify(config)
    });
  }

  // Scanner endpoints
  async startScan(symbols: string[], interval: number = 60, autoAlerts: boolean = true) {
    return this.request<any>('/scan/start', {
      method: 'POST',
      body: JSON.stringify({ symbols, interval, auto_alerts: autoAlerts })
    });
  }

  async stopScan() {
    return this.request<any>('/scan/stop', {
      method: 'POST'
    });
  }

  async getScanStatus() {
    return this.request<{ active: boolean; symbols_scanned: string[]; patterns_found: number; last_scan: string }>('/scan/status');
  }

  async getScanConfig() {
    return this.request<{ defaults: { symbols: string[]; interval: number; auto_alerts: boolean }; status: any; timestamp: string }>('/scan/config');
  }

  async updateScanConfig(config: { symbols?: string[]; interval?: number; auto_alerts?: boolean }) {
    return this.request<{ updated: any; defaults: any }>('/scan/config', {
      method: 'POST',
      body: JSON.stringify(config)
    });
  }

  // Alert endpoints
  async getActiveAlerts() {
    return this.request<{ alerts: any[] }>('/get_active_alerts');
  }

  async getMarketScan(type: 'trending' | 'volume' = 'trending') {
    return this.request<any[]>(`/market-scan?type=${type}`);
  }

  async executeFromAlert(payload: {
    symbol: string;
    suggested_action: 'BUY' | 'SELL' | 'CONTINUATION';
    risk_suggestions?: any;
    confidence?: number;
    pattern?: string;
    alert_type?: string;
    quantity?: number;
  }) {
    return this.request<{ trade: any; risk_suggestions?: any }>('/paper-trade/execute-from-alert', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getPaperPortfolio(userId: string) {
    return this.request<any[]>(`/paper-trade/portfolio?user_id=${userId}`);
  }

  async executePaperTrade(trade: {
    symbol: string;
    side: 'buy' | 'sell';
    qty: number;
    price: number;
    user_id: string;
  }) {
    return this.request<any>('/paper-trade/execute', {
      method: 'POST',
      body: JSON.stringify(trade)
    });
  }

  async dismissAlert(alertId: string) {
    return this.request<any>(`/alerts/dismiss/${alertId}`, {
      method: 'POST'
    });
  }

  async handleAlertResponse(data: any) {
    return this.request<any>('/handle_alert_response', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getLatestDetectionId() {
    return this.request<{ latest_detection_id: number; timestamp: string }>('/get_latest_detection_id');
  }

  async getAssetsList() {
    return this.request<any[]>('/assets/list');
  }

  // Optional Twitter health endpoint (mentioned in Flask docs)
  async getTwitterHealth() {
    return this.request<{ twitter_metrics: any; status: string; timestamp: string }>('/sentiment/twitter-health');
  }

  // Feature flags
  async getFeatures() {
    return this.request<any>('/features');
  }

}

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
    // Mock session for compatibility
    return {
      success: true,
      data: { session: null }
    };
  }

  async getUser() {
    // Mock user for compatibility
    return {
      success: true,
      data: { user: null }
    };
  }
}

export const auth = new AuthManager();
