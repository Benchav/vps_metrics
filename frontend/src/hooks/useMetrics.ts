import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { SystemMetrics } from '../types';

// Connect to the backend on port 3012 (or relative if proxied)
const SOCKET_URL = import.meta.env.PROD 
  ? window.location.origin // In production, we assume backend serves frontend or via proxy
  : 'http://localhost:3012';

export function useMetrics() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [history, setHistory] = useState<SystemMetrics[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket: Socket = io(SOCKET_URL);

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('metrics', (data: SystemMetrics) => {
      setMetrics(data);
      setHistory((prev) => {
        const newHistory = [...prev, data];
        // Keep last 30 data points for charts (e.g., 60 seconds if 2s interval)
        if (newHistory.length > 30) {
          newHistory.shift();
        }
        return newHistory;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return { metrics, history, connected };
}
