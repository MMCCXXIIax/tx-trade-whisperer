import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE } from '@/lib/api';

// Flask Socket.IO event interfaces based on your API documentation
interface PatternAlert {
  symbol: string;
  alert_type: string;
  confidence: number;
  confidence_pct: number;
  price: number;
  timestamp: string;
  source: string;
  explanation: string;
  interval: string;
  period: string;
}

interface ScanUpdate {
  symbol: string;
  intraday_patterns: Array<{
    pattern_type: string;
    confidence: number;
    confidence_pct: number;
    price: number;
    timestamp: string;
  }>;
  context_patterns: Array<{
    pattern_type: string;
    confidence: number;
    confidence_pct: number;
    price: number;
    timestamp: string;
  }>;
  timestamp: string;
}

interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  alerts: PatternAlert[];
  lastAlert: PatternAlert | null;
  scanUpdates: ScanUpdate[];
  lastScanUpdate: ScanUpdate | null;
}

export function useWebSocket(url?: string): UseWebSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [alerts, setAlerts] = useState<PatternAlert[]>([]);
  const [lastAlert, setLastAlert] = useState<PatternAlert | null>(null);
  const [scanUpdates, setScanUpdates] = useState<ScanUpdate[]>([]);
  const [lastScanUpdate, setLastScanUpdate] = useState<ScanUpdate | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Use API_BASE or provided URL
    const wsUrl = url || API_BASE;
    
    // Initialize socket connection
    const socketInstance = io(wsUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('WebSocket connected for real-time alerts');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    });

    // Handle pattern_alert event from Flask Socket.IO
    socketInstance.on('pattern_alert', (alertData: PatternAlert) => {
      console.log('Pattern alert received:', alertData);
      
      setLastAlert(alertData);
      setAlerts(prevAlerts => [alertData, ...prevAlerts.slice(0, 49)]); // Keep last 50 alerts
      
      // Play alert sound if available
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }

      // Browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification(`TX Alert: ${alertData.symbol}`, {
          body: `${alertData.alert_type} detected with ${alertData.confidence_pct}% confidence at $${alertData.price}`,
          icon: '/favicon.ico',
          tag: 'tx-alert'
        });
      }
    });

    // Handle scan_update event from Flask Socket.IO
    socketInstance.on('scan_update', (scanData: ScanUpdate) => {
      console.log('Scan update received:', scanData);
      
      setLastScanUpdate(scanData);
      setScanUpdates(prevUpdates => [scanData, ...prevUpdates.slice(0, 99)]); // Keep last 100 scan updates
    });

    // Optional: Handle additional events if your Flask backend emits them
    socketInstance.on('market_update', (marketData) => {
      console.log('Market update received:', marketData);
      // Handle market data updates - can be extended based on your needs
    });

    socketInstance.on('system_status', (status) => {
      console.log('System status update:', status);
      // Handle system status updates - can be extended based on your needs
    });

    setSocket(socketInstance);

    // Create audio element for alert sounds
    const audio = new Audio('/alert-sound.mp3');
    audio.preload = 'auto';
    audioRef.current = audio;

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      socketInstance.disconnect();
      if (audioRef.current) {
        audioRef.current = null;
      }
    };
  }, [url]);

  return {
    socket,
    isConnected,
    alerts,
    lastAlert,
    scanUpdates,
    lastScanUpdate
  };
}