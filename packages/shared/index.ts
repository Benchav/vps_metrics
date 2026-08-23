export interface SystemMetrics {
  serverVersion: string;
  timestamp: string;
  cpu: {
    manufacturer: string;
    brand: string;
    cores: number;
    physicalCores: number;
    speed: number;
    speedMax: number;
    load: number;
    loadUser: number;
    loadSystem: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    buffcache: number;
    available: number;
    swapTotal: number;
    swapUsed: number;
    usagePercentage: number;
  };
  disks: Array<{
    fs: string;
    type: string;
    size: number;
    used: number;
    usePercentage: number;
  }>;
  diskIO: {
    readSpeed: number;
    writeSpeed: number;
    readOps: number;
    writeOps: number;
  } | null;
  network: {
    interface: string;
    rx_sec: number;
    tx_sec: number;
    rx_bytes: number;
    tx_bytes: number;
  } | null;
  os: {
    platform: string;
    distro: string;
    release: string;
    uptime: number;
  };
  alerts: SystemAlert[];
}

export interface SystemAlert {
  id: string;
  timestamp: string;
  type: 'cpu' | 'ram' | 'disk' | 'network';
  level: 'warning' | 'danger';
  message: string;
  value: number;
}
