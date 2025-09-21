import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import socketService, { ConnectionState } from '@/lib/socket';

const ConnectionStatus: React.FC = () => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    socketService.getConnectionStatus()
  );

  useEffect(() => {
    const unsubscribe = socketService.onConnectionStateChange(setConnectionState);
    return unsubscribe;
  }, []);

  const getStatusConfig = () => {
    switch (connectionState) {
      case ConnectionState.CONNECTED:
        return {
          icon: <Wifi className="w-3 h-3" />,
          text: 'Live',
          variant: 'default' as const,
          className: 'bg-green-500/20 text-green-500 border-green-500'
        };
      case ConnectionState.CONNECTING:
        return {
          icon: <AlertCircle className="w-3 h-3 animate-pulse" />,
          text: 'Connecting...',
          variant: 'outline' as const,
          className: 'bg-yellow-500/20 text-yellow-500 border-yellow-500'
        };
      case ConnectionState.ERROR:
        return {
          icon: <WifiOff className="w-3 h-3" />,
          text: 'Reconnecting...',
          variant: 'outline' as const,
          className: 'bg-orange-500/20 text-orange-500 border-orange-500'
        };
      default:
        return {
          icon: <WifiOff className="w-3 h-3" />,
          text: 'Manual Refresh',
          variant: 'outline' as const,
          className: 'bg-gray-500/20 text-gray-500 border-gray-500'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge 
      variant={config.variant}
      className={`flex items-center gap-1 text-xs ${config.className}`}
    >
      {config.icon}
      {config.text}
    </Badge>
  );
};

export default ConnectionStatus;