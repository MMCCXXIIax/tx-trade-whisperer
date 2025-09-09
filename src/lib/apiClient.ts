// API client to replace Supabase functionality
const API_BASE_URL = "https://tx-predictive-intelligence.onrender.com";

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Auth methods
  async getSession() {
    return this.request<{ session: { user: { id: string } } | null }>('/auth/session', {
      method: 'POST'
    });
  }

  // Profile methods
  async getProfile(id: string) {
    return this.request<any>(`/profiles/${id}`);
  }

  async createProfile(profileData: any) {
    return this.request<any>('/profiles', {
      method: 'POST',
      body: JSON.stringify(profileData)
    });
  }

  // Detection methods
  async getDetections() {
    return this.request<any[]>('/detections');
  }

  // Health check
  async healthCheck() {
    return this.request<{ status: string; timestamp: string }>('/health');
  }
}

export const apiClient = new ApiClient();

// Mock auth state management for migration
class AuthManager {
  private listeners: Array<(event: string, session: any) => void> = [];

  onAuthStateChange(callback: (event: string, session: any) => void) {
    this.listeners.push(callback);
    return {
      subscription: {
        unsubscribe: () => {
          const index = this.listeners.indexOf(callback);
          if (index > -1) {
            this.listeners.splice(index, 1);
          }
        }
      }
    };
  }

  async getSession() {
    return apiClient.getSession();
  }
}

export const auth = new AuthManager();
