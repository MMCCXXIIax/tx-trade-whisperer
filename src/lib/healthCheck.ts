import { safeFetch } from './api';

export async function testBackendConnection(): Promise<boolean> {
  try {
    const response = await safeFetch<{ status: string; time: string }>('/health');
    return response?.status === 'ok';
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
}

export async function testApiEndpoints() {
  const endpoints = [
    '/api/scan',
    '/api/get_active_alerts', 
    '/api/paper-trades',
    '/api/trading-stats',
    '/health'
  ];

  const results: Record<string, boolean> = {};
  
  for (const endpoint of endpoints) {
    try {
      const response = await safeFetch(endpoint);
      results[endpoint] = response !== null;
      console.log(`✅ ${endpoint}: OK`);
    } catch (error) {
      results[endpoint] = false;
      console.log(`❌ ${endpoint}: Failed`);
    }
  }
  
  return results;
}