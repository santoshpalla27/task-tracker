import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ConnectionStatus from './components/ConnectionStatus';

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
        <Header />
        <Dashboard />
        <ConnectionStatus />
      </div>
    </ThemeProvider>
  );
}

export default App;