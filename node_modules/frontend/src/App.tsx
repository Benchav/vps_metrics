import { Server, Activity, Database } from 'lucide-react';
import { useMetrics } from './hooks/useMetrics';
import CpuWidget from './components/CpuWidget';
import RamWidget from './components/RamWidget';
import DiskWidget from './components/DiskWidget';
import SystemWidget from './components/SystemWidget';
import AlertsWidget from './components/AlertsWidget';

function App() {
  const { metrics, history, connected } = useMetrics();

  return (
    <div className="dashboard-container">
      <header className="header">
        <h1>
          <Server className="text-accent" />
          VPS Monitoring Dashboard
        </h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="status-badge">
            <div className={`status-dot ${connected ? 'connected' : ''}`} />
            {connected ? 'Live' : 'Connecting...'}
          </div>
        </div>
      </header>

      {!metrics ? (
        <div className="loading-container">
          <Activity className="animate-pulse" size={48} />
          <p>Waiting for system data...</p>
        </div>
      ) : (
        <main>
          {/* Top level info */}
          <div className="grid-layout mb-4" style={{ marginBottom: '1.5rem' }}>
            <SystemWidget os={metrics.os} network={metrics.network} />
          </div>

          {/* Main Charts */}
          <div className="grid-layout large mb-4" style={{ marginBottom: '1.5rem' }}>
            <CpuWidget cpu={metrics.cpu} history={history} />
            <RamWidget memory={metrics.memory} history={history} />
          </div>

          {/* Disks & Alerts Grid */}
          <div className="grid-layout large mb-4" style={{ marginBottom: '1.5rem', gridTemplateColumns: '1fr 1fr' }}>
            <div className="panel">
              <div className="panel-header" style={{ marginBottom: '1rem' }}>
                <div className="panel-title">
                  <Database size={20} />
                  <span>Storage Devices</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                {metrics.disks.map((disk, idx) => (
                  <DiskWidget key={`${disk.fs}-${idx}`} disk={disk} />
                ))}
              </div>
            </div>

            <AlertsWidget alerts={metrics.alerts} />
          </div>
        </main>
      )}
    </div>
  );
}

export default App;
