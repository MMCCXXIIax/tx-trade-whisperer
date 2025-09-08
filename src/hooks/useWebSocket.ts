import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface AlertData {
  id: string;
  symbol: string;
  pattern: string;
  confidence: number;
  price: number;
  timestamp: string;
  explanation: string;
}

interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  alerts: AlertData[];
  lastAlert: AlertData | null;
}

export function useWebSocket(url?: string): UseWebSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [lastAlert, setLastAlert] = useState<AlertData | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Use production URL or fallback
    const wsUrl = url || 'https://tx-predictive-intelligence.onrender.com';
    
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

    socketInstance.on('pattern_alert', (alertData: AlertData) => {
      console.log('New pattern alert received:', alertData);
      
      setLastAlert(alertData);
      setAlerts(prevAlerts => [alertData, ...prevAlerts.slice(0, 49)]); // Keep last 50 alerts
      
      // Play alert sound if available
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }

      // Browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification(`TX Alert: ${alertData.symbol}`, {
          body: `${alertData.pattern} detected with ${alertData.confidence}% confidence`,
          icon: '/favicon.ico',
          tag: 'tx-alert'
        });
      }
    });

    socketInstance.on('market_update', (marketData) => {
      console.log('Market update received:', marketData);
      // Handle market data updates
    });

    socketInstance.on('system_status', (status) => {
      console.log('System status update:', status);
      // Handle system status updates
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
    lastAlert
  };
}