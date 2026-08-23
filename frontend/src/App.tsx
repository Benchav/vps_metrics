import { useState } from 'react';
import { Activity, Cpu, MemoryStick, HardDrive, Wifi } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

import { useMetrics } from './hooks/useMetrics';
import SidebarNav from './components/SidebarNav';
import CpuWidget from './components/CpuWidget';
import RamWidget from './components/RamWidget';
import DiskWidget from './components/DiskWidget';
import NetworkWidget from './components/NetworkWidget';
import AlertsWidget from './components/AlertsWidget';
import type { SystemMetrics } from '@vps-metrics/shared';

type NavPanel = 'overview' | 'cpu' | 'memory' | 'disk' | 'network' | 'alerts';

// ── Mini summary card on overview ───────────────────────────
function SummaryCard({
  label, value, sub, color, sparkData, icon: Icon, onClick
}: {
  label: string; value: string; sub: string; color: string;
  sparkData: number[]; icon: React.ComponentType<any>; onClick: () => void;
}) {
  return (
    <button className="summary-card" onClick={onClick}>
      <div className="summary-card-label">
        <Icon size={11} color={color} />
        {label}
      </div>
      <div className="summary-card-value" style={{ color }}>{value}</div>
      <div style={{ height: 36, marginTop: '0.5rem' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparkData.map((v, i) => ({ v, i }))}>
            <defs>
              <linearGradient id={`ov-grad-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#ov-grad-${label})`} isAnimationActive={false} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="summary-card-sub">{sub}</div>
    </button>
  );
}

// ── Overview Panel ───────────────────────────────────────────
function OverviewPanel({ metrics, history, onNavigate }: {
  metrics: SystemMetrics; history: SystemMetrics[]; onNavigate: (p: NavPanel) => void;
}) {
  const fmt = (b: number) => {
    if (!b) return '0 B/s';
    const k = 1024, s = ['B/s','KB/s','MB/s','GB/s'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return parseFloat((b / Math.pow(k, i)).toFixed(1)) + ' ' + s[i];
  };
  const maxDisk = metrics.disks.reduce((a, d) => d.usePercentage > a ? d.usePercentage : a, 0);
  const netTotal = metrics.network ? metrics.network.rx_sec + metrics.network.tx_sec : 0;

  return (
    <div className="detail-view">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--panel-border)', border: '1px solid var(--panel-border)' }}>
        <SummaryCard
          label="CPU" value={`${metrics.cpu.load.toFixed(1)}%`}
          sub={`${metrics.cpu.cores} cores · ${metrics.cpu.speed} GHz`}
          color="var(--c-cpu)"
          sparkData={history.map(h => h.cpu.load)}
          icon={Cpu} onClick={() => onNavigate('cpu')}
        />
        <SummaryCard
          label="Memory" value={`${metrics.memory.usagePercentage.toFixed(1)}%`}
          sub={`${(metrics.memory.used/1e9).toFixed(1)} / ${(metrics.memory.total/1e9).toFixed(1)} GB`}
          color="var(--c-mem)"
          sparkData={history.map(h => h.memory.usagePercentage)}
          icon={MemoryStick} onClick={() => onNavigate('memory')}
        />
        <SummaryCard
          label="Disk" value={`${maxDisk.toFixed(1)}%`}
          sub={`${metrics.disks.length} volumes`}
          color="var(--c-disk)"
          sparkData={history.map(h => h.disks[0]?.usePercentage ?? 0)}
          icon={HardDrive} onClick={() => onNavigate('disk')}
        />
        <SummaryCard
          label="Network" value={fmt(netTotal)}
          sub={metrics.network?.interface ?? '—'}
          color="var(--c-net)"
          sparkData={history.map(h => h.network ? h.network.rx_sec + h.network.tx_sec : 0)}
          icon={Wifi} onClick={() => onNavigate('network')}
        />
      </div>

      {/* Mini charts 2×2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <CpuWidget cpu={metrics.cpu} history={history} />
        <RamWidget memory={metrics.memory} history={history} />
      </div>

      {/* Disk + Alerts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <DiskWidget disks={metrics.disks} diskIO={metrics.diskIO} />
        <AlertsWidget alerts={metrics.alerts} />
      </div>
    </div>
  );
}

// ── App Root ─────────────────────────────────────────────────
export default function App() {
  const { metrics, history, connected, updateAvailable } = useMetrics();
  const [panel, setPanel] = useState<NavPanel>('overview');

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="app-header">
        <div className="header-brand">
          <span className="header-logo-dot" />
          JoshBen-Monitoring
        </div>
        <div className="header-meta">
          {metrics && (
            <span className="mono text-muted" style={{ fontSize: '0.75rem' }}>
              {metrics.os.distro} {metrics.os.release}
            </span>
          )}
          <div className={`status-badge ${connected ? '' : 'disconnected'}`}>
            <div className={`status-dot ${connected ? 'connected' : ''}`} />
            {connected ? 'Live' : 'Connecting…'}
          </div>
        </div>
      </header>

      {/* Body */}
      {updateAvailable && (
        <div 
          onClick={() => window.location.reload()}
          style={{ 
            background: 'var(--c-alert-dim)', color: 'var(--c-alert)', padding: '0.6rem', textAlign: 'center', 
            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', borderBottom: '1px solid rgba(248,81,73,0.3)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem'
          }}
        >
          <Activity size={14} /> New update available! Click here to refresh the dashboard.
        </div>
      )}
      {!metrics ? (
        <div className="app-body">
          <div className="loading-screen">
            <Activity className="animate-pulse" size={36} style={{ color: 'var(--c-cpu)' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Connecting to server…</span>
          </div>
        </div>
      ) : (
        <div className="app-body">
          <SidebarNav
            metrics={metrics}
            history={history}
            selected={panel}
            onSelect={setPanel}
          />
          <main className="app-main">
            {panel === 'overview' && <OverviewPanel metrics={metrics} history={history} onNavigate={setPanel} />}
            {panel === 'cpu'      && <CpuWidget     cpu={metrics.cpu}         history={history} />}
            {panel === 'memory'   && <RamWidget     memory={metrics.memory}   history={history} />}
            {panel === 'disk'     && <DiskWidget    disks={metrics.disks}     diskIO={metrics.diskIO} />}
            {panel === 'network'  && <NetworkWidget network={metrics.network} history={history} />}
            {panel === 'alerts'   && <AlertsWidget  alerts={metrics.alerts} />}
          </main>
        </div>
      )}

      {/* Footer */}
      <footer className="app-footer">
        <span>Built by</span>
        <a href="https://joshuachavez.vercel.app" target="_blank" rel="noopener noreferrer" className="footer-link">
          Joshua Chavez
        </a>
      </footer>
    </div>
  );
}
