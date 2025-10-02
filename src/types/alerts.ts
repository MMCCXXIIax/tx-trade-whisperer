// Unified alert types matching Flask backend schema

export interface RiskSuggestions {
  entry: number;
  stop_loss: number;
  take_profit: number;
  rr: number;
}

export interface ConfidenceFactors {
  slope_diff?: number;
  sma_distance_pct?: number;
  volume_above_avg?: boolean;
  [key: string]: any;
}

export interface AlertMetadata {
  explanation: string;
  suggested_action: 'BUY' | 'SELL' | 'CONTINUATION';
  timeframe: string;
  timestamp_eat: string;
  confidence_pct: number;
  confidence_factors?: ConfidenceFactors;
  risk_suggestions?: RiskSuggestions;
  interval?: string;
  period?: string;
}

// Backend alert schema (from Flask /api/get_active_alerts)
export interface BackendAlert {
  id: number;
  symbol: string;
  alert_type: string;
  message: string;
  confidence: number;
  confidence_pct: number;
  timestamp: string;
  is_active: boolean;
  metadata: AlertMetadata;
}

// WebSocket pattern_alert event
export interface PatternAlert {
  symbol: string;
  alert_type: string;
  confidence: number;
  confidence_pct: number;
  price: number;
  timestamp: string;
  source: string;
  explanation: string;
  interval: string;
  period: string;
}

// WebSocket scan_update event
export interface PatternDetectionItem {
  pattern_type: string;
  confidence: number;
  confidence_pct: number;
  price: number;
  timestamp: string;
  metadata?: any;
}

export interface ScanUpdate {
  symbol: string;
  intraday_patterns: PatternDetectionItem[];
  context_patterns: PatternDetectionItem[];
  timestamp: string;
}

// Paper trading execution payload
export interface ExecuteFromAlertPayload {
  symbol: string;
  suggested_action: 'BUY' | 'SELL';
  risk_suggestions?: RiskSuggestions;
  confidence?: number;
  pattern?: string;
  alert_type?: string;
  quantity?: number;
}

export interface ExecuteFromAlertResponse {
  success: boolean;
  data?: {
    trade: any;
    risk_suggestions?: RiskSuggestions;
  };
  error?: string;
}

// Feature flags from /api/features
export interface FeatureFlags {
  paper_trading_enabled: boolean;
  sentiment_enabled: boolean;
  live_scanning: boolean;
  [key: string]: any;
}
