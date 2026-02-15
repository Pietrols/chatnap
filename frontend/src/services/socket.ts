import { io, Socket } from 'socket.io-client';
import { Message } from '../types';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;
  private messageListeners: ((message: Message) => void)[] = [];
  private typingListeners: ((data: { userId: string; isTyping: boolean }) => void)[] = [];
  private userOnlineListeners: ((data: { userId: string; isOnline: boolean }) => void)[] = [];
  private userOfflineListeners: ((data: { userId: string; isOnline: boolean }) => void)[] = [];

  connect(token: string): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.socket?.emit('authenticate', token);
    });

    this.socket.on('authenticated', (data: { success: boolean; userId?: string; error?: string }) => {
      if (data.success) {
        console.log('Socket authenticated successfully');
      } else {
        console.error('Socket authentication failed:', data.error);
      }
    });

    this.socket.on('new_message', (message: Message) => {
      this.messageListeners.forEach((listener) => listener(message));
    });

    this.socket.on('message_sent', (message: Message) => {
      this.messageListeners.forEach((listener) => listener(message));
    });

    this.socket.on('user_typing', (data: { userId: string; isTyping: boolean }) => {
      this.typingListeners.forEach((listener) => listener(data));
    });

    this.socket.on('user_online', (data: { userId: string; isOnline: boolean }) => {
      this.userOnlineListeners.forEach((listener) => listener(data));
    });

    this.socket.on('user_offline', (data: { userId: string; isOnline: boolean }) => {
      this.userOfflineListeners.forEach((listener) => listener(data));
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  sendMessage(receiverId: string, content: string): void {
    this.socket?.emit('send_message', { receiverId, content });
  }

  sendTyping(receiverId: string, isTyping: boolean): void {
    this.socket?.emit('typing', { receiverId, isTyping });
  }

  onMessage(callback: (message: Message) => void): () => void {
    this.messageListeners.push(callback);
    return () => {
      this.messageListeners = this.messageListeners.filter((cb) => cb !== callback);
    };
  }

  onTyping(callback: (data: { userId: string; isTyping: boolean }) => void): () => void {
    this.typingListeners.push(callback);
    return () => {
      this.typingListeners = this.typingListeners.filter((cb) => cb !== callback);
    };
  }

  onUserOnline(callback: (data: { userId: string; isOnline: boolean }) => void): () => void {
    this.userOnlineListeners.push(callback);
    return () => {
      this.userOnlineListeners = this.userOnlineListeners.filter((cb) => cb !== callback);
    };
  }

  onUserOffline(callback: (data: { userId: string; isOnline: boolean }) => void): () => void {
    this.userOfflineListeners.push(callback);
    return () => {
      this.userOfflineListeners = this.userOfflineListeners.filter((cb) => cb !== callback);
    };
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
export default socketService;
