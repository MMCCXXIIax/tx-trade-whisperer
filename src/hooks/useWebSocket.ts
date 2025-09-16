import { useEffect, useState, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import socketService from '@/lib/socket';
import type { Alert as ApiAlert } from '@/lib/apiClient';

interface AlertData {
  id?: string;
  symbol: string;
  pattern: string;
  confidence: number;
  price: number | string;
  timestamp: string;
  explanation?: string;
}

interface UseWebSocketReturn {
  socket: Socket | null; // kept for backward compatibility; returns null
  isConnected: boolean;
  alerts: AlertData[];
  lastAlert: AlertData | null;
}

export function useWebSocket(): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState<boolean>(socketService.isConnected());
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [lastAlert, setLastAlert] = useState<AlertData | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Ensure single connection via service
    socketService.connect();

    // Subscribe to connection state changes
    const unsubscribeState = socketService.onConnectionStateChange(() => {
      setIsConnected(socketService.isConnected());
    });

    // Subscribe to new alerts through the service
    const unsubscribeAlert = socketService.onNewAlert((alert: unknown) => {
      const a = alert as ApiAlert;
      const normalized: AlertData = {
        id: a.id,
        symbol: a.symbol,
        pattern: a.pattern,
        confidence: typeof a.confidence === 'number' ? a.confidence : Number(a.confidence) || 0,
        price: a.price,
        timestamp: a.timestamp,
        explanation: a.explanation,
      };

      setLastAlert(normalized);
      setAlerts(prev => [normalized, ...prev.slice(0, 49)]); // keep last 50

      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
      }

      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification(`TX Alert: ${normalized.symbol}`, {
          body: `${normalized.pattern} detected with ${normalized.confidence}% confidence`,
          icon: '/favicon.ico',
          tag: 'tx-alert'
        });
      }
    });

    // Prepare audio element
    const audio = new Audio('/alert-sound.mp3');
    audio.preload = 'auto';
    audioRef.current = audio;

    // Request notification permission if needed
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    return () => {
      unsubscribeState();
      unsubscribeAlert();
      if (audioRef.current) audioRef.current = null;
    };
  }, []);

  // We do not expose the raw socket from the service to keep coupling low
  return {
    socket: null,
    isConnected,
    alerts,
    lastAlert,
  };
}