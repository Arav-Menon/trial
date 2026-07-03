"use client";

import { useEffect, useRef, useCallback, useState } from "react";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3002";

export type WsMessage =
  | { type: "authenticated"; userId: string; userName: string }
  | { type: "auth_error"; message: string }
  | { type: "channel_joined"; channelId: string }
  | { type: "channel_left"; channelId: string }
  | { type: "new_message"; channelId: string; message: any }
  | { type: "user_typing"; channelId: string; userId: string; userName: string }
  | { type: "user_stopped_typing"; channelId: string; userId: string }
  | { type: "online_users"; channelId: string; userIds: string[] }
  | { type: "error"; message: string };

interface UseWebSocketOptions {
  onMessage?: (message: WsMessage) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const wsRef = useRef<WebSocket | null>(null);
  const tokenRef = useRef<string>("");
  const reconnectCountRef = useRef(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { onMessage } = options;

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const connect = useCallback(
    (token: string) => {
      cleanup();
      tokenRef.current = token;

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectCountRef.current = 0;
        setIsConnected(true);
        ws.send(JSON.stringify({ type: "authenticate", token }));
      };

      ws.onmessage = (event) => {
        try {
          const message: WsMessage = JSON.parse(event.data);

          if (message.type === "authenticated") {
            setIsAuthenticated(true);
          }

          if (message.type === "auth_error") {
            setIsAuthenticated(false);
          }

          onMessage?.(message);
        } catch {
          // silently ignore unparseable messages
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsAuthenticated(false);
        wsRef.current = null;

        const delay = Math.min(1000 * 2 ** reconnectCountRef.current, 30000);
        reconnectCountRef.current++;

        reconnectTimeoutRef.current = setTimeout(() => {
          connect(tokenRef.current);
        }, delay);
      };

      ws.onerror = () => {
        // browser WebSocket onerror events have no useful info
        // the onclose handler will handle reconnection
      };
    },
    [onMessage, cleanup]
  );

  const disconnect = useCallback(() => {
    reconnectCountRef.current = Infinity; // prevent reconnect
    cleanup();
    setIsConnected(false);
    setIsAuthenticated(false);
  }, [cleanup]);

  const send = useCallback((message: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return { isConnected, isAuthenticated, connect, disconnect, send };
}
