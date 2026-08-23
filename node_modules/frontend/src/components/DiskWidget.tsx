import { HardDrive } from 'lucide-react';
import type { SystemMetrics } from '@vps-metrics/shared';

interface Props {
  disks: SystemMetrics['disks'];
  diskIO: SystemMetrics['diskIO'];
}

function fmt(b: number) {
  if (!b) return '0 B';
  const k = 1024, sizes = ['B','KB','MB','GB','TB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return parseFloat((b / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
function fmtSpeed(b: number) {
  if (!b || b === 0) return '0 B/s';
  const k = 1024, sizes = ['B/s','KB/s','MB/s','GB/s'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return parseFloat((b / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function StatBox({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="detail-stat">
      <div className="detail-stat-label">{label}</div>
      <div className="detail-stat-value" style={{ color: color ?? 'var(--text-primary)' }}>{value}</div>
    </div>
  );
}

function DiskRow({ disk }: { disk: SystemMetrics['disks'][number] }) {
  const isDanger  = disk.usePercentage > 95;
  const isWarning = disk.usePercentage > 85;
  const color = isDanger ? 'var(--c-alert)' : isWarning ? 'var(--warning)' : 'var(--c-disk)';
  const barClass = isDanger ? 'danger' : isWarning ? 'warning' : 'disk';

  return (
    <div style={{ padding: '1rem 1.2rem', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <HardDrive size={16} style={{ color }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.95rem' }}>{disk.fs}</span>
          <span className="info-pill">{disk.type}</span>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 700, color }}>{disk.usePercentage.toFixed(1)}%</span>
      </div>

      {/* Progress bar */}
      <div className="progress-bar-bg">
        <div className={`progress-bar-fill ${barClass}`} style={{ width: `${Math.min(disk.usePercentage, 100)}%` }} />
      </div>

      {/* Size info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.45rem', fontSize: '0.75rem' }}>
        <span style={{ fontFamily: 'var(--font-mono)', color }}>Used: {fmt(disk.used)}</span>
        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>Total: {fmt(disk.size)}</span>
      </div>

      {isDanger && (
        <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: 'var(--c-alert)', background: 'var(--c-alert-dim)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: '4px', padding: '0.25rem 0.6rem' }}>
          ⚠ Disk almost full
        </div>
      )}
    </div>
  );
}

export default function DiskWidget({ disks, diskIO }: Props) {
  const totalUsed = disks.reduce((a, d) => a + d.used, 0);
  const totalSize = disks.reduce((a, d) => a + d.size, 0);
  const maxPct    = Math.max(...disks.map(d => d.usePercentage), 0);

  return (
    <div className="detail-view">
      {/* Header */}
      <div className="detail-header" style={{ '--detail-color': 'var(--c-disk)', '--detail-dim': 'var(--c-disk-dim)' } as any}>
        <div className="detail-header-left">
          <div className="detail-header-icon"><HardDrive size={18} /></div>
          <div>
            <div className="detail-header-title">Storage</div>
            <div className="detail-header-subtitle">{disks.length} volumes · {fmt(totalSize)} total capacity</div>
          </div>
        </div>
        <div className="detail-header-value" style={{ color: 'var(--c-disk)' }}>{fmt(totalUsed)}</div>
      </div>

      {/* I/O stats row */}
      <div className="detail-stat-row">
        <StatBox label="Volumes"     value={String(disks.length)} />
        <StatBox label="Used (all)"  value={fmt(totalUsed)} color="var(--c-disk)" />
        <StatBox label="Total cap."  value={fmt(totalSize)} />
        <StatBox label="Highest %"   value={`${maxPct.toFixed(1)}%`} color={maxPct > 90 ? 'var(--c-alert)' : maxPct > 80 ? 'var(--warning)' : 'var(--c-disk)'} />
        {diskIO && <StatBox label="Read Speed"  value={fmtSpeed(diskIO.readSpeed)}  color="var(--c-net)" />}
        {diskIO && <StatBox label="Write Speed" value={fmtSpeed(diskIO.writeSpeed)} color="var(--c-mem)" />}
      </div>

      {/* I/O bar if available */}
      {diskIO && (
        <div className="detail-section">
          <div className="detail-section-title" style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Disk I/O</span>
            <span style={{ color: 'var(--c-net)', fontWeight: 400 }}>Read: {fmtSpeed(diskIO.readSpeed)}</span>
            <span style={{ color: 'var(--c-mem)', fontWeight: 400 }}>Write: {fmtSpeed(diskIO.writeSpeed)}</span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Read</div>
              <div className="progress-bar-bg">
                <div style={{ height: '100%', background: 'var(--c-net)', borderRadius: '9999px', width: `${Math.min((diskIO.readSpeed / 1e8) * 100, 100)}%`, transition: 'width 0.8s ease', boxShadow: '0 0 7px var(--c-net-glow)' }} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Write</div>
              <div className="progress-bar-bg">
                <div style={{ height: '100%', background: 'var(--c-mem)', borderRadius: '9999px', width: `${Math.min((diskIO.writeSpeed / 1e8) * 100, 100)}%`, transition: 'width 0.8s ease', boxShadow: '0 0 7px var(--c-mem-glow)' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disk list */}
      <div className="detail-section">
        <div className="detail-section-title">Volumes</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {disks.map((d, i) => <DiskRow key={`${d.fs}-${i}`} disk={d} />)}
        </div>
      </div>
    </div>
  );
}
