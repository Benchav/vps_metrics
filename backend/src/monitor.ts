import si from 'systeminformation';
import { Server } from 'socket.io';

const INTERVAL_MS = 2000; // Emit every 2 seconds

export function startMonitoring(io: Server) {
  console.log('Started hardware monitoring loop...');
  
  setInterval(async () => {
    try {
      // Run queries in parallel for efficiency
      // si.time() is included here — calling it outside Promise.all would block synchronously
      const [cpu, mem, osInfo, currentLoad, fsSize, networkStats, time] = await Promise.all([
        si.cpu(),
        si.mem(),
        si.osInfo(),
        si.currentLoad(),
        si.fsSize(),
        si.networkStats(),
        si.time()
      ]);

      const metrics = {
        timestamp: new Date().toISOString(),
        cpu: {
          manufacturer: cpu.manufacturer,
          brand: cpu.brand,
          cores: cpu.cores,
          speed: cpu.speed,
          load: currentLoad.currentLoad // percentage
        },
        memory: {
          total: mem.total,
          used: mem.active,
          free: mem.available,
          usagePercentage: (mem.active / mem.total) * 100
        },
        disks: fsSize.map(disk => ({
          fs: disk.fs,
          type: disk.type,
          size: disk.size,
          used: disk.used,
          usePercentage: disk.use
        })),
        // systeminformation returns -1 for rx_sec/tx_sec on the first sample
        // because it needs two data points to calculate throughput. Clamp to 0.
        network: networkStats.length > 0 ? {
          interface: networkStats[0].iface,
          rx_sec: Math.max(0, networkStats[0].rx_sec ?? 0),
          tx_sec: Math.max(0, networkStats[0].tx_sec ?? 0)
        } : null,
        os: {
          platform: osInfo.platform,
          distro: osInfo.distro,
          release: osInfo.release,
          uptime: time.uptime
        }
      };

      io.emit('metrics', metrics);
    } catch (error) {
      console.error('Error fetching system metrics:', error);
    }
  }, INTERVAL_MS);
}
