import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  BarChart3, 
  Settings, 
  User, 
  Menu, 
  X,
  Zap,
  Bell,
  DollarSign,
  FileText,
  PieChart
} from 'lucide-react';
import { Card } from '@/components/ui/card';

interface TXNavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  userName?: string;
  mode?: 'demo' | 'live';
}

const TXNavigation: React.FC<TXNavigationProps> = ({ 
  currentPage, 
  onPageChange, 
  userName = "Trader",
  mode = 'demo'
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Base navigation items
  let navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'trading', label: 'Trading View', icon: BarChart3 },
    { id: 'alerts', label: 'Alert Center', icon: Bell },
    { id: 'logs', label: 'Detection Logs', icon: FileText },
    { id: 'paper-trading', label: 'Paper Trading', icon: PieChart },
    { id: 'performance', label: 'Performance', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  // Mode-based filtering
  if (mode === 'demo') {
    // Hide live-only features in demo mode
    navigationItems = navigationItems.filter(item => item.id !== 'trading');
  }

  const renderNavButtons = (isMobile = false) =>
    navigationItems.map((item) => {
      const Icon = item.icon;
      return (
        <Button
          key={item.id}
          variant={currentPage === item.id ? "default" : "ghost"}
          size={isMobile ? undefined : "sm"}
          className={`
            ${isMobile 
              ? `w-full justify-start space-x-3 p-3 ${currentPage === item.id 
                  ? 'bg-tx-green text-tx-black hover:bg-tx-green/90' 
                  : 'text-foreground hover:bg-secondary'}`
              : `flex items-center space-x-2 px-3 py-2 text-xs ${currentPage === item.id 
                  ? 'bg-tx-green text-tx-black hover:bg-tx-green/90' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`
            }
          `}
          onClick={() => {
            onPageChange(item.id);
            if (isMobile) setMobileMenuOpen(false);
          }}
        >
          <Icon className={isMobile ? "w-5 h-5" : "w-4 h-4"} />
          <span className={isMobile ? "" : "hidden lg:inline"}>{item.label}</span>
        </Button>
      );
    });

  return (
    <>
      {/* Desktop Navigation */}
      <Card className="hidden md:block terminal-container sticky top-4 z-40">
        <div className="flex items-center justify-between p-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-tx-green/20 rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 text-tx-green" />
            </div>
            <div>
              <h1 className="text-tx-green font-bold text-lg">TX</h1>
              <p className="text-xs text-muted-foreground">Trading Intelligence</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {renderNavButtons(false)}
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:block text-right">
              <p className="text-sm font-bold text-foreground">{userName}</p>
              <p className="text-xs text-muted-foreground">
                {mode === 'demo' ? 'Demo Mode' : 'Live Trader'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 rounded-full bg-tx-green/20 hover:bg-tx-green/30"
            >
              <User className="w-4 h-4 text-tx-green" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Mobile Header */}
        <Card className="terminal-container sticky top-0 z-50">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-tx-green/20 rounded-full flex items-center justify-center">
                <Zap className="w-3 h-3 text-tx-green" />
              </div>
              <h1 className="text-tx-green font-bold">TX Intelligence</h1>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-foreground"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </Card>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-sm">
            <Card className="terminal-container m-4 mt-20">
              <div className="p-6 space-y-4">
                {/* User Info */}
                <div className="flex items-center space-x-3 pb-4 border-b border-border">
                  <div className="w-10 h-10 rounded-full bg-tx-green/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-tx-green" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{userName}</p>
                    <p className="text-sm text-muted-foreground">
                      {mode === 'demo' ? 'Demo Mode' : 'Live Trader'}
                    </p>
                  </div>
                </div>

                {/* Navigation Items */}
                <div className="space-y-2">
                  {renderNavButtons(true)}
                </div>

                {/* TX Status */}
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">TX Status:</span>
                    <span className="text-tx-green font-bold flex items-center space-x-1">
                      <div className="w-2 h-2 bg-tx-green rounded-full animate-pulse" />
                      <span>Active</span>
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </>
  );
};

export default TXNavigation;
