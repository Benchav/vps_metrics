import si from 'systeminformation';

export async function getHardwareMetrics() {
  const results = await Promise.allSettled([
    si.cpu(),
    si.mem(),
    si.osInfo(),
    si.currentLoad(),
    si.fsSize(),
    si.networkStats(),
    si.time(),
    si.disksIO()
  ]);

  // Helper to extract value or return a default/fallback
  const extract = <T>(res: PromiseSettledResult<T>, fallback: any = null): T => {
    if (res.status === 'fulfilled') return res.value;
    console.error('Failed to fetch metric:', res.reason);
    return fallback as T;
  };

  const cpu = extract(results[0], { manufacturer: '', brand: '', cores: 0, physicalCores: 0, speed: 0, speedMax: 0 });
  const mem = extract(results[1], { total: 0, active: 0, free: 0, buffcache: 0, available: 0, swaptotal: 0, swapused: 0 });
  const osInfo = extract(results[2], { platform: '', distro: '', release: '' });
  const currentLoad = extract(results[3], { currentLoad: 0, currentLoadUser: 0, currentLoadSystem: 0 });
  const fsSize = extract(results[4], []);
  const networkStats = extract(results[5], []);
  const time = extract(results[6], { uptime: 0 });
  const disksIO = extract(results[7], null);

  return {
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
      usagePercentage: mem.total > 0 ? (mem.active / mem.total) * 100 : 0,
    },
    disks: fsSize.map((disk: any) => ({
      fs: disk.fs,
      type: disk.type,
      size: disk.size,
      used: disk.used,
      usePercentage: disk.use,
    })),
    diskIO: disksIO ? {
      readSpeed: Math.max(0, disksIO.rIO_sec ?? 0),
      writeSpeed: Math.max(0, disksIO.wIO_sec ?? 0),
      readOps: Math.max(0, disksIO.rIO ?? 0),
      writeOps: Math.max(0, disksIO.wIO ?? 0),
    } : null,
    network: networkStats.length > 0 ? {
      interface: networkStats[0].iface,
      rx_sec: Math.max(0, networkStats[0].rx_sec ?? 0),
      tx_sec: Math.max(0, networkStats[0].tx_sec ?? 0),
      rx_bytes: networkStats[0].rx_bytes ?? 0,
      tx_bytes: networkStats[0].tx_bytes ?? 0,
    } : null,
    os: {
      platform: osInfo.platform,
      distro: osInfo.distro,
      release: osInfo.release,
      uptime: time.uptime,
    },
  };
}
