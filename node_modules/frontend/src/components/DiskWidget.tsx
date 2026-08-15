import { HardDrive } from 'lucide-react';

interface Props {
  disk: {
    fs: string;
    type: string;
    size: number;
    used: number;
    usePercentage: number;
  };
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function DiskWidget({ disk }: Props) {
  const isWarning = disk.usePercentage > 80;
  const isDanger = disk.usePercentage > 95;

  let barClass = '';
  if (isDanger) barClass = 'danger';
  else if (isWarning) barClass = 'warning';

  return (
    <div style={{ 
      background: 'rgba(0,0,0,0.25)', 
      padding: '1.25rem', 
      borderRadius: '0.75rem',
      border: '1px solid rgba(255,255,255,0.05)',
      boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <HardDrive size={18} className="text-accent" style={{ filter: 'drop-shadow(0 0 5px var(--accent-glow))' }} />
          <span>{disk.fs}</span>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.5rem', borderRadius: '4px' }}>
          {disk.type}
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
        <span><strong style={{ color: 'var(--text-primary)' }}>{formatBytes(disk.used)}</strong> used</span>
        <span>{formatBytes(disk.size)} total</span>
      </div>
      
      <div className="progress-bar-bg">
        <div 
          className={`progress-bar-fill ${barClass}`} 
          style={{ width: `${Math.min(disk.usePercentage, 100)}%` }} 
        />
      </div>
      
      <div style={{ textAlign: 'right', fontSize: '0.8rem', marginTop: '0.4rem', fontWeight: 600, color: isDanger ? 'var(--danger)' : isWarning ? 'var(--warning)' : 'var(--text-primary)' }}>
        {disk.usePercentage.toFixed(1)}%
      </div>
    </div>
  );
}
