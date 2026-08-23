import { AlertTriangle, Clock, ServerCrash } from 'lucide-react';
import type { SystemAlert } from '@vps-metrics/shared';

interface Props {
  alerts: SystemAlert[];
}

export default function AlertsWidget({ alerts }: Props) {
  return (
    <div className="panel" style={{ maxHeight: '400px', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header" style={{ marginBottom: '1rem', flexShrink: 0 }}>
        <div className="panel-title">
          <AlertTriangle size={20} className={alerts.length > 0 ? "text-warning animate-pulse" : "text-secondary"} />
          <span>System Alerts Log</span>
        </div>
        <div className="status-badge" style={{ background: alerts.length > 0 ? 'rgba(255, 171, 0, 0.1)' : 'rgba(255,255,255,0.05)', color: alerts.length > 0 ? 'var(--warning)' : 'var(--text-secondary)' }}>
          {alerts.length} Events
        </div>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
        {alerts.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', padding: '2rem 0' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
              <ServerCrash size={32} opacity={0.5} />
            </div>
            <p style={{ fontWeight: 500 }}>System is healthy</p>
            <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>No critical events logged recently.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {alerts.map((alert) => (
              <div 
                key={alert.id} 
                style={{ 
                  background: alert.level === 'danger' ? 'rgba(255, 86, 48, 0.1)' : 'rgba(255, 171, 0, 0.1)',
                  borderLeft: `3px solid var(--${alert.level})`,
                  padding: '0.75rem 1rem',
                  borderRadius: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, color: `var(--${alert.level})`, fontSize: '0.9rem' }}>
                    {alert.type.toUpperCase()} ALERT
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <Clock size={12} />
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  {alert.message}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
