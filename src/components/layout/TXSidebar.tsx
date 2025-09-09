import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  BarChart3,
  TrendingUp,
  Zap,
  Bell,
  FileText,
  TestTube,
  Wrench,
  PieChart,
  Settings,
  MessageSquare,
  Activity,
  Target
} from 'lucide-react';

interface TXSidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const navigationItems = [
  {
    id: 'overview',
    label: 'Overview',
    icon: TrendingUp,
    description: 'Dashboard & alerts'
  },
  {
    id: 'patterns',
    label: 'Pattern Detection',
    icon: Target,
    description: 'AI pattern analysis'
  },
  {
    id: 'trading',
    label: 'Paper Trading',
    icon: BarChart3,
    description: 'Practice trading'
  },
  {
    id: 'sentiment',
    label: 'Sentiment Analysis',
    icon: MessageSquare,
    description: 'Market sentiment'
  },
  {
    id: 'backtest',
    label: 'Backtesting',
    icon: TestTube,
    description: 'Strategy testing'
  },
  {
    id: 'builder',
    label: 'Strategy Builder',
    icon: Wrench,
    description: 'Build strategies'
  },
  {
    id: 'logs',
    label: 'Detection Logs',
    icon: FileText,
    description: 'Activity history'
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    icon: PieChart,
    description: 'Performance tracking'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    description: 'App configuration'
  }
];

export function TXSidebar({ currentPage, onPageChange }: TXSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();

  const isActive = (pageId: string) => currentPage === pageId;

  return (
    <Sidebar className={`${collapsed ? 'w-16' : 'w-64'} transition-all duration-300`} collapsible="icon">
      <SidebarContent className="tx-terminal-glass border-r border-border/50">
        {/* TX Logo */}
        <div className={`p-4 border-b border-border/50 ${collapsed ? 'px-2' : ''}`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-tx-green/20 rounded-lg flex items-center justify-center tx-glow">
              <Zap className="w-6 h-6 text-tx-green" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-tx-green font-bold text-xl font-display">TX</h1>
                <p className="text-xs text-muted-foreground">Trading Intelligence</p>
              </div>
            )}
          </div>
        </div>

        {/* System Status */}
        {!collapsed && (
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">System Status:</span>
              <div className="flex items-center space-x-2">
                <div className="tx-status-online" />
                <span className="text-tx-green font-medium">Active</span>
              </div>
            </div>
          </div>
        )}

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Navigation</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.id);
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onPageChange(item.id)}
                      className={`
                        group relative w-full justify-start transition-all duration-200
                        ${collapsed ? 'px-3' : 'px-4'} py-3
                        ${active 
                          ? 'bg-primary/10 text-primary border-r-2 border-primary' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                        }
                      `}
                    >
                      <Icon className={`${collapsed ? 'w-5 h-5' : 'w-4 h-4 mr-3'} flex-shrink-0`} />
                      {!collapsed && (
                        <div className="flex flex-col">
                          <span className="font-medium">{item.label}</span>
                          <span className="text-xs text-muted-foreground opacity-70">
                            {item.description}
                          </span>
                        </div>
                      )}
                      
                      {/* Active indicator */}
                      {active && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-l-full" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Market Summary (when expanded) */}
        {!collapsed && (
          <div className="mt-auto p-4 border-t border-border/50">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">Quick Stats</h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Patterns Today:</span>
                  <span className="text-tx-green font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Success Rate:</span>
                  <span className="text-tx-green font-medium">85.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Alerts Sent:</span>
                  <span className="text-tx-green font-medium">34</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}