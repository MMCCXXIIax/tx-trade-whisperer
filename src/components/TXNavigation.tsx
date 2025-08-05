import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Bell, 
  Settings, 
  User,
  TrendingUp,
  Activity
} from 'lucide-react';

interface TXNavigationProps {
  currentView: 'dashboard' | 'trading' | 'settings';
  onViewChange: (view: 'dashboard' | 'trading' | 'settings') => void;
  userName: string;
  alertCount: number;
}

const TXNavigation: React.FC<TXNavigationProps> = ({ 
  currentView, 
  onViewChange, 
  userName,
  alertCount 
}) => {
  return (
    <nav className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* TX Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-primary font-mono">TX</span>
            </div>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              LIVE
            </Badge>
          </div>

          {/* Navigation Menu */}
          <div className="flex items-center space-x-2">
            <Button
              variant={currentView === 'dashboard' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('dashboard')}
              className="relative"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
              {alertCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {alertCount}
                </Badge>
              )}
            </Button>

            <Button
              variant={currentView === 'trading' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('trading')}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Trading
            </Button>

            <Button
              variant={currentView === 'settings' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('settings')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>

            {/* User Info */}
            <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-border">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {userName}
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TXNavigation;