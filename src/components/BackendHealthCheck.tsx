import { useEffect, useState } from 'react';
import { safeFetch } from '@/lib/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface HealthStatus {
  status: string;
  timestamp: string;
}

export function BackendHealthCheck() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await safeFetch<{ status: string; timestamp: string }>('/health');
      if (result) {
        setHealth(result);
        setError(null);
      } else {
        setError('Failed to connect to backend');
      }
    } catch (err) {
      console.error('Health check error:', err);
      setError('Error connecting to backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {loading ? (
        <Alert className="bg-gray-800 text-white border-gray-700">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <AlertTitle>Checking backend connection...</AlertTitle>
        </Alert>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTitle>Backend Connection Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkHealth} 
            className="mt-2"
          >
            Retry
          </Button>
        </Alert>
      ) : health ? (
        <Alert className="bg-green-800 text-white border-green-700">
          <AlertTitle>Backend Connected</AlertTitle>
          <AlertDescription>
            Status: {health.status} | Last updated: {new Date(health.timestamp).toLocaleTimeString()}
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}

export default BackendHealthCheck;