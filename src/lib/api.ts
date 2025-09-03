// Centralized API configuration and utilities
import { toast } from "@/hooks/use-toast";

export const API_BASE = "https://tx-predictive-intelligence.onrender.com/api";

export async function safeFetch<T>(
  path: string,
  options: RequestInit = {},
  retries = 2
): Promise<T | null> {
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${API_BASE}${cleanPath}`;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API call failed (attempt ${attempt + 1}):`, error);
      
      if (attempt === retries) {
        toast({
          title: "Connection Error",
          description: "Unable to connect to server. Please try again.",
          variant: "destructive"
        });
        return null;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  
  return null;
}