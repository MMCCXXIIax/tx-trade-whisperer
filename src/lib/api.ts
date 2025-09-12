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

export async function safeFetch<T>(
  path: string,
  options: RequestInit = {},
  retries = 2
): Promise<T | null> {
  // Handle paths that already start with /api/ or add /api/ prefix
  let cleanPath: string;
  if (path.startsWith('/api/')) {
    cleanPath = path;
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
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP Error ${response.status}: ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
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
