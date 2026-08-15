import { Terminal, Globe, Clock } from 'lucide-react';
import type { SystemMetrics } from '../types';

interface Props {
  os: SystemMetrics['os'];
  network: SystemMetrics['network'];
}

function formatUptime(seconds: number) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  
  return parts.join(' ') || '< 1m';
}

function formatNetworkSpeed(bytesSec: number) {
  if (bytesSec === 0) return '0 B/s';
  const k = 1024;
  const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  const i = Math.floor(Math.log(bytesSec) / Math.log(k));
  return parseFloat((bytesSec / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function SystemWidget({ os, network }: Props) {
  return (
    <div className="panel" style={{ gridColumn: '1 / -1' }}>
      <div className="grid-layout">
        <div>
          <div className="panel-title mb-2">
            <Terminal size={18} />
            <span>System Information</span>
          </div>
          <ul className="details-list">
            <li>
              <span className="details-label">OS</span>
              <span>{os.distro} {os.release}</span>
            </li>
            <li>
              <span className="details-label">Platform</span>
              <span style={{ textTransform: 'capitalize' }}>{os.platform}</span>
            </li>
            <li>
              <span className="details-label">Uptime</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={14} className="text-secondary" />
                {formatUptime(os.uptime)}
              </span>
            </li>
          </ul>
        </div>

        {network && (
          <div>
            <div className="panel-title mb-2">
              <Globe size={18} />
              <span>Network ({network.interface})</span>
            </div>
            <ul className="details-list">
              <li>
                <span className="details-label">Download (RX)</span>
                <span style={{ color: 'var(--success)' }}>↓ {formatNetworkSpeed(network.rx_sec)}</span>
              </li>
              <li>
                <span className="details-label">Upload (TX)</span>
                <span style={{ color: 'var(--accent)' }}>↑ {formatNetworkSpeed(network.tx_sec)}</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
