// Centralized API configuration and utilities
import { toast } from "@/hooks/use-toast";

// Environment-based API configuration for security
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

export const API_BASE = getApiBase();

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
  retries = 2
): Promise<T | null> {
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
        toast({
          title: "Connection Error",
          description: isNetworkError 
            ? "Backend server appears to be down. Please check if your server is running."
            : "Unable to connect to server. Please try again.",
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
