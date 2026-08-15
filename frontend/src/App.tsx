import { useState, useEffect } from 'react';
import { Server, Activity, Database, LogOut } from 'lucide-react';
import { useMetrics } from './hooks/useMetrics';
import CpuWidget from './components/CpuWidget';
import RamWidget from './components/RamWidget';
import DiskWidget from './components/DiskWidget';
import SystemWidget from './components/SystemWidget';
import LoginWidget from './components/LoginWidget';

function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('vps_api_key') || '');
  const { metrics, history, connected, authError } = useMetrics(apiKey);

  const handleLogin = (key: string) => {
    localStorage.setItem('vps_api_key', key);
    setApiKey(key);
  };

  const handleLogout = () => {
    localStorage.removeItem('vps_api_key');
    setApiKey('');
  };

  // If there's an auth error after trying to connect, we might want to let them know
  useEffect(() => {
    if (authError) {
      // Small timeout so user sees it failed before clearing
      const timer = setTimeout(() => {
        handleLogout();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [authError]);

  if (!apiKey || authError) {
    return (
      <div className="dashboard-container">
        {authError && (
          <div style={{ background: 'var(--danger)', color: '#fff', padding: '1rem', borderRadius: '8px', textAlign: 'center', marginBottom: '1rem' }}>
            {authError}
          </div>
        )}
        <LoginWidget onLogin={handleLogin} />
      </div>
    );
  }

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
          <button onClick={handleLogout} className="logout-btn" title="Logout">
            <LogOut size={18} />
          </button>
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

          {/* Disks Grid */}
          <div className="panel">
            <div className="panel-header" style={{ marginBottom: '1rem' }}>
              <div className="panel-title">
                <Database size={20} />
                <span>Storage Devices</span>
              </div>
            </div>
            <div className="grid-layout">
              {metrics.disks.map((disk, idx) => (
                <DiskWidget key={`${disk.fs}-${idx}`} disk={disk} />
              ))}
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

export default App;
