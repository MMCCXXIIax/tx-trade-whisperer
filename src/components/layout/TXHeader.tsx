import React, { useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, User, Settings, LogOut, Volume2, VolumeX } from 'lucide-react';

const assets = [
  { value: 'bitcoin', label: 'Bitcoin (BTC)', price: '$95,432', change: '+2.3%' },
  { value: 'ethereum', label: 'Ethereum (ETH)', price: '$3,240', change: '+1.8%' },
  { value: 'solana', label: 'Solana (SOL)', price: '$185', change: '-0.5%' },
  { value: 'AAPL', label: 'Apple (AAPL)', price: '$195.83', change: '+0.8%' },
  { value: 'TSLA', label: 'Tesla (TSLA)', price: '$248.50', change: '+1.2%' }
];

const timeframes = [
  { value: '1m', label: '1 Minute' },
  { value: '5m', label: '5 Minutes' },
  { value: '15m', label: '15 Minutes' },
  { value: '1h', label: '1 Hour' },
  { value: '4h', label: '4 Hours' },
  { value: '1d', label: '1 Day' }
];

export function TXHeader() {
  const [selectedAsset, setSelectedAsset] = useState('bitcoin');
  const [selectedTimeframe, setSelectedTimeframe] = useState('5m');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [alertCount, setAlertCount] = useState(3);

  const currentAsset = assets.find(a => a.value === selectedAsset);

  return (
    <header className="h-16 border-b border-border/50 tx-terminal-glass px-6 flex items-center justify-between">
      {/* Left: Sidebar trigger + Asset/Timeframe selectors */}
      <div className="flex items-center space-x-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        
        <div className="hidden md:flex items-center space-x-3">
          <Select value={selectedAsset} onValueChange={setSelectedAsset}>
            <SelectTrigger className="w-48 bg-background/50">
              <SelectValue placeholder="Select asset" />
            </SelectTrigger>
            <SelectContent className="dropdown-content">
              {assets.map((asset) => (
                <SelectItem key={asset.value} value={asset.value}>
                  <div className="flex justify-between items-center w-full">
                    <span>{asset.label}</span>
                    <div className="flex items-center space-x-2 ml-4">
                      <span className="text-sm font-mono">{asset.price}</span>
                      <span className={`text-xs ${
                        asset.change.startsWith('+') ? 'text-tx-green' : 'text-tx-red'
                      }`}>
                        {asset.change}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32 bg-background/50">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent className="dropdown-content">
              {timeframes.map((tf) => (
                <SelectItem key={tf.value} value={tf.value}>
                  {tf.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Current Asset Price (mobile-friendly) */}
        {currentAsset && (
          <div className="md:hidden">
            <div className="text-sm font-semibold">{currentAsset.label}</div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="font-mono">{currentAsset.price}</span>
              <span className={
                currentAsset.change.startsWith('+') ? 'text-tx-green' : 'text-tx-red'
              }>
                {currentAsset.change}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Right: System status + User controls */}
      <div className="flex items-center space-x-3">
        {/* System Status */}
        <div className="hidden sm:flex items-center space-x-2 text-sm">
          <div className="tx-status-online" />
          <span className="text-muted-foreground">Scanner Active</span>
        </div>

        {/* Sound Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="relative"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </Button>

        {/* Alert Bell */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-4 h-4" />
          {alertCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center"
            >
              {alertCount}
            </Badge>
          )}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full bg-tx-green/20">
              <User className="w-4 h-4 text-tx-green" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="dropdown-content w-56">
            <div className="px-3 py-2 border-b border-border/50">
              <p className="text-sm font-medium">Trader</p>
              <p className="text-xs text-muted-foreground">Demo Mode</p>
            </div>
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-400">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}