/**
 * Error Handling and Retry Utilities
 * Implements robust error handling and retry logic for API calls
 */

import { toast } from "@/hooks/use-toast";

// Error types for better categorization
export enum ErrorType {
  NETWORK = 'network',
  SERVER = 'server',
  AUTH = 'authentication',
  VALIDATION = 'validation',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown'
}

// Error response interface
export interface ErrorResponse {
  type: ErrorType;
  message: string;
  code?: number;
  details?: any;
}

/**
 * Categorize error based on type and status code
 */
export const categorizeError = (error: any, statusCode?: number): ErrorResponse => {
  // Network errors (no response from server)
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      type: ErrorType.NETWORK,
      message: 'Unable to connect to server. Please check your internet connection.',
      details: error.message
    };
  }

  // Timeout errors
  if (error.name === 'AbortError' || error.message?.includes('timeout')) {
    return {
      type: ErrorType.TIMEOUT,
      message: 'Request timed out. Server may be experiencing high load.',
      details: error.message
    };
  }

  // Server errors based on status code
  if (statusCode) {
    if (statusCode >= 500) {
      return {
        type: ErrorType.SERVER,
        message: 'Server error occurred. Our team has been notified.',
        code: statusCode,
        details: error.message
      };
    }

    if (statusCode === 401 || statusCode === 403) {
      return {
        type: ErrorType.AUTH,
        message: statusCode === 401 ? 'Authentication required.' : 'You do not have permission to perform this action.',
        code: statusCode
      };
    }

    if (statusCode === 422 || statusCode === 400) {
      return {
        type: ErrorType.VALIDATION,
        message: 'Invalid data provided.',
        code: statusCode,
        details: error.message
      };
    }
  }

  // Default unknown error
  return {
    type: ErrorType.UNKNOWN,
    message: error.message || 'An unexpected error occurred.',
    details: error
  };
};

/**
 * Display appropriate error toast based on error type
 */
export const handleError = (error: any, statusCode?: number) => {
  const errorInfo = categorizeError(error, statusCode);
  
  // Log error for debugging
  console.error('API Error:', errorInfo);
  
  // Show appropriate toast based on error type
  switch (errorInfo.type) {
    case ErrorType.NETWORK:
      toast({
        title: "Connection Error",
        description: errorInfo.message,
        variant: "destructive"
      });
      break;
    
    case ErrorType.SERVER:
      toast({
        title: "Server Error",
        description: errorInfo.message,
        variant: "destructive"
      });
      break;
    
    case ErrorType.AUTH:
      toast({
        title: "Authentication Error",
        description: errorInfo.message,
        variant: "destructive"
      });
      break;
    
    case ErrorType.VALIDATION:
      toast({
        title: "Validation Error",
        description: errorInfo.message,
        variant: "destructive"
      });
      break;
    
    case ErrorType.TIMEOUT:
      toast({
        title: "Request Timeout",
        description: errorInfo.message,
        variant: "destructive"
      });
      break;
    
    default:
      toast({
        title: "Error",
        description: errorInfo.message,
        variant: "destructive"
      });
  }
  
  return errorInfo;
};

/**
 * Fetch with retry logic for robust API calls
 * Implements exponential backoff for retries
 */
export const fetchWithRetry = async <T>(
  url: string, 
  options: RequestInit = {}, 
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP Error ${response.status}: ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API call failed (attempt ${attempt + 1}/${maxRetries}):`, error);
      lastError = error;
      
      // Don't wait on the last attempt
      if (attempt < maxRetries - 1) {
        // Exponential backoff with jitter
        const delay = initialDelay * Math.pow(2, attempt) * (0.5 + Math.random() * 0.5);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // If we've exhausted all retries, handle the error and throw
  handleError(lastError);
  throw lastError;
};

/**
 * Wrapper for API calls with standardized error handling
 */
export const safeApiCall = async <T>(
  apiCall: () => Promise<T>,
  errorMessage = 'Operation failed'
): Promise<T | null> => {
  try {
    return await apiCall();
  } catch (error) {
    handleError(error);
    console.error(errorMessage, error);
    return null;
  }
};