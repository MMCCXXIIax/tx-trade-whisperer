import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { testBackendConnection, testApiEndpoints } from '@/lib/healthCheck';
import { User } from '@/types/user';

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [apiResults, setApiResults] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getCurrentUser();
  }, []);

  const checkBackendHealth = async () => {
    setBackendStatus('checking');
    const isHealthy = await testBackendConnection();
    setBackendStatus(isHealthy ? 'online' : 'offline');
    
    const results = await testApiEndpoints();
    setApiResults(results);
  };

  useEffect(() => {
    checkBackendHealth();
  }, []);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Button onClick={checkBackendHealth} variant="outline">
          Refresh Status
        </Button>
      </div>

      {/* User Information */}
      <Card>
        <CardHeader>
          <CardTitle>User Credentials</CardTitle>
          <CardDescription>
            Your authenticated user information from Supabase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">User ID</label>
                  <p className="font-mono text-sm bg-muted p-2 rounded">{user.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm p-2">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created At</label>
                  <p className="text-sm p-2">{new Date(user.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Sign In</label>
                  <p className="text-sm p-2">
                    {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">No user authenticated</p>
          )}
        </CardContent>
      </Card>

      {/* Backend Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Backend Status
            <Badge variant={backendStatus === 'online' ? 'default' : backendStatus === 'checking' ? 'secondary' : 'destructive'}>
              {backendStatus === 'online' ? '🟢 Online' : backendStatus === 'checking' ? '🟡 Checking...' : '🔴 Offline'}
            </Badge>
          </CardTitle>
          <CardDescription>
            TX Backend API at https://tx-predictive-intelligence.onrender.com
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <h4 className="font-medium">API Endpoint Status:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(apiResults).map(([endpoint, isWorking]) => (
                <div key={endpoint} className="flex items-center justify-between p-2 bg-muted rounded">
                  <code className="text-sm">{endpoint}</code>
                  <Badge variant={isWorking ? 'default' : 'destructive'}>
                    {isWorking ? '✅' : '❌'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Supabase Project</label>
              <p className="font-mono text-sm">zqrelfdmdrwwxrfoclzp</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Environment</label>
              <p className="text-sm">Production</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Backend URL</label>
              <p className="font-mono text-sm">https://tx-predictive-intelligence.onrender.com</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">CORS</label>
              <Badge variant="default">Enabled for all origins</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}