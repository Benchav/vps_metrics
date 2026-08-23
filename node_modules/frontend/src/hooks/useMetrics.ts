import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { SystemMetrics } from '@vps-metrics/shared';

// Connect to the backend
const SOCKET_URL = import.meta.env.PROD 
  ? '/' 
  : 'http://localhost:3012';

export function useMetrics() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [history, setHistory] = useState<SystemMetrics[]>([]);
  const [connected, setConnected] = useState(false);
  const [serverVersion, setServerVersion] = useState<string | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const socket: Socket = io(SOCKET_URL);

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('metrics_history', (data: SystemMetrics[]) => {
      setHistory(data);
      if (data.length > 0) {
        setMetrics(data[data.length - 1]);
      }
    });

    socket.on('metrics', (data: SystemMetrics) => {
      setMetrics(data);
      
      setServerVersion(prev => {
        if (prev && prev !== data.serverVersion) {
          setUpdateAvailable(true);
        }
        return prev || data.serverVersion;
      });

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
  }, []);

  return { metrics, history, connected, updateAvailable, serverVersion };
}
