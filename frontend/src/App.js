import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ConnectionStatus from './components/ConnectionStatus';

function App() {
  const [taskCreated, setTaskCreated] = useState(null);

  const handleTaskCreated = (task) => {
    setTaskCreated(task);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
        <Header onTaskCreated={handleTaskCreated} />
        <Dashboard taskCreated={taskCreated} setTaskCreated={setTaskCreated} />
        <ConnectionStatus />
      </div>
    </ThemeProvider>
  );
}

export default App;