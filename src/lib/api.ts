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
    const url = new URL(apiBase);
    // Ensure no trailing slash to avoid double slashes in fetch/io URLs
    const clean = url.origin + (url.pathname.replace(/\/$/, ''));
    console.log("Using API base URL:", clean);
    return clean;
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
        credentials: 'omit', // Avoid cookies for cross-origin Render
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP Error ${response.status}: ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API call failed (attempt ${attempt + 1}) to ${url}:`, error);
      
      if (attempt === retries) {
        // Show more specific error message based on error type
        const isNetworkError = error instanceof TypeError && error.message.includes('fetch');
        const isCorsError = error instanceof TypeError && error.message.includes('CORS');
        
        let errorMessage = "Unable to connect to server. Please try again.";
        if (isNetworkError) {
          errorMessage = "Backend server appears to be down. Please check if your server is running.";
        } else if (isCorsError) {
          errorMessage = "Cross-origin request blocked. Please check CORS configuration on the server.";
        }
        
        toast({
          title: "Connection Error",
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
