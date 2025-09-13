# TX Trade Whisperer: Frontend-Backend Connection Guide

This document provides a comprehensive overview of how the TX Trade Whisperer frontend connects to the backend services, including API endpoints, WebSocket communication, and error handling.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [API Client](#api-client)
3. [WebSocket Integration](#websocket-integration)
4. [Error Handling](#error-handling)
5. [Authentication](#authentication)
6. [Key Features Integration](#key-features-integration)
7. [Deployment Considerations](#deployment-considerations)

## Architecture Overview

The TX Trade Whisperer application follows a client-server architecture:

- **Frontend**: React application with TypeScript
- **Backend**: RESTful API server with WebSocket support
- **Communication**: HTTP/HTTPS for API calls, WebSocket for real-time updates

The frontend and backend communicate through two primary channels:
1. **REST API** for data fetching, updates, and actions
2. **WebSocket** for real-time alerts, market updates, and scan results

## API Client

The primary interface for backend communication is the `apiClient` located in `src/lib/apiClient.ts`. This client handles all HTTP requests to the backend API.

### Key Components:

```typescript
// Base configuration
const API_BASE_URL = `${API_BASE}/api`;

// Request method with error handling
async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>>

// Specialized methods for each feature
async getVolumeAnalysis(symbol: string): Promise<ApiResponse<VolumeAnalysisData>>
async getSentimentData(symbol: string): Promise<ApiResponse<SentimentData>>
async getMultiTimeframeAnalysis(symbol: string, timeframes: string[]): Promise<ApiResponse<TimeframeConsensus>>
// ... and many more
```

### Usage Example:

```typescript
// In a component
const fetchData = async () => {
  const response = await apiClient.getVolumeAnalysis('BTC');
  if (response && response.data) {
    setVolumeData(response.data);
  }
};
```

## WebSocket Integration

Real-time updates are handled through WebSockets using Socket.io. The implementation is in `src/lib/socket.ts`.

### Key Components:

```typescript
// Socket service with connection management
class SocketService {
  connect(): Socket
  disconnect(): void
  onConnectionStateChange(callback: (state: ConnectionState) => void): () => void
  // Event handlers
  on(event: string, callback: (data: any) => void): void
  off(event: string, callback?: (data: any) => void): void
}

// Socket event handlers in apiClient.ts
export const socketHandlers = {
  onNewAlert: (callback: (alert: Alert) => void) => { ... },
  onMarketUpdate: (callback: (markets: Record<string, { price: number, change_24h: number }>) => void) => { ... },
  onScanUpdate: (callback: (scan: any) => void) => { ... },
  onConnectionStateChange: (callback: (state: string) => void) => { ... }
};
```

### Usage Example:

```typescript
// In a component
useEffect(() => {
  // Subscribe to new alerts
  const unsubscribe = socketHandlers.onNewAlert((alert) => {
    setAlerts(prev => [alert, ...prev].slice(0, 10));
    if (soundEnabled && alertAudioRef.current) {
      alertAudioRef.current.play();
    }
  });
  
  // Cleanup on unmount
  return unsubscribe;
}, [soundEnabled]);
```

## Error Handling

Robust error handling is implemented in `src/lib/errorHandling.ts` to manage API failures, network issues, and retry logic.

### Key Components:

```typescript
// Error categorization
export const categorizeError = (error: any, statusCode?: number): ErrorResponse => { ... }

// User-friendly error display
export const handleError = (error: any, statusCode?: number) => { ... }

// Fetch with retry logic
export const fetchWithRetry = async <T>(
  url: string, 
  options: RequestInit = {}, 
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> => { ... }

// Safe API call wrapper
export const safeApiCall = async <T>(
  apiCall: () => Promise<T>,
  errorMessage = 'Operation failed'
): Promise<T | null> => { ... }
```

### Usage Example:

```typescript
// In a component
const fetchData = async () => {
  setIsLoading(true);
  const data = await safeApiCall(
    () => apiClient.getVolumeAnalysis(symbol),
    'Failed to fetch volume data'
  );
  if (data) {
    setVolumeData(data);
  }
  setIsLoading(false);
};
```

## Authentication

Authentication is handled through the `auth` object in `src/lib/apiClient.ts`.

### Key Components:

```typescript
class AuthManager {
  onAuthStateChange(callback: (event: string, session: any) => void): { data: { subscription: { unsubscribe: () => void } } }
  async getSession(): Promise<ApiResponse<{ session: { user: { id: string } } | null }>>
  async getUser(): Promise<ApiResponse<{ user: { id: string; email?: string } | null }>>
}
```

### Usage Example:

```typescript
// In a component
useEffect(() => {
  const checkAuth = async () => {
    const session = await auth.getSession();
    if (session?.data?.session) {
      setIsAuthenticated(true);
      setUser(session.data.session.user);
    } else {
      setIsAuthenticated(false);
    }
  };
  
  checkAuth();
}, []);
```

## Key Features Integration

### 1. Volume Analysis
- Component: `VolumeAnalysis.tsx`
- API Endpoint: `/volume-analysis/{symbol}`
- Method: `apiClient.getVolumeAnalysis(symbol)`
- Fallback: Pattern detection data with volume information

### 2. Sentiment Analysis
- Component: `SentimentAnalysis.tsx`
- API Endpoint: `/sentiment/{symbol}`
- Method: `apiClient.getSentimentData(symbol)`
- Displays: Social media sentiment, news impact, and overall market sentiment

### 3. Multi-timeframe Analysis
- Component: `TimeframeAnalysis.tsx`
- API Endpoint: `/analyze/multi-timeframe/{symbol}?timeframes={timeframes}`
- Method: `apiClient.getMultiTimeframeAnalysis(symbol, timeframes)`
- Fallback: Individual timeframe analysis with consensus calculation

### 4. Pattern Registry
- Component: `PatternRegistry.tsx`
- API Endpoint: `/patterns`
- Method: `apiClient.getPatternRegistry()`
- Fallback: Extract patterns from scan results

### 5. Performance Tracking
- Component: `PerformanceTracking.tsx`
- API Endpoint: `/analytics/performance`
- Method: `apiClient.getPerformanceMetrics()`
- Fallback: Calculate metrics from portfolio data

### 6. Paper Trading
- Component: `PaperTrading.tsx`
- API Endpoints: 
  - `/paper/portfolio` (GET)
  - `/paper/trade` (POST)
- Methods: 
  - `apiClient.getPaperPortfolio()`
  - `apiClient.executePaperTrade(trade)`

### 7. Real-time Alerts
- Component: `TXDashboard.tsx`
- WebSocket Event: `new_alert`
- Handler: `socketHandlers.onNewAlert(callback)`

## Deployment Considerations

### API Base URL Configuration

The API base URL is configured in `src/lib/api.ts`:

```typescript
export const API_BASE = getApiBase();

// Environment-based API configuration
const getApiBase = () => {
  // Use environment variable if available, fallback to production URL
  const envApiBase = import.meta.env.VITE_API_BASE;
  const defaultApiBase = "https://tx-predictive-intelligence.onrender.com";
  
  // Validate URL format for security
  const apiBase = envApiBase || defaultApiBase;
  
  try {
    new URL(apiBase);
    return apiBase;
  } catch {
    console.warn("Invalid API_BASE URL, using default");
    return defaultApiBase;
  }
};
```

For production deployment, set the `VITE_API_BASE` environment variable to your production API URL.

### WebSocket Connection

WebSocket connection is established using the same base URL as the API:

```typescript
this.socket = io(`${API_BASE}`, {
  reconnectionDelayMax: 10000,
  transports: ['websocket', 'polling']
});
```

### CORS Configuration

Ensure your backend has proper CORS configuration to allow requests from your frontend domain:

```javascript
// Backend CORS configuration example
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));
```

### Authentication Headers

API requests that require authentication should include the appropriate headers:

```typescript
const response = await fetch(`${API_BASE_URL}${endpoint}`, {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  },
  ...options,
});
```

## Backend API Endpoints

Here's a comprehensive list of all the backend API endpoints used by the frontend:

| Endpoint | Method | Description | Frontend Method |
|----------|--------|-------------|-----------------|
| `/api/health` | GET | Health check | `apiClient.healthCheck()` |
| `/api/auth/session` | POST | Get current session | `apiClient.getSession()` |
| `/api/auth/user` | GET | Get current user | `apiClient.getUser()` |
| `/api/profiles/:id` | GET | Get user profile | `apiClient.getProfile(id)` |
| `/api/profiles` | POST | Create user profile | `apiClient.createProfile(data)` |
| `/api/alerts/recent` | GET | Get recent alerts | `apiClient.getRecentAlerts(limit)` |
| `/api/backtest/run` | POST | Run backtest | `apiClient.runBacktest(params)` |
| `/api/detect/:symbol` | GET | Detect patterns | `apiClient.detectPatterns(symbol, timeframe)` |
| `/api/scan` | GET | Get market scan | `apiClient.getMarketScan()` |
| `/api/assets/list` | GET | Get assets list | `apiClient.getAssetsList()` |
| `/api/signals/entry-exit` | GET | Get trading signals | `apiClient.getTradingSignals()` |
| `/api/scan/status` | GET | Get scanner status | `apiClient.getScannerStatus()` |
| `/api/scan/start` | POST | Start scanner | `apiClient.startScanner()` |
| `/api/scan/stop` | POST | Stop scanner | `apiClient.stopScanner()` |
| `/api/analytics/patterns` | GET | Get pattern statistics | `apiClient.getPatternStatistics()` |
| `/api/analytics/performance` | GET | Get performance metrics | `apiClient.getPerformanceMetrics()` |
| `/api/strategy/list` | GET | Get strategy templates | `apiClient.getStrategyTemplates()` |
| `/api/strategy/create` | POST | Create strategy | `apiClient.createStrategy(strategy)` |
| `/api/paper/portfolio` | GET | Get paper portfolio | `apiClient.getPaperPortfolio()` |
| `/api/paper/trade` | POST | Execute paper trade | `apiClient.executePaperTrade(trade)` |
| `/api/paper/history` | GET | Get paper trade history | `apiClient.getPaperTradeHistory(limit)` |
| `/api/sentiment/:symbol` | GET | Get sentiment data | `apiClient.getSentimentData(symbol)` |
| `/api/patterns` | GET | Get pattern registry | `apiClient.getPatternRegistry()` |
| `/api/volume-analysis/:symbol` | GET | Get volume analysis | `apiClient.getVolumeAnalysis(symbol)` |
| `/api/timeframes` | GET | Get timeframes | `apiClient.getTimeframes()` |
| `/api/analyze/multi-timeframe/:symbol` | GET | Get multi-timeframe analysis | `apiClient.getMultiTimeframeAnalysis(symbol, timeframes)` |

## WebSocket Events

The frontend listens for these WebSocket events:

| Event | Description | Handler |
|-------|-------------|---------|
| `new_alert` | New alert notification | `socketHandlers.onNewAlert(callback)` |
| `market_update` | Real-time market data update | `socketHandlers.onMarketUpdate(callback)` |
| `scan_update` | Market scan results update | `socketHandlers.onScanUpdate(callback)` |
| `connect` | Socket connection established | `socketService.onConnectionStateChange(callback)` |
| `disconnect` | Socket connection lost | `socketService.onConnectionStateChange(callback)` |
| `reconnect` | Socket reconnection attempt | `socketService.onConnectionStateChange(callback)` |

## Conclusion

The TX Trade Whisperer frontend is fully integrated with the backend through a combination of REST API calls and WebSocket connections. The architecture provides:

1. **Type Safety**: TypeScript interfaces for all API responses
2. **Error Resilience**: Comprehensive error handling with retry logic
3. **Real-time Updates**: WebSocket integration for live data
4. **Fallback Mechanisms**: Alternative data sources when primary endpoints fail
5. **Consistent Interface**: Unified API client for all backend communication

This integration ensures a robust, responsive user experience with real-time market data and analysis.