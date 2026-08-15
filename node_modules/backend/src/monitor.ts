import si from 'systeminformation';
import { Server } from 'socket.io';

const INTERVAL_MS = 2000; // Emit every 2 seconds

export function startMonitoring(io: Server) {
  console.log('Started hardware monitoring loop...');
  
  setInterval(async () => {
    try {
      // Run queries in parallel for efficiency
      const [cpu, mem, osInfo, currentLoad, fsSize, networkStats] = await Promise.all([
        si.cpu(),
        si.mem(),
        si.osInfo(),
        si.currentLoad(),
        si.fsSize(),
        si.networkStats()
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
        network: networkStats.length > 0 ? {
          interface: networkStats[0].iface,
          rx_sec: networkStats[0].rx_sec,
          tx_sec: networkStats[0].tx_sec
        } : null,
        os: {
          platform: osInfo.platform,
          distro: osInfo.distro,
          release: osInfo.release,
          uptime: si.time().uptime
        }
      };

      io.emit('metrics', metrics);
    } catch (error) {
      console.error('Error fetching system metrics:', error);
    }
  }, INTERVAL_MS);
}
