import { Cpu } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { SystemMetrics } from '@vps-metrics/shared';

interface Props { cpu: SystemMetrics['cpu']; history: SystemMetrics[]; }

const C = 'var(--c-cpu)';
const Cdim = 'var(--c-cpu-dim)';

const Tip = ({ active, payload }: any) => active && payload?.length
  ? <div className="chart-tooltip">
      <span className="mono" style={{ color: C }}>{Number(payload[0].value).toFixed(1)}%</span>
      <span className="text-secondary" style={{ fontSize: '0.75rem', marginLeft: '0.4rem' }}>load</span>
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

export default function CpuWidget({ cpu, history }: Props) {
  const isDanger  = cpu.load > 95;
  const isWarning = cpu.load > 85;
  const color = isDanger ? 'var(--c-alert)' : isWarning ? 'var(--warning)' : C;

  const loads  = history.map(h => h.cpu.load);
  const avg    = loads.length ? loads.reduce((a, b) => a + b, 0) / loads.length : 0;
  const minL   = loads.length ? Math.min(...loads) : 0;
  const maxL   = loads.length ? Math.max(...loads) : 0;

  return (
    <div className="detail-view">
      {/* Header */}
      <div className="detail-header" style={{ '--detail-color': color, '--detail-dim': isDanger ? 'var(--c-alert-dim)' : isWarning ? 'var(--yellow-dim)' : Cdim } as any}>
        <div className="detail-header-left">
          <div className="detail-header-icon"><Cpu size={18} /></div>
          <div>
            <div className="detail-header-title">CPU</div>
            <div className="detail-header-subtitle">{cpu.manufacturer} {cpu.brand}</div>
          </div>
        </div>
        <div className="detail-header-value" style={{ color }}>{cpu.load.toFixed(1)}%</div>
      </div>

      {/* Alert Banner */}
      {isWarning && (
        <div className="alert-inline" style={{ borderColor: isDanger ? 'var(--c-alert)' : 'var(--warning)', background: isDanger ? 'var(--c-alert-dim)' : 'var(--yellow-dim)', color: isDanger ? 'var(--c-alert)' : 'var(--warning)' }}>
          ⚠ {isDanger ? 'Critical CPU load' : 'High CPU load'} — {cpu.load.toFixed(1)}% utilization
        </div>
      )}

      {/* Stats */}
      <div className="detail-stat-row">
        <StatBox label="Current"   value={`${cpu.load.toFixed(1)}%`}     color={color} />
        <StatBox label="Average"   value={`${avg.toFixed(1)}%`} />
        <StatBox label="Min"       value={`${minL.toFixed(1)}%`} />
        <StatBox label="Max (60s)" value={`${maxL.toFixed(1)}%`} />
        <StatBox label="User"      value={`${cpu.loadUser.toFixed(1)}%`} />
        <StatBox label="System"    value={`${cpu.loadSystem.toFixed(1)}%`} />
      </div>

      {/* Chart */}
      <div className="detail-section">
        <div className="detail-section-title">Utilization — last 60 seconds</div>
        <div className="detail-chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 10, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
                <filter id="cpuGlow">
                  <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={color} floodOpacity="0.6" />
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="timestamp" hide />
              <YAxis domain={[0,100]} stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v=>`${v}%`} width={30} />
              <Tooltip content={<Tip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
              <ReferenceLine y={85} stroke="var(--warning)"  strokeDasharray="4 4" strokeOpacity={0.45} label={{ value: '85%',  fill: 'var(--warning)',  fontSize: 9, position: 'insideTopRight', opacity: 0.6 }} />
              <ReferenceLine y={95} stroke="var(--c-alert)" strokeDasharray="4 4" strokeOpacity={0.45} label={{ value: '95%', fill: 'var(--c-alert)', fontSize: 9, position: 'insideTopRight', opacity: 0.6 }} />
              {maxL > 0 && <ReferenceLine y={maxL} stroke={color} strokeDasharray="6 3" strokeOpacity={0.5} label={{ value: `↑ ${maxL.toFixed(0)}%`, fill: color, fontSize: 9, position: 'insideTopLeft', opacity: 0.7 }} />}
              <Area type="monotone" dataKey="cpu.load" stroke={color} strokeWidth={2} fill="url(#cpuGrad)" isAnimationActive={false} filter="url(#cpuGlow)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CPU Details */}
      <div className="info-grid">
        <div className="info-row"><span className="info-row-label">Processor</span><span className="info-row-value">{cpu.brand}</span></div>
        <div className="info-row"><span className="info-row-label">Manufacturer</span><span className="info-row-value">{cpu.manufacturer}</span></div>
        <div className="info-row"><span className="info-row-label">Logical Cores</span><span className="info-row-value">{cpu.cores}</span></div>
        <div className="info-row"><span className="info-row-label">Physical Cores</span><span className="info-row-value">{cpu.physicalCores}</span></div>
        <div className="info-row"><span className="info-row-label">Base Speed</span><span className="info-row-value">{cpu.speed} GHz</span></div>
        <div className="info-row"><span className="info-row-label">Max Speed</span><span className="info-row-value">{cpu.speedMax} GHz</span></div>
      </div>
    </div>
  );
}
