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
    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
          <HardDrive size={16} className="text-secondary" />
          <span>{disk.fs}</span>
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {disk.type}
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
        <span>{formatBytes(disk.used)} used</span>
        <span>{formatBytes(disk.size)} total</span>
      </div>
      
      <div className="progress-bar-bg">
        <div 
          className={`progress-bar-fill ${barClass}`} 
          style={{ width: `${Math.min(disk.usePercentage, 100)}%` }} 
        />
      </div>
      
      <div style={{ textAlign: 'right', fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
        {disk.usePercentage.toFixed(1)}%
      </div>
    </div>
  );
}
