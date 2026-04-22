import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import type { StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useGetMeQuery } from '@/features/auth/api/authApi';

interface WebSocketContextType {
  subscribe: (topic: string, callback: (message: any) => void) => () => void;
  sendMessage: (destination: string, body: any) => void;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) throw new Error('useWebSocket must be used within WebSocketProvider');
  return context;
};

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: user } = useGetMeQuery();
  const [isConnected, setIsConnected] = useState(false);
  const stompClient = useRef<Client | null>(null);
  // Active STOMP subscriptions keyed by topic
  const activeSubscriptions = useRef<Map<string, StompSubscription>>(new Map());
  // Pending subscriptions to replay once connection is established
  const pendingSubscriptions = useRef<Map<string, (message: any) => void>>(new Map());

  useEffect(() => {
    if (!user) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/ws`, null, { withCredentials: true } as any),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('[WS] Connected to WebSocket server');
      stompClient.current = client;
      setIsConnected(true);

      // Flush all pending subscriptions
      pendingSubscriptions.current.forEach((callback, topic) => {
        console.log(`[WS] Flushing pending subscription: ${topic}`);
        const sub = client.subscribe(topic, (frame) => {
          try {
            callback(JSON.parse(frame.body));
          } catch (e) {
            console.error('[WS] Error parsing frame body:', e);
          }
        });
        activeSubscriptions.current.set(topic, sub);
      });
      pendingSubscriptions.current.clear();
    };

    client.onDisconnect = () => {
      console.log('[WS] Disconnected from WebSocket server');
      setIsConnected(false);
    };

    client.onStompError = (frame) => {
      console.error('[WS] STOMP error:', frame.headers['message']);
    };

    client.activate();

    return () => {
      console.log('[WS] Deactivating client');
      client.deactivate();
      activeSubscriptions.current.clear();
      pendingSubscriptions.current.clear();
    };
  }, []);

  const subscribe = useCallback((topic: string, callback: (message: any) => void): () => void => {
    const client = stompClient.current;

    if (client && client.connected) {
      // Connected: subscribe immediately
      console.log(`[WS] Subscribing immediately to: ${topic}`);
      const sub = client.subscribe(topic, (frame) => {
        try {
          callback(JSON.parse(frame.body));
        } catch (e) {
          console.error('[WS] Error parsing frame body:', e);
        }
      });
      activeSubscriptions.current.set(topic, sub);

      return () => {
        console.log(`[WS] Unsubscribing from: ${topic}`);
        sub.unsubscribe();
        activeSubscriptions.current.delete(topic);
      };
    } else {
      // Not connected yet: queue for when connection is established
      console.log(`[WS] Queuing subscription for: ${topic}`);
      pendingSubscriptions.current.set(topic, callback);

      return () => {
        // Remove from pending if unsubscribed before connect
        pendingSubscriptions.current.delete(topic);
        // Also remove active if it was flushed by then
        const activeSub = activeSubscriptions.current.get(topic);
        if (activeSub) {
          activeSub.unsubscribe();
          activeSubscriptions.current.delete(topic);
        }
      };
    }
  }, []); // no deps — uses refs only, stable forever

  const sendMessage = useCallback((destination: string, body: any) => {
    const client = stompClient.current;
    if (client && client.connected) {
      client.publish({
        destination,
        body: JSON.stringify(body),
      });
    } else {
      console.warn('[WS] Cannot send — not connected');
    }
  }, []);

  return (
    <WebSocketContext.Provider value={{ subscribe, sendMessage, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
};
