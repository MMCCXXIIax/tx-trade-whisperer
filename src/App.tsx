import { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Welcome from "./pages/Welcome";
import TXDashboard from './components/TXDashboard';
import TXNavigation from './components/TXNavigation';
import TradingView from './components/TradingView';

const queryClient = new QueryClient();

interface UserData {
  name: string;
  email: string;
  mode: 'demo' | 'broker';
}

const App = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'trading' | 'settings'>('dashboard');
  const [alerts, setAlerts] = useState<any[]>([]);

  // Load user data from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('tx_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleWelcomeComplete = (userData: UserData) => {
    setUser(userData);
    localStorage.setItem('tx_user', JSON.stringify(userData));
  };

  const handleAlertAction = (action: string) => {
    console.log('Alert action:', action);
    // Handle alert actions here
  };

  // If no user, show welcome page
  if (!user) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Welcome onComplete={handleWelcomeComplete} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        
        <div className="min-h-screen bg-background">
          <TXNavigation
            currentView={currentView}
            onViewChange={setCurrentView}
            userName={user.name}
            alertCount={alerts.length}
          />
          
          <main className="p-4">
            {currentView === 'dashboard' && (
              <TXDashboard />
            )}
            
            {currentView === 'trading' && (
              <div className="max-w-7xl mx-auto">
                <TradingView
                  symbol="bitcoin"
                  alerts={alerts}
                  onAlertAction={handleAlertAction}
                />
              </div>
            )}
            
            {currentView === 'settings' && (
              <div className="max-w-2xl mx-auto">
                <div className="text-center py-20">
                  <h2 className="text-2xl font-bold mb-4">Settings</h2>
                  <p className="text-muted-foreground mb-4">
                    Configure your TX experience
                  </p>
                  <button 
                    onClick={() => {
                      localStorage.removeItem('tx_user');
                      setUser(null);
                    }}
                    className="text-sm text-destructive hover:underline"
                  >
                    Reset Account
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;