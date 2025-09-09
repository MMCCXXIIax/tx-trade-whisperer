// TX API Client - Replaces Supabase functionality
import { apiClient, auth } from '@/lib/apiClient';

// Backwards compatibility object that mimics Supabase client structure
export const supabase = {
  // Auth methods
  auth: {
    getSession: () => auth.getSession(),
    getUser: () => auth.getUser(),
    onAuthStateChange: (callback: (event: string, session: any) => void) => auth.onAuthStateChange(callback),
    signInWithPassword: async (credentials: { email: string; password: string }) => {
      return { data: null, error: null };
    },
    signUp: async (credentials: { email: string; password: string }) => {
      return { data: null, error: null };
    },
    signOut: async () => {
      return { error: null };
    }
  },
  
  // Database methods - converted to API calls
  from: (table: string) => ({
    select: (columns = '*') => ({
      eq: (column: string, value: any) => ({
        maybeSingle: async () => {
          if (table === 'profiles') {
            return apiClient.getProfile(value);
          }
          return { data: null, error: null };
        },
        limit: async (count: number) => {
          if (table === 'profiles') {
            const result = await apiClient.getProfile(value);
            return { data: result.data ? [result.data] : [], error: result.error };
          }
          return { data: [], error: null };
        }
      }),
      limit: async (count: number) => {
        if (table === 'detections') {
          return apiClient.getDetections();
        }
        return { data: [], error: null };
      }
    }),
    insert: (values: any) => ({
      returning: async () => {
        if (table === 'profiles') {
          return apiClient.createProfile(values);
        }
        return { data: null, error: 'Not implemented' };
      }
    })
  })
};