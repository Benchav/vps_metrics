import React from 'react';
import { Cpu } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SystemMetrics } from '../types';

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
          <AreaChart data={history}>
            <defs>
              <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--panel-border)" vertical={false} />
            <XAxis dataKey="timestamp" hide />
            <YAxis domain={[0, 100]} hide />
            <Tooltip 
              contentStyle={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: '8px' }}
              labelStyle={{ display: 'none' }}
              itemStyle={{ color: 'var(--text-primary)' }}
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Load']}
            />
            <Area type="monotone" dataKey="cpu.load" stroke={color} fillOpacity={1} fill="url(#colorCpu)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
