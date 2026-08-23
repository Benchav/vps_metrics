import { Wifi, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { SystemMetrics } from '@vps-metrics/shared';

interface Props { network: SystemMetrics['network']; history: SystemMetrics[]; }

function fmt(b: number) {
  if (!b || b === 0) return '0 B/s';
  const k = 1024, sizes = ['B/s','KB/s','MB/s','GB/s'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return parseFloat((b / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
function fmtTotal(b: number) {
  if (!b) return '0 B';
  const k = 1024, sizes = ['B','KB','MB','GB','TB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return parseFloat((b / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

const Tip = ({ active, payload }: any) =>
  active && payload?.length
    ? <div className="chart-tooltip" style={{ minWidth: '120px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
          <span style={{ color: 'var(--c-net)', fontSize: '0.8rem' }}>↓ {fmt(payload[0]?.value ?? 0)}</span>
          <span style={{ color: 'var(--c-cpu)', fontSize: '0.8rem' }}>↑ {fmt(payload[1]?.value ?? 0)}</span>
        </div>
      </div>
    : null;

function StatBox({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="detail-stat">
      <div className="detail-stat-label">{label}</div>
      <div className="detail-stat-value" style={{ color: color ?? 'var(--text-primary)' }}>{value}</div>
    </div>
  );
}

export default function NetworkWidget({ network, history }: Props) {
  if (!network) {
    return (
      <div className="detail-view">
        <div className="detail-header">
          <div className="detail-header-left">
            <div className="detail-header-icon" style={{ '--detail-color': 'var(--c-net)', '--detail-dim': 'var(--c-net-dim)' } as any}><Wifi size={18} /></div>
            <div><div className="detail-header-title">Network</div></div>
          </div>
        </div>
        <div className="detail-section" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
          No network interface data available.
        </div>
      </div>
    );
  }

  const rxVals = history.map(h => h.network?.rx_sec ?? 0);
  const txVals = history.map(h => h.network?.tx_sec ?? 0);
  const avgRx  = rxVals.length ? rxVals.reduce((a,b)=>a+b,0)/rxVals.length : 0;
  const avgTx  = txVals.length ? txVals.reduce((a,b)=>a+b,0)/txVals.length : 0;
  const maxRx  = Math.max(...rxVals);
  const maxTx  = Math.max(...txVals);

  return (
    <div className="detail-view">
      {/* Header */}
      <div className="detail-header" style={{ '--detail-color': 'var(--c-net)', '--detail-dim': 'var(--c-net-dim)' } as any}>
        <div className="detail-header-left">
          <div className="detail-header-icon"><Wifi size={18} /></div>
          <div>
            <div className="detail-header-title">Network</div>
            <div className="detail-header-subtitle">{network.interface}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Download</div>
            <div className="detail-header-value" style={{ color: 'var(--c-net)', fontSize: '1.8rem' }}>{fmt(network.rx_sec)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Upload</div>
            <div className="detail-header-value" style={{ color: 'var(--c-cpu)', fontSize: '1.8rem' }}>{fmt(network.tx_sec)}</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="detail-stat-row">
        <StatBox label="↓ Current RX" value={fmt(network.rx_sec)} color="var(--c-net)" />
        <StatBox label="↑ Current TX" value={fmt(network.tx_sec)} color="var(--c-cpu)" />
        <StatBox label="↓ Avg RX"     value={fmt(avgRx)} />
        <StatBox label="↑ Avg TX"     value={fmt(avgTx)} />
        <StatBox label="↓ Peak RX"    value={fmt(maxRx)} />
        <StatBox label="↑ Peak TX"    value={fmt(maxTx)} />
      </div>

      {/* Chart */}
      <div className="detail-section">
        <div className="detail-section-title">
          Throughput History —
          <span style={{ color: 'var(--c-net)', marginLeft: '0.5rem' }}>↓ Download</span>
          <span style={{ color: 'var(--c-cpu)', marginLeft: '0.75rem' }}>↑ Upload</span>
        </div>
        <div className="detail-chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 10, right: 4, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="rxGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--c-net)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--c-net)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="txGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--c-cpu)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--c-cpu)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="timestamp" hide />
              <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v=>fmt(v)} width={56} />
              <Tooltip content={<Tip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
              <Area type="monotone" dataKey="network.rx_sec" stroke="var(--c-net)" strokeWidth={2} fill="url(#rxGrad)" isAnimationActive={false} name="Download" />
              <Area type="monotone" dataKey="network.tx_sec" stroke="var(--c-cpu)" strokeWidth={2} fill="url(#txGrad)" isAnimationActive={false} name="Upload" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Session totals */}
      <div className="info-grid">
        <div className="info-row">
          <span className="info-row-label" style={{ display:'flex', gap:'0.4rem', alignItems:'center' }}>
            <ArrowDownToLine size={13} color="var(--c-net)" /> Session Received
          </span>
          <span className="info-row-value" style={{ color: 'var(--c-net)' }}>{fmtTotal(network.rx_bytes)}</span>
        </div>
        <div className="info-row">
          <span className="info-row-label" style={{ display:'flex', gap:'0.4rem', alignItems:'center' }}>
            <ArrowUpFromLine size={13} color="var(--c-cpu)" /> Session Sent
          </span>
          <span className="info-row-value" style={{ color: 'var(--c-cpu)' }}>{fmtTotal(network.tx_bytes)}</span>
        </div>
        <div className="info-row"><span className="info-row-label">Interface</span><span className="info-row-value">{network.interface}</span></div>
        <div className="info-row"><span className="info-row-label">Total Traffic (session)</span><span className="info-row-value">{fmtTotal(network.rx_bytes + network.tx_bytes)}</span></div>
      </div>
    </div>
  );
}
