import { Terminal, Wifi, Clock, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import type { SystemMetrics } from '../types';

interface Props {
  os: SystemMetrics['os'];
  network: SystemMetrics['network'];
}

function formatUptime(seconds: number) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  return parts.join(' ') || '< 1m';
}

function formatNetworkSpeed(bytesSec: number) {
  if (!bytesSec || bytesSec === 0) return '0 B/s';
  const k = 1024;
  const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  const i = Math.floor(Math.log(bytesSec) / Math.log(k));
  return parseFloat((bytesSec / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.55rem 0',
  borderBottom: '1px solid rgba(255,255,255,0.04)',
  fontSize: '0.855rem',
};
const labelStyle: React.CSSProperties = { color: 'var(--text-secondary)', fontSize: '0.8rem' };
const valueStyle: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: '0.855rem' };

export default function SystemWidget({ os, network }: Props) {
  return (
    <div className="panel" style={{ gridColumn: '1 / -1' }}>
      <div style={{ display: 'grid', gridTemplateColumns: network ? '1fr 1fr' : '1fr', gap: '2rem' }}>

        {/* OS Info */}
        <div>
          <div className="panel-title" style={{ marginBottom: '0.75rem' }}>
            <Terminal size={13} />
            System Information
          </div>
          <div>
            <div style={rowStyle}>
              <span style={labelStyle}>OS</span>
              <span style={valueStyle}>{os.distro} {os.release}</span>
            </div>
            <div style={rowStyle}>
              <span style={labelStyle}>Platform</span>
              <span style={{ ...valueStyle, textTransform: 'capitalize' }}>{os.platform}</span>
            </div>
            <div style={{ ...rowStyle, borderBottom: 'none' }}>
              <span style={labelStyle}>Uptime</span>
              <span style={{ ...valueStyle, display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--green)' }}>
                <Clock size={13} />
                {formatUptime(os.uptime)}
              </span>
            </div>
          </div>
        </div>

        {/* Network */}
        {network && (
          <div>
            <div className="panel-title" style={{ marginBottom: '0.75rem' }}>
              <Wifi size={13} />
              Network · <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.2rem' }}>{network.interface}</span>
            </div>
            <div>
              <div style={rowStyle}>
                <span style={labelStyle}>Download (RX)</span>
                <span style={{ ...valueStyle, display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--green)' }}>
                  <ArrowDownToLine size={13} />
                  {formatNetworkSpeed(network.rx_sec)}
                </span>
              </div>
              <div style={{ ...rowStyle, borderBottom: 'none' }}>
                <span style={labelStyle}>Upload (TX)</span>
                <span style={{ ...valueStyle, display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent)' }}>
                  <ArrowUpFromLine size={13} />
                  {formatNetworkSpeed(network.tx_sec)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
