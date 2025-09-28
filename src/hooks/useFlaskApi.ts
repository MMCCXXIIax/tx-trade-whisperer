// Comprehensive React hook for Flask API integration
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';

// Market data hook
export function useMarketData(symbol: string, refreshInterval = 30000) {
  const [marketData, setMarketData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketData = useCallback(async () => {
    if (!symbol) return;
    
    try {
      setError(null);
      const response = await apiClient.getMarket(symbol);
      
      if (response.success && response.data) {
        setMarketData(response.data);
      } else {
        setError(response.error || 'Failed to fetch market data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchMarketData();
    
    if (refreshInterval > 0) {
      const interval = setInterval(fetchMarketData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchMarketData, refreshInterval]);

  return { marketData, loading, error, refetch: fetchMarketData };
}

// Candlestick data hook
export function useCandlestickData(symbol: string, period = '1d', interval = '1m') {
  const [candleData, setCandleData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCandleData = useCallback(async () => {
    if (!symbol) return;
    
    try {
      setError(null);
      const response = await apiClient.getCandles(symbol, period, interval);
      
      if (response.success && response.data) {
        setCandleData(response.data);
      } else {
        setError(response.error || 'Failed to fetch candle data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, [symbol, period, interval]);

  useEffect(() => {
    fetchCandleData();
  }, [fetchCandleData]);

  return { candleData, loading, error, refetch: fetchCandleData };
}

// Enhanced pattern detection hook
export function usePatternDetection(symbol: string) {
  const [patterns, setPatterns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const detectPatterns = useCallback(async () => {
    if (!symbol) return;
    
    try {
      setError(null);
      const response = await apiClient.detectEnhanced(symbol);
      
      if (response.success && response.data) {
        setPatterns(Array.isArray(response.data) ? response.data : []);
      } else {
        setError(response.error || 'Failed to detect patterns');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    detectPatterns();
  }, [detectPatterns]);

  return { patterns, loading, error, refetch: detectPatterns };
}

// Sentiment analysis hook
export function useSentimentData(symbol: string, refreshInterval = 60000) {
  const [sentiment, setSentiment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSentiment = useCallback(async () => {
    if (!symbol) return;
    
    try {
      setError(null);
      const response = await apiClient.getSentiment(symbol);
      
      if (response.success && response.data) {
        setSentiment(response.data);
      } else {
        setError(response.error || 'Failed to fetch sentiment');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchSentiment();
    
    if (refreshInterval > 0) {
      const interval = setInterval(fetchSentiment, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchSentiment, refreshInterval]);

  return { sentiment, loading, error, refetch: fetchSentiment };
}

// Entry/Exit signals hook
export function useEntryExitSignals(symbol?: string, timeframe = '1d') {
  const [signals, setSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSignals = useCallback(async () => {
    try {
      setError(null);
      const response = await apiClient.getSignalsEntryExit(symbol, timeframe);
      
      if (response.success && response.data) {
        setSignals(response.data.signals || []);
      } else {
        setError(response.error || 'Failed to fetch signals');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, [symbol, timeframe]);

  useEffect(() => {
    fetchSignals();
  }, [fetchSignals]);

  return { signals, loading, error, refetch: fetchSignals };
}

// Scanner control hook
export function useScanner() {
  const [scanStatus, setScanStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startScan = useCallback(async (symbols: string[], interval = 60, autoAlerts = true) => {
    try {
      setError(null);
      setLoading(true);
      const response = await apiClient.startScan(symbols, interval, autoAlerts);
      
      if (response.success) {
        await fetchStatus(); // Update status after starting
      } else {
        setError(response.error || 'Failed to start scanner');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  const stopScan = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await apiClient.stopScan();
      
      if (response.success) {
        await fetchStatus(); // Update status after stopping
      } else {
        setError(response.error || 'Failed to stop scanner');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      setError(null);
      const response = await apiClient.getScanStatus();
      
      if (response.success && response.data) {
        setScanStatus(response.data);
      } else {
        setError(response.error || 'Failed to fetch scanner status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    
    // Poll status every 10 seconds
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return {
    scanStatus,
    loading,
    error,
    startScan,
    stopScan,
    refreshStatus: fetchStatus
  };
}

// System health hook
export function useSystemHealth() {
  const [health, setHealth] = useState<any>(null);
  const [coverage, setCoverage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      setError(null);
      const [healthResponse, coverageResponse] = await Promise.all([
        apiClient.getHealth(),
        apiClient.getCoverage()
      ]);
      
      if (healthResponse.success) {
        setHealth(healthResponse.data);
      }
      
      if (coverageResponse.success) {
        setCoverage(coverageResponse.data);
      }
      
      if (!healthResponse.success && !coverageResponse.success) {
        setError('Failed to fetch system information');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    
    // Check health every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  return { health, coverage, loading, error, refetch: fetchHealth };
}

// Backtesting hook
export function useBacktest() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runBacktest = useCallback(async (config: {
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
  }) => {
    try {
      setError(null);
      setLoading(true);
      const response = await apiClient.backtestStrategy(config);
      
      if (response.success && response.data) {
        setResults(response.data);
      } else {
        setError(response.error || 'Backtest failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, runBacktest };
}