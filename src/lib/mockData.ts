// Mock data for development and backend fallback scenarios
export const mockAlerts = [
  {
    id: 'alert_1',
    symbol: 'BTC',
    pattern: 'Bullish Engulfing',
    confidence: 89,
    price: '95,432',
    time: new Date().toLocaleTimeString(),
    explanation: 'Strong bullish signal detected with volume confirmation',
    action: 'Consider entering long position'
  },
  {
    id: 'alert_2',
    symbol: 'ETH',
    pattern: 'Morning Star',
    confidence: 76,
    price: '3,240',
    time: new Date(Date.now() - 300000).toLocaleTimeString(),
    explanation: 'Three-candle reversal pattern showing potential uptrend',
    action: 'Monitor for confirmation'
  },
  {
    id: 'alert_3',
    symbol: 'SOL',
    pattern: 'Hammer',
    confidence: 82,
    price: '185',
    time: new Date(Date.now() - 600000).toLocaleTimeString(),
    explanation: 'Potential reversal at support level',
    action: 'Watch for volume increase'
  }
];

export const mockMarketData = [
  { symbol: 'bitcoin', price: 95432, change: 2.3, status: 'active' },
  { symbol: 'ethereum', price: 3240, change: 1.8, status: 'active' },
  { symbol: 'solana', price: 185, change: -0.5, status: 'active' },
  { symbol: 'cardano', price: 0.85, change: 0.8, status: 'active' },
  { symbol: 'polygon', price: 0.92, change: -1.2, status: 'active' }
];

export const mockPatterns = [
  {
    id: 'pat_1',
    symbol: 'BTC',
    pattern: 'Bullish Engulfing',
    confidence: 89,
    price: 95432,
    timestamp: new Date().toISOString(),
    verified: true
  },
  {
    id: 'pat_2',
    symbol: 'ETH',
    pattern: 'Morning Star',
    confidence: 76,
    price: 3240,
    timestamp: new Date(Date.now() - 300000).toISOString(),
    verified: true
  },
  {
    id: 'pat_3',
    symbol: 'SOL',
    pattern: 'Evening Star',
    confidence: 84,
    price: 185,
    timestamp: new Date(Date.now() - 600000).toISOString(),
    verified: false
  },
  {
    id: 'pat_4',
    symbol: 'ADA',
    pattern: 'Hammer',
    confidence: 72,
    price: 0.85,
    timestamp: new Date(Date.now() - 900000).toISOString(),
    verified: true
  }
];

export const mockSentimentData = {
  symbol: 'BTC',
  overall_sentiment: 'bullish',
  confidence: 78,
  sources: {
    twitter: { sentiment: 72, volume: 1250 },
    reddit: { sentiment: 68, volume: 340 },
    news: { sentiment: 85, volume: 28 }
  },
  trending_score: 84,
  key_phrases: ['bullish momentum', 'institutional adoption', 'technical breakout', 'support level', 'volume surge']
};

export const mockPaperTrades = [
  {
    id: 'trade_1',
    symbol: 'BTC',
    side: 'buy' as const,
    qty: 0.5,
    price: 92000,
    opened_at: '2024-01-15T10:30:00Z',
    status: 'open' as const,
    pnl: 1500
  },
  {
    id: 'trade_2',
    symbol: 'ETH',
    side: 'buy' as const,
    qty: 5,
    price: 3100,
    opened_at: '2024-01-14T14:20:00Z',
    status: 'open' as const,
    pnl: 700
  },
  {
    id: 'trade_3',
    symbol: 'SOL',
    side: 'sell' as const,
    qty: 100,
    price: 190,
    opened_at: '2024-01-10T09:15:00Z',
    closed_at: '2024-01-12T16:45:00Z',
    status: 'closed' as const,
    pnl: -500
  }
];

export const mockBacktestResult = {
  totalTrades: 45,
  winRate: 68.9,
  profitFactor: 2.34,
  sharpeRatio: 1.87,
  maxDrawdown: -12.5,
  totalReturn: 34.7,
  avgReturn: 2.3
};

export const mockDetectionLogs = Array.from({ length: 20 }, (_, i) => ({
  id: `det_${i}`,
  symbol: ['BTC', 'ETH', 'SOL', 'ADA'][Math.floor(Math.random() * 4)],
  pattern: ['Bullish Engulfing', 'Morning Star', 'Hammer', 'Doji', 'Evening Star'][Math.floor(Math.random() * 5)],
  confidence: Math.floor(Math.random() * 30) + 70,
  price: Math.random() * 100000 + 30000,
  timestamp: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
  outcome: Math.random() > 0.3 ? (Math.random() > 0.5 ? 'success' : 'failed') : undefined,
  verified: Math.random() > 0.3
}));

export const mockPortfolioPositions = [
  { asset: 'BTC', quantity: 0.5, avg_price: 92000, current_price: 95000, pnl: 1500, pnl_pct: 3.26, allocation: 45 },
  { asset: 'ETH', quantity: 5, avg_price: 3100, current_price: 3240, pnl: 700, pnl_pct: 4.52, allocation: 30 },
  { asset: 'SOL', quantity: 50, avg_price: 180, current_price: 185, pnl: 250, pnl_pct: 2.78, allocation: 25 }
];

// Function to simulate API delay for more realistic mock behavior
export const simulateApiDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Mock API response wrapper
export const createMockResponse = <T>(data: T, success: boolean = true) => ({
  success,
  data,
  timestamp: new Date().toISOString()
});