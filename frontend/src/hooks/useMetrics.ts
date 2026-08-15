import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { SystemMetrics } from '../types';

// Connect to the backend
const SOCKET_URL = import.meta.env.PROD 
  ? '/' 
  : 'http://localhost:3012';

export function useMetrics(apiKey: string) {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [history, setHistory] = useState<SystemMetrics[]>([]);
  const [connected, setConnected] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiKey) return;

    setAuthError(null);
    const socket: Socket = io(SOCKET_URL, {
      auth: { token: apiKey }
    });

    socket.on('connect', () => {
      setConnected(true);
      setAuthError(null);
    });

    socket.on('connect_error', (err) => {
      if (err.message.includes('Authentication error')) {
        setAuthError('Invalid API Key');
        setConnected(false);
        socket.disconnect();
      }
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('metrics', (data: SystemMetrics) => {
      setMetrics(data);
      setHistory((prev) => {
        const newHistory = [...prev, data];
        // Keep last 30 data points for charts
        if (newHistory.length > 30) {
          newHistory.shift();
        }
        return newHistory;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [apiKey]);

  return { metrics, history, connected, authError };
}
