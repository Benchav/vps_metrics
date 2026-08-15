export interface SystemMetrics {
  timestamp: string;
  cpu: {
    manufacturer: string;
    brand: string;
    cores: number;
    speed: number;
    load: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usagePercentage: number;
  };
  disks: Array<{
    fs: string;
    type: string;
    size: number;
    used: number;
    usePercentage: number;
  }>;
  network: {
    interface: string;
    rx_sec: number;
    tx_sec: number;
  } | null;
  os: {
    platform: string;
    distro: string;
    release: string;
    uptime: number;
  };
}
