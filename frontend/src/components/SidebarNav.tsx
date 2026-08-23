import type { SystemMetrics } from '@vps-metrics/shared';

type NavPanel = 'overview' | 'cpu' | 'memory' | 'disk' | 'network' | 'alerts';

interface Props {
  metrics: SystemMetrics;
  history: SystemMetrics[];
  selected: NavPanel;
  onSelect: (p: NavPanel) => void;
}

function MiniSparkline({ data, color, w = 160, h = 28 }: { data: number[]; color: string; w?: number; h?: number }) {
  if (data.length < 2) return <svg width={w} height={h} />;
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (v / max) * (h - 2) - 1;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width={w} height={h} style={{ overflow: 'visible', display: 'block' }}>
      <defs>
        <linearGradient id={`spark-fill-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.85}
      />
    </svg>
  );
}

function formatBytes(bytes: number) {
  if (!bytes || bytes === 0) return '0 B/s';
  const k = 1024;
  const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

interface NavItemProps {
  label: string;
  value: string;
  sub: string;
  color: string;
  sparkData: number[];
  active: boolean;
  onClick: () => void;
}

function NavItem({ label, value, sub, color, sparkData, active, onClick }: NavItemProps) {
  return (
    <button
      className={`nav-item${active ? ' active' : ''}`}
      onClick={onClick}
      style={{ borderLeftColor: active ? color : 'transparent' }}
    >
      <div className="nav-item-top">
        <span className="nav-item-label">
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block', boxShadow: active ? `0 0 6px ${color}` : 'none', flexShrink: 0 }} />
          {label}
        </span>
        <span className="nav-item-value" style={{ color: active ? color : undefined }}>
          {value}
        </span>
      </div>
      <span className="nav-spark">
        <MiniSparkline data={sparkData} color={color} />
      </span>
      <span className="nav-item-sub">{sub}</span>
    </button>
  );
}

export default function SidebarNav({ metrics, history, selected, onSelect }: Props) {
  const cpuSpark = history.map(h => h.cpu.load);
  const memSpark = history.map(h => h.memory.usagePercentage);
  const diskSpark = history.map(h => h.disks[0]?.usePercentage ?? 0);
  const netSpark  = history.map(h => h.network ? h.network.rx_sec + h.network.tx_sec : 0);

  const maxDisk = metrics.disks.reduce((a, d) => d.usePercentage > a ? d.usePercentage : a, 0);
  const netTotal = metrics.network ? metrics.network.rx_sec + metrics.network.tx_sec : 0;

  return (
    <nav className="sidebar">
      {/* Overview */}
      <button
        className={`nav-item${selected === 'overview' ? ' active' : ''}`}
        onClick={() => onSelect('overview')}
        style={{
          borderLeftColor: selected === 'overview' ? 'var(--text-secondary)' : 'transparent',
          marginBottom: '0.5rem',
        }}
      >
        <div className="nav-item-top">
          <span className="nav-item-label" style={{ gap: '0.5rem' }}>
            <span style={{ width: 8, height: 8, border: '1px solid var(--text-muted)', borderRadius: '2px', display: 'inline-block', flexShrink: 0 }} />
            Overview
          </span>
        </div>
      </button>

      <div className="sidebar-section-label">Resources</div>

      <NavItem
        label="CPU"
        value={`${metrics.cpu.load.toFixed(0)}%`}
        sub={`${metrics.cpu.cores} cores · ${metrics.cpu.speed} GHz`}
        color="var(--c-cpu)"
        sparkData={cpuSpark}
        active={selected === 'cpu'}
        onClick={() => onSelect('cpu')}
      />
      <NavItem
        label="Memory"
        value={`${metrics.memory.usagePercentage.toFixed(0)}%`}
        sub={`${(metrics.memory.used / 1e9).toFixed(1)} / ${(metrics.memory.total / 1e9).toFixed(1)} GB`}
        color="var(--c-mem)"
        sparkData={memSpark}
        active={selected === 'memory'}
        onClick={() => onSelect('memory')}
      />
      <NavItem
        label="Disk"
        value={`${maxDisk.toFixed(0)}%`}
        sub={`${metrics.disks.length} volumes`}
        color="var(--c-disk)"
        sparkData={diskSpark}
        active={selected === 'disk'}
        onClick={() => onSelect('disk')}
      />
      <NavItem
        label="Network"
        value={metrics.network ? formatBytes(netTotal) : 'N/A'}
        sub={metrics.network?.interface ?? '—'}
        color="var(--c-net)"
        sparkData={netSpark}
        active={selected === 'network'}
        onClick={() => onSelect('network')}
      />

      <div className="sidebar-section-label">System</div>

      <button
        className={`nav-item${selected === 'alerts' ? ' active' : ''}`}
        onClick={() => onSelect('alerts')}
        style={{ borderLeftColor: selected === 'alerts' ? 'var(--c-alert)' : 'transparent' }}
      >
        <div className="nav-item-top">
          <span className="nav-item-label">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: metrics.alerts.length > 0 ? 'var(--c-alert)' : 'var(--text-muted)', display: 'inline-block', flexShrink: 0 }} />
            Alerts
          </span>
          {metrics.alerts.length > 0 && (
            <span style={{
              background: 'var(--c-alert-dim)',
              color: 'var(--c-alert)',
              border: '1px solid rgba(248,81,73,0.25)',
              borderRadius: '9999px',
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '0.05rem 0.45rem',
            }}>
              {metrics.alerts.length}
            </span>
          )}
        </div>
        <span className="nav-item-sub">{metrics.alerts.length === 0 ? 'No events' : `${metrics.alerts.filter(a => a.level === 'danger').length} critical`}</span>
      </button>

      {/* OS info at bottom */}
      <div style={{ marginTop: 'auto', padding: '0.75rem 1rem', borderTop: '1px solid var(--panel-border)' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>{metrics.os.distro}</div>
          <div>Platform: {metrics.os.platform}</div>
          <div>Uptime: {formatUptime(metrics.os.uptime)}</div>
        </div>
      </div>
    </nav>
  );
}

function formatUptime(s: number) {
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const parts: string[] = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  return parts.join(' ') || '< 1m';
}
