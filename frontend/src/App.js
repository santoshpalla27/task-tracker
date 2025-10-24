import React, { useState, useEffect } from 'react';
import './App.css';

// Use environment variable with fallback
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [status, setStatus] = useState({
    frontend: 'connected',
    backend: 'checking...',
    database: 'checking...',
    timestamp: null
  });

  const [loading, setLoading] = useState(true);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/health`);
      const data = await response.json();
      
      setStatus({
        frontend: 'connected',
        backend: data.backend,
        database: data.database,
        timestamp: data.timestamp
      });
    } catch (error) {
      setStatus({
        frontend: 'connected',
        backend: 'disconnected',
        database: 'unknown',
        timestamp: null
      });
      console.error('Error fetching status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (statusValue) => {
    if (statusValue === 'connected') return '#4caf50';
    if (statusValue === 'checking...') return '#ff9800';
    return '#f44336';
  };

  return (
    <div className="App">
      <div className="container">
        <h1>🔌 Connection Status Monitor</h1>
        
        <div className="api-info">
          <span className="label">API:</span>
          <span className="value">{API_URL}</span>
        </div>
        
        <div className="status-grid">
          <div className="status-card">
            <div className="status-icon" style={{ backgroundColor: getStatusColor(status.frontend) }}>
              ⚛️
            </div>
            <h2>Frontend</h2>
            <p className={`status ${status.frontend}`}>{status.frontend}</p>
            <span className="tech">React</span>
          </div>

          <div className="status-card">
            <div className="status-icon" style={{ backgroundColor: getStatusColor(status.backend) }}>
              🚀
            </div>
            <h2>Backend</h2>
            <p className={`status ${status.backend}`}>{status.backend}</p>
            <span className="tech">Node.js</span>
          </div>

          <div className="status-card">
            <div className="status-icon" style={{ backgroundColor: getStatusColor(status.database) }}>
              🍃
            </div>
            <h2>Database</h2>
            <p className={`status ${status.database}`}>{status.database}</p>
            <span className="tech">MongoDB</span>
          </div>
        </div>

        {status.timestamp && (
          <div className="timestamp">
            Last checked: {new Date(status.timestamp).toLocaleString()}
          </div>
        )}

        <button onClick={checkStatus} disabled={loading} className="refresh-btn">
          {loading ? '🔄 Checking...' : '🔄 Refresh Status'}
        </button>
      </div>
    </div>
  );
}

export default App;