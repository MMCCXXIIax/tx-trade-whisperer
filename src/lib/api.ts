// Centralized API configuration and utilities
import { toast } from "@/hooks/use-toast";
import { 
  mockAlerts, 
  mockMarketData, 
  mockPatterns, 
  mockSentimentData, 
  mockPaperTrades, 
  mockBacktestResult, 
  mockDetectionLogs,
  simulateApiDelay,
  createMockResponse
} from './mockData';

// Environment-based API configuration for security
const getApiBase = () => {
  // Development mode: try local backend first, then production
  const isDevelopment = import.meta.env.DEV;
  const envApiBase = import.meta.env.VITE_API_BASE;
  
  // Default URLs based on environment
  const localApiBase = "http://localhost:8080";
  const productionApiBase = "https://tx-predictive-intelligence.onrender.com";
  
  // Priority: env variable > local (in dev) > production
  let apiBase: string;
  if (envApiBase) {
    apiBase = envApiBase;
  } else if (isDevelopment) {
    apiBase = localApiBase;
  } else {
    apiBase = productionApiBase;
  }
  
  // Validate URL format for security
  try {
    new URL(apiBase);
    console.log(`🔗 API Base URL: ${apiBase}`);
    return apiBase;
  } catch {
    console.warn(`⚠️  Invalid API_BASE URL: ${apiBase}, using production fallback`);
    return productionApiBase;
  }
};

export const API_BASE = getApiBase();
export const IS_DEVELOPMENT = import.meta.env.DEV;
export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || false;

// Smart mock data fallback based on endpoint
async function getMockDataForEndpoint<T>(path: string): Promise<T | null> {
  await simulateApiDelay(300); // Simulate network delay
  
  // Pattern detection endpoints
  if (path.includes('/detect') || path.includes('/patterns')) {
    return createMockResponse(mockPatterns) as T;
  }
  
  // Alert endpoints
  if (path.includes('/alerts') || path.includes('get_active_alerts')) {
    return createMockResponse(mockAlerts) as T;
  }
  
  // Market data endpoints
  if (path.includes('/market') || path.includes('/scan')) {
    return createMockResponse(mockMarketData) as T;
  }
  
  // Sentiment endpoints
  if (path.includes('/sentiment')) {
    return createMockResponse(mockSentimentData) as T;
  }
  
  // Paper trading endpoints
  if (path.includes('/paper') || path.includes('portfolio')) {
    return createMockResponse(mockPaperTrades) as T;
  }
  
  // Backtest endpoints
  if (path.includes('/backtest')) {
    return createMockResponse(mockBacktestResult) as T;
  }
  
  // Detection logs
  if (path.includes('/logs') || path.includes('/detection')) {
    return createMockResponse(mockDetectionLogs) as T;
  }
  
  // Health check
  if (path.includes('/health')) {
    return createMockResponse({ 
      version: '1.0.0', 
      timestamp: new Date().toISOString(),
      status: 'healthy',
      message: 'Mock API is running'
    }) as T;
  }
  
  // Default empty response
  return createMockResponse([]) as T;
}

// Flask API response interface
interface FlaskResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  alerts?: any[]; // For /get_active_alerts compatibility
}

export async function safeFetch<T>(
  path: string,
  options: RequestInit = {},
  retries = 2,
  useMockFallback: boolean = true
): Promise<T | null> {
  
  // Use mock data immediately if flag is set
  if (USE_MOCK_DATA) {
    console.log(`🎭 Using mock data for: ${path}`);
    return await getMockDataForEndpoint<T>(path);
  }
  // Handle paths that already start with /api/ or add /api/ prefix
  // Also handle special endpoints like /health
  let cleanPath: string;
  if (path.startsWith('/api/')) {
    cleanPath = path;
  } else if (path.startsWith('/health')) {
    cleanPath = path; // Health check endpoint
  } else if (path.startsWith('/')) {
    cleanPath = `/api${path}`;
  } else {
    cleanPath = `/api/${path}`;
  }
  const url = `${API_BASE}${cleanPath}`;
  
  console.log(`Making API call to: ${url}`); // Debug log
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // Add origin header to help with CORS
          'Origin': window.location.origin,
          ...options.headers,
        },
        mode: 'cors', // Explicitly set CORS mode
        credentials: 'omit', // Don't send cookies for API calls
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP Error ${response.status}: ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const jsonResponse = await response.json() as FlaskResponse<T>;
      
      // Handle Flask response format: { success, data?, error?, alerts? }
      if (typeof jsonResponse.success === 'boolean') {
        if (!jsonResponse.success) {
          console.error(`API Error: ${jsonResponse.error}`);
          toast({
            title: "API Error",
            description: jsonResponse.error || "Unknown server error",
            variant: "destructive"
          });
          return null;
        }
        
        // Return data field or fallback to alerts field for compatibility
        return (jsonResponse.data || jsonResponse.alerts || jsonResponse) as T;
      }
      
      // Legacy format compatibility - return as-is
      return jsonResponse as T;
    } catch (error) {
      console.error(`API call failed (attempt ${attempt + 1}) to ${url}:`, error);
      
      if (attempt === retries) {
        // Show more specific error message based on error type
        const isNetworkError = error instanceof TypeError && error.message.includes('fetch');
        const isCorsError = error instanceof TypeError && error.message.includes('Failed to fetch');
        
        let errorMessage = "Unable to connect to server. Please try again.";
        let errorTitle = "Connection Error";
        
        if (isCorsError) {
          errorTitle = "CORS Error";
          errorMessage = `Backend not allowing requests from ${window.location.origin}. The backend is configured for a different domain.`;
        } else if (isNetworkError) {
          errorMessage = "Backend server appears to be down or unreachable. Please check if your server is running.";
        }
        
        console.error(`🚫 API Error Details:`, {
          url,
          error: error.message,
          origin: window.location.origin,
          apiBase: API_BASE
        });
        
        // Try mock data as fallback in development or if explicitly requested
        if (useMockFallback && (IS_DEVELOPMENT || USE_MOCK_DATA)) {
          console.log(`🔄 Falling back to mock data for: ${path}`);
          toast({
            title: "Using Mock Data",
            description: "Backend unavailable, using mock data for demonstration",
            variant: "default"
          });
          return await getMockDataForEndpoint<T>(path);
        }
        
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive"
        });
        return null;
      }
      
      // Wait before retry with exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }
  
  return null;
}
