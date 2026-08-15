import { Cpu } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { SystemMetrics } from '../types';

interface Props {
  cpu: SystemMetrics['cpu'];
  history: SystemMetrics[];
}

export default function CpuWidget({ cpu, history }: Props) {
  const isWarning = cpu.load > 80;
  const isDanger = cpu.load > 95;

  const color = isDanger ? 'var(--danger)' : isWarning ? 'var(--warning)' : 'var(--accent)';

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">
          <Cpu size={20} />
          <span>CPU Usage</span>
        </div>
        <div className={`panel-value ${isDanger ? 'danger' : isWarning ? 'warning' : ''}`}>
          {cpu.load.toFixed(1)}%
        </div>
      </div>
      
      <div className="text-secondary" style={{ fontSize: '0.875rem' }}>
        {cpu.manufacturer} {cpu.brand} • {cpu.cores} Cores • {cpu.speed} GHz
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={color} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--panel-border)" vertical={false} opacity={0.5} />
            <XAxis dataKey="timestamp" hide />
            <YAxis domain={[0, 100]} stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(11, 15, 25, 0.8)', 
                backdropFilter: 'blur(10px)',
                border: '1px solid var(--panel-border)', 
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
              }}
              labelStyle={{ display: 'none' }}
              itemStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
              formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Load']}
              cursor={{ stroke: 'var(--panel-border)', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area 
              type="monotone" 
              dataKey="cpu.load" 
              stroke={color} 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorCpu)" 
              isAnimationActive={false} 
              style={{ filter: `drop-shadow(0px 0px 6px ${color})` }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
