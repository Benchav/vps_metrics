import { MemoryStick } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { SystemMetrics } from '@vps-metrics/shared';

interface Props { memory: SystemMetrics['memory']; history: SystemMetrics[]; }

const C = 'var(--c-mem)';

function fmt(b: number) {
  if (!b) return '0 B';
  const k = 1024, sizes = ['B','KB','MB','GB','TB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return parseFloat((b / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

const Tip = ({ active, payload }: any) => active && payload?.length
  ? <div className="chart-tooltip">
      <span className="mono" style={{ color: C }}>{Number(payload[0].value).toFixed(1)}%</span>
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

export default function RamWidget({ memory, history }: Props) {
  const isDanger  = memory.usagePercentage > 95;
  const isWarning = memory.usagePercentage > 85;
  const color = isDanger ? 'var(--c-alert)' : isWarning ? 'var(--warning)' : C;

  const vals  = history.map(h => h.memory.usagePercentage);
  const avg   = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  const minV  = vals.length ? Math.min(...vals) : 0;
  const maxV  = vals.length ? Math.max(...vals) : 0;

  const activeRatio = memory.total > 0 ? (memory.used / memory.total) * 100 : 0;
  const cacheRatio  = memory.total > 0 ? (memory.buffcache / memory.total) * 100 : 0;
  const freeRatio   = Math.max(0, 100 - activeRatio - cacheRatio);

  return (
    <div className="detail-view">
      {/* Header */}
      <div className="detail-header" style={{ '--detail-color': color, '--detail-dim': 'var(--c-mem-dim)' } as any}>
        <div className="detail-header-left">
          <div className="detail-header-icon"><MemoryStick size={18} /></div>
          <div>
            <div className="detail-header-title">Memory</div>
            <div className="detail-header-subtitle">{fmt(memory.total)} total · {fmt(memory.available)} available</div>
          </div>
        </div>
        <div className="detail-header-value" style={{ color }}>{memory.usagePercentage.toFixed(1)}%</div>
      </div>

      {/* Stats */}
      <div className="detail-stat-row">
        <StatBox label="In Use"    value={fmt(memory.used)}      color={color} />
        <StatBox label="Available" value={fmt(memory.available)} />
        <StatBox label="Cached"    value={fmt(memory.buffcache)} />
        <StatBox label="Total"     value={fmt(memory.total)} />
        <StatBox label="Swap Used" value={fmt(memory.swapUsed)} />
        <StatBox label="Swap Total"value={fmt(memory.swapTotal)} />
      </div>

      {/* Segmented bar */}
      <div className="detail-section">
        <div className="detail-section-title">Memory Composition</div>
        <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden', marginBottom: '0.6rem' }}>
          <div style={{ width: `${activeRatio}%`, background: color, transition: 'width 0.9s ease', boxShadow: `0 0 8px ${color}` }} />
          <div style={{ width: `${cacheRatio}%`,  background: 'rgba(255,255,255,0.15)', transition: 'width 0.9s ease' }} />
          <div style={{ width: `${freeRatio}%`,   background: 'rgba(255,255,255,0.04)' }} />
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
          {[
            { label: 'Active', pct: activeRatio, bg: color },
            { label: 'Cache/Buffer', pct: cacheRatio, bg: 'rgba(255,255,255,0.3)' },
            { label: 'Free', pct: freeRatio, bg: 'rgba(255,255,255,0.15)' },
          ].map(({ label, pct, bg }) => (
            <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: bg, display: 'inline-block', flexShrink: 0 }} />
              {label} · {pct.toFixed(1)}%
            </span>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="detail-section">
        <div className="detail-section-title">Usage History — last 60s · avg {avg.toFixed(1)}% · min {minV.toFixed(1)}% · max {maxV.toFixed(1)}%</div>
        <div className="detail-chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 10, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
                <filter id="memGlow">
                  <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={color} floodOpacity="0.6" />
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="timestamp" hide />
              <YAxis domain={[0,100]} stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v=>`${v}%`} width={30} />
              <Tooltip content={<Tip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
              <Area type="monotone" dataKey="memory.usagePercentage" stroke={color} strokeWidth={2} fill="url(#memGrad)" isAnimationActive={false} filter="url(#memGlow)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
