import { useState, useEffect } from 'react';

interface CandleData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export function useCandles(symbol: string) {
  const [candleData, setCandleData] = useState<CandleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Temporarily disabled during Flask API integration
    setLoading(false);
    setCandleData([]);
    setError(null);
  }, [symbol]);

  return {
    candleData,
    loading,
    error,
    refetch: () => {
      // Placeholder function
      console.log('useCandles refetch called - temporarily disabled');
    }
  };
}