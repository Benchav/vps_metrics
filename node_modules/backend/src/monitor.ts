import { Server } from 'socket.io';
import type { SystemMetrics } from '@vps-metrics/shared';
import { getHardwareMetrics } from './services/hardware.service';
import { AlertEngine } from './services/alert.engine';

const INTERVAL_MS = 2000;
const SERVER_VERSION = Date.now().toString();

// State managers
const alertEngine = new AlertEngine(100);
const metricsHistory: SystemMetrics[] = [];
const MAX_HISTORY = 30; // Keeps 1 minute of data if INTERVAL_MS = 2000

export function getMetricsHistory() {
  return metricsHistory;
}

export function startMonitoring(io: Server) {
  console.log('Started hardware monitoring loop...');

  const timer = setInterval(async () => {
    try {
      const rawMetrics = await getHardwareMetrics();
      alertEngine.evaluate(rawMetrics);

      const metrics: SystemMetrics = {
        serverVersion: SERVER_VERSION,
        timestamp: new Date().toISOString(),
        ...rawMetrics,
        alerts: alertEngine.getHistory(),
      };

      // Update history buffer
      metricsHistory.push(metrics);
      if (metricsHistory.length > MAX_HISTORY) {
        metricsHistory.shift();
      }

      // Emit to all connected clients
      io.emit('metrics', metrics);
    } catch (err) {
      console.error('Error fetching metrics:', err);
    }
  }, INTERVAL_MS);

  return function stopMonitoring() {
    clearInterval(timer);
    console.log('Stopped hardware monitoring loop.');
  };
}
