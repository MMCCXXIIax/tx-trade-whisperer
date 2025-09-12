import { io, Socket } from 'socket.io-client';
import { API_BASE } from './api';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect() {
    if (this.socket) {
      return this.socket;
    }

    console.log('Connecting to Socket.IO server at:', API_BASE);
    
    this.socket = io(API_BASE, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket.IO connected:', this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket.IO disconnected:', reason);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket.IO reconnected after', attemptNumber, 'attempts');
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_error', (error) => {
      this.reconnectAttempts++;
      console.warn('⚠️ Socket.IO reconnect error:', error.message);
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('🚨 Socket.IO max reconnection attempts reached');
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('🚨 Socket.IO connection error:', error.message);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Subscribe to new alerts
  onNewAlert(callback: (alert: any) => void) {
    if (!this.socket) this.connect();
    this.socket?.on('new_alert', callback);
  }

  // Subscribe to scan updates
  onScanUpdate(callback: (scan: any) => void) {
    if (!this.socket) this.connect();
    this.socket?.on('scan_update', callback);
  }

  // Subscribe to market updates
  onMarketUpdate(callback: (data: any) => void) {
    if (!this.socket) this.connect();
    this.socket?.on('market_update', callback);
  }

  // Unsubscribe from events
  off(event: string, callback?: any) {
    this.socket?.off(event, callback);
  }

  // Check if connected
  isConnected() {
    return this.socket?.connected || false;
  }

  // Get connection status
  getConnectionStatus() {
    if (!this.socket) return 'disconnected';
    if (this.socket.connected) return 'connected';
    return 'connecting';
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;