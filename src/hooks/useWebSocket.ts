import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE } from '@/lib/api';
import { PatternAlert, ScanUpdate, BackendAlert } from '@/types/alerts';

interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  patternAlerts: PatternAlert[];
  lastPatternAlert: PatternAlert | null;
  batchAlerts: BackendAlert[];
  lastBatchAlert: BackendAlert | null;
  scanUpdates: ScanUpdate[];
  lastScanUpdate: ScanUpdate | null;
  connectionStatus: string;
}

export function useWebSocket(url?: string): UseWebSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [patternAlerts, setPatternAlerts] = useState<PatternAlert[]>([]);
  const [lastPatternAlert, setLastPatternAlert] = useState<PatternAlert | null>(null);
  const [batchAlerts, setBatchAlerts] = useState<BackendAlert[]>([]);
  const [lastBatchAlert, setLastBatchAlert] = useState<BackendAlert | null>(null);
  const [scanUpdates, setScanUpdates] = useState<ScanUpdate[]>([]);
  const [lastScanUpdate, setLastScanUpdate] = useState<ScanUpdate | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
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
      setConnectionStatus('connected');
      console.log('WebSocket connected for real-time alerts');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      setConnectionStatus('disconnected');
      console.log('WebSocket disconnected');
    });

    // Handle connection_status event
    socketInstance.on('connection_status', (data: any) => {
      console.log('Connection status:', data);
      setConnectionStatus(data.status || 'connected');
    });

    // Handle pattern_alert event (high-confidence detection)
    socketInstance.on('pattern_alert', (alertData: PatternAlert) => {
      console.log('Pattern alert received:', alertData);
      
      setLastPatternAlert(alertData);
      setPatternAlerts(prev => [alertData, ...prev.slice(0, 49)]);
      
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }

      if (Notification.permission === 'granted') {
        new Notification(`TX Alert: ${alertData.symbol}`, {
          body: `${alertData.alert_type} detected with ${alertData.confidence_pct}% confidence at $${alertData.price}`,
          icon: '/favicon.ico',
          tag: 'tx-alert'
        });
      }
    });

    // Handle new_alert event (batch alerts from AlertService)
    socketInstance.on('new_alert', (alertData: BackendAlert) => {
      console.log('New alert received:', alertData);
      
      setLastBatchAlert(alertData);
      setBatchAlerts(prev => [alertData, ...prev.slice(0, 49)]);
      
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }

      if (Notification.permission === 'granted') {
        new Notification(`TX Alert: ${alertData.symbol}`, {
          body: `${alertData.alert_type} detected with ${alertData.confidence_pct}% confidence`,
          icon: '/favicon.ico',
          tag: 'tx-alert'
        });
      }
    });

    // Handle scan_update event
    socketInstance.on('scan_update', (scanData: ScanUpdate) => {
      console.log('Scan update received:', scanData);
      setLastScanUpdate(scanData);
      setScanUpdates(prev => [scanData, ...prev.slice(0, 99)]);
    });

    // Handle market_scan_update event
    socketInstance.on('market_scan_update', (data: any) => {
      console.log('Market scan update received:', data);
    });

    // Handle market_update event
    socketInstance.on('market_update', (marketData: any) => {
      console.log('Market update received:', marketData);
    });

    // Handle system_status event
    socketInstance.on('system_status', (status: any) => {
      console.log('System status update:', status);
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
    patternAlerts,
    lastPatternAlert,
    batchAlerts,
    lastBatchAlert,
    scanUpdates,
    lastScanUpdate,
    connectionStatus
  };
}