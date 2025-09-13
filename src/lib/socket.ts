/**
 * Enhanced WebSocket Service
 * Provides robust WebSocket connection with automatic reconnection and event handling
 */
import { io, Socket } from 'socket.io-client';
import { API_BASE } from './api';
import { toast } from '@/hooks/use-toast';

// WebSocket events
export enum SocketEvent {
  NEW_ALERT = 'new_alert',
  SCAN_UPDATE = 'scan_update',
  MARKET_UPDATE = 'market_update'
}

// Connection states
export enum ConnectionState {
  CONNECTED = 'connected',
  CONNECTING = 'connecting',
  DISCONNECTED = 'disconnected',
  ERROR = 'error'
}

// Event listener type
type EventListener = (data: any) => void;

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private stateListeners: ((state: ConnectionState) => void)[] = [];
  private eventListeners: Map<string, Set<EventListener>> = new Map();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private connectionTimeout: NodeJS.Timeout | null = null;

  /**
   * Connect to WebSocket server
   * @returns Socket instance
   */
  connect() {
    if (this.socket?.connected) {
      return this.socket;
    }

    // Clear any existing reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.updateState(ConnectionState.CONNECTING);
    console.log('Connecting to Socket.IO server at:', API_BASE);
    
    // Set connection timeout
    this.connectionTimeout = setTimeout(() => {
      if (this.connectionState === ConnectionState.CONNECTING) {
        console.error('Socket.IO connection timeout');
        this.handleConnectionFailure('Connection timeout');
      }
    }, 15000);
    
    // Initialize Socket.IO connection
    this.socket = io(API_BASE, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      forceNew: true,
    });

    // Set up event handlers
    this.setupEventHandlers();

    return this.socket;
  }

  /**
   * Set up Socket.IO event handlers
   */
  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket.IO connected:', this.socket?.id);
      this.reconnectAttempts = 0;
      this.updateState(ConnectionState.CONNECTED);
      
      // Clear connection timeout
      if (this.connectionTimeout) {
        clearTimeout(this.connectionTimeout);
        this.connectionTimeout = null;
      }
      
      // Set up ping interval to keep connection alive
      this.setupPingInterval();
      
      // Notify user of successful connection
      toast({
        title: "Real-time Connection Established",
        description: "You are now receiving live market updates",
        duration: 3000,
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket.IO disconnected:', reason);
      this.updateState(ConnectionState.DISCONNECTED);
      
      // Clear ping interval
      if (this.pingInterval) {
        clearInterval(this.pingInterval);
        this.pingInterval = null;
      }
      
      // Auto-reconnect for certain disconnect reasons
      if (reason === 'io server disconnect' || reason === 'transport close') {
        this.scheduleReconnect();
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket.IO reconnected after', attemptNumber, 'attempts');
      this.reconnectAttempts = 0;
      this.updateState(ConnectionState.CONNECTED);
      
      toast({
        title: "Connection Restored",
        description: "Real-time updates resumed",
        duration: 3000,
      });
    });

    this.socket.on('reconnect_error', (error) => {
      this.reconnectAttempts++;
      console.warn('⚠️ Socket.IO reconnect error:', error.message);
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('🚨 Socket.IO max reconnection attempts reached');
        this.updateState(ConnectionState.ERROR);
        
        toast({
          title: "Connection Failed",
          description: "Unable to establish real-time connection after multiple attempts",
          variant: "destructive",
          duration: 5000,
        });
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('🚨 Socket.IO connection error:', error.message);
      this.handleConnectionFailure(error.message);
    });

    // Set up listeners for all registered events
    this.eventListeners.forEach((listeners, event) => {
      listeners.forEach(listener => {
        this.socket?.on(event, listener);
      });
    });
  }

  /**
   * Handle connection failure
   */
  private handleConnectionFailure(reason: string) {
    this.updateState(ConnectionState.ERROR);
    
    // Schedule reconnect
    this.scheduleReconnect();
    
    // Notify user
    if (this.reconnectAttempts === 0) {
      toast({
        title: "Connection Issue",
        description: "Having trouble connecting to real-time services. Retrying...",
        variant: "destructive",
        duration: 5000,
      });
    }
  }

  /**
   * Schedule reconnection attempt with exponential backoff
   */
  private scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    const delay = Math.min(30000, 1000 * Math.pow(1.5, this.reconnectAttempts));
    console.log(`Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);
    
    this.reconnectTimer = setTimeout(() => {
      console.log(`Attempting reconnect (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  /**
   * Set up ping interval to keep connection alive
   */
  private setupPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    
    this.pingInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('ping');
      } else {
        clearInterval(this.pingInterval!);
        this.pingInterval = null;
      }
    }, 30000); // 30 second ping
  }

  /**
   * Update connection state and notify listeners
   */
  private updateState(state: ConnectionState) {
    this.connectionState = state;
    this.stateListeners.forEach(listener => listener(state));
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    
    this.updateState(ConnectionState.DISCONNECTED);
  }

  /**
   * Subscribe to connection state changes
   */
  onConnectionStateChange(callback: (state: ConnectionState) => void) {
    this.stateListeners.push(callback);
    return () => {
      const index = this.stateListeners.indexOf(callback);
      if (index !== -1) {
        this.stateListeners.splice(index, 1);
      }
    };
  }

  /**
   * Register event listener
   */
  private registerEventListener(event: string, callback: EventListener) {
    // Initialize set if it doesn't exist
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    
    // Add listener to set
    this.eventListeners.get(event)!.add(callback);
    
    // Add listener to socket if connected
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  /**
   * Unregister event listener
   */
  private unregisterEventListener(event: string, callback?: EventListener) {
    if (callback && this.eventListeners.has(event)) {
      // Remove specific listener
      this.eventListeners.get(event)!.delete(callback);
      this.socket?.off(event, callback);
    } else if (!callback) {
      // Remove all listeners for event
      this.eventListeners.delete(event);
      this.socket?.off(event);
    }
  }

  /**
   * Subscribe to new alerts
   */
  onNewAlert(callback: EventListener) {
    if (!this.socket?.connected) this.connect();
    this.registerEventListener(SocketEvent.NEW_ALERT, callback);
    return () => this.unregisterEventListener(SocketEvent.NEW_ALERT, callback);
  }

  /**
   * Subscribe to scan updates
   */
  onScanUpdate(callback: EventListener) {
    if (!this.socket?.connected) this.connect();
    this.registerEventListener(SocketEvent.SCAN_UPDATE, callback);
    return () => this.unregisterEventListener(SocketEvent.SCAN_UPDATE, callback);
  }

  /**
   * Subscribe to market updates
   */
  onMarketUpdate(callback: EventListener) {
    if (!this.socket?.connected) this.connect();
    this.registerEventListener(SocketEvent.MARKET_UPDATE, callback);
    return () => this.unregisterEventListener(SocketEvent.MARKET_UPDATE, callback);
  }

  /**
   * Unsubscribe from events
   */
  off(event: string, callback?: EventListener) {
    this.unregisterEventListener(event, callback);
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.socket?.connected || false;
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return this.connectionState;
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;