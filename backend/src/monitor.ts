import si from 'systeminformation';
import { Server } from 'socket.io';

const INTERVAL_MS = 2000;
const SERVER_VERSION = Date.now().toString();

const alertHistory: any[] = [];

function addAlert(type: string, level: string, message: string, value: number) {
  // Debounce: avoid duplicates in the same 10s window
  const now = Date.now();
  const recent = alertHistory.find(
    a => a.type === type && a.level === level && (now - new Date(a.timestamp).getTime()) < 10000
  );
  if (recent) return;

  alertHistory.unshift({
    id: Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toISOString(),
    type, level, message, value
  });
  if (alertHistory.length > 100) alertHistory.pop();
}

export function startMonitoring(io: Server) {
  console.log('Started hardware monitoring loop...');

  setInterval(async () => {
    try {
      const [cpu, mem, osInfo, currentLoad, fsSize, networkStats, time, disksIO] = await Promise.all([
        si.cpu(),
        si.mem(),
        si.osInfo(),
        si.currentLoad(),
        si.fsSize(),
        si.networkStats(),
        si.time(),
        si.disksIO().catch(() => null)
      ]);

      const metrics = {
        serverVersion: SERVER_VERSION,
        timestamp: new Date().toISOString(),
        cpu: {
          manufacturer: cpu.manufacturer,
          brand: cpu.brand,
          cores: cpu.cores,
          physicalCores: cpu.physicalCores,
          speed: cpu.speed,
          speedMax: cpu.speedMax,
          load: currentLoad.currentLoad,
          loadUser: currentLoad.currentLoadUser,
          loadSystem: currentLoad.currentLoadSystem,
        },
        memory: {
          total: mem.total,
          used: mem.active,
          free: mem.free,
          buffcache: mem.buffcache,
          available: mem.available,
          swapTotal: mem.swaptotal,
          swapUsed: mem.swapused,
          usagePercentage: (mem.active / mem.total) * 100,
        },
        disks: fsSize.map(disk => ({
          fs: disk.fs,
          type: disk.type,
          size: disk.size,
          used: disk.used,
          usePercentage: disk.use,
        })),
        diskIO: disksIO ? {
          readSpeed:  Math.max(0, disksIO.rIO_sec  ?? 0),
          writeSpeed: Math.max(0, disksIO.wIO_sec  ?? 0),
          readOps:    Math.max(0, disksIO.rIO      ?? 0),
          writeOps:   Math.max(0, disksIO.wIO      ?? 0),
        } : null,
        network: networkStats.length > 0 ? {
          interface: networkStats[0].iface,
          rx_sec:    Math.max(0, networkStats[0].rx_sec   ?? 0),
          tx_sec:    Math.max(0, networkStats[0].tx_sec   ?? 0),
          rx_bytes:  networkStats[0].rx_bytes ?? 0,
          tx_bytes:  networkStats[0].tx_bytes ?? 0,
        } : null,
        os: {
          platform: osInfo.platform,
          distro:   osInfo.distro,
          release:  osInfo.release,
          uptime:   time.uptime,
        },
        alerts: alertHistory,
      };

      // ── Alert Engine ─────────────────────────────────
      if (metrics.cpu.load > 95)
        addAlert('cpu', 'danger', `Critical CPU Load: ${metrics.cpu.load.toFixed(1)}%`, metrics.cpu.load);
      else if (metrics.cpu.load > 85)
        addAlert('cpu', 'warning', `High CPU Load: ${metrics.cpu.load.toFixed(1)}%`, metrics.cpu.load);

      if (metrics.memory.usagePercentage > 95)
        addAlert('ram', 'danger', `Critical RAM: ${metrics.memory.usagePercentage.toFixed(1)}%`, metrics.memory.usagePercentage);
      else if (metrics.memory.usagePercentage > 85)
        addAlert('ram', 'warning', `High RAM Usage: ${metrics.memory.usagePercentage.toFixed(1)}%`, metrics.memory.usagePercentage);

      metrics.disks.forEach(d => {
        if (d.usePercentage > 95)
          addAlert('disk', 'danger', `Critical Disk ${d.fs}: ${d.usePercentage.toFixed(1)}%`, d.usePercentage);
        else if (d.usePercentage > 90)
          addAlert('disk', 'warning', `Disk ${d.fs} almost full: ${d.usePercentage.toFixed(1)}%`, d.usePercentage);
      });

      io.emit('metrics', metrics);
    } catch (err) {
      console.error('Error fetching metrics:', err);
    }
  }, INTERVAL_MS);
}
