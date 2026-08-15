import React, { useState } from 'react';
import { Shield } from 'lucide-react';

interface Props {
  onLogin: (apiKey: string) => void;
}

export default function LoginWidget({ onLogin }: Props) {
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onLogin(key.trim());
    }
  };

  return (
    <div className="login-overlay">
      <div className="panel login-panel">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '1rem', 
            borderRadius: '50%', 
            background: 'rgba(59, 130, 246, 0.1)', 
            color: 'var(--accent)',
            marginBottom: '1rem'
          }}>
            <Shield size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Secure Access</h2>
          <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
            Enter your API Key to view live server metrics
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <input 
              type="password" 
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="API Key..."
              className="premium-input"
              autoFocus
            />
          </div>
          <button type="submit" className="premium-button">
            Connect
          </button>
        </form>
      </div>
    </div>
  );
}
