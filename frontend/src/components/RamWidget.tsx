import { Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { SystemMetrics } from '../types';

interface Props {
  memory: SystemMetrics['memory'];
  history: SystemMetrics[];
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function RamWidget({ memory, history }: Props) {
  const isWarning = memory.usagePercentage > 80;
  const isDanger = memory.usagePercentage > 95;

  const color = isDanger ? 'var(--danger)' : isWarning ? 'var(--warning)' : 'var(--success)';

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">
          <Activity size={20} />
          <span>Memory Usage</span>
        </div>
        <div className={`panel-value ${isDanger ? 'danger' : isWarning ? 'warning' : ''}`}>
          {memory.usagePercentage.toFixed(1)}%
        </div>
      </div>
      
      <div className="text-secondary" style={{ fontSize: '0.875rem' }}>
        {formatBytes(memory.used)} active / {formatBytes(memory.buffcache)} cache / {formatBytes(memory.total)} total
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
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
              formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Usage']}
              cursor={{ stroke: 'var(--panel-border)', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area 
              type="monotone" 
              dataKey="memory.usagePercentage" 
              stroke={color} 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRam)" 
              isAnimationActive={false} 
              style={{ filter: `drop-shadow(0px 0px 6px ${color})` }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
