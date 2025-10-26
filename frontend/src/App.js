import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

// Components
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ConnectionStatus from './components/ConnectionStatus';

function App() {
  const [taskCreated, setTaskCreated] = useState(null);

  const handleTaskCreated = (task) => {
    setTaskCreated(task);
  };

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
                    <Header onTaskCreated={handleTaskCreated} />
                    <Dashboard taskCreated={taskCreated} setTaskCreated={setTaskCreated} />
                    <ConnectionStatus />
                  </div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
                    <Header onTaskCreated={handleTaskCreated} />
                    <Profile />
                    <ConnectionStatus />
                  </div>
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
                    <Header onTaskCreated={handleTaskCreated} />
                    <AdminDashboard />
                    <ConnectionStatus />
                  </div>
                </ProtectedRoute>
              }
            />

            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                  <div className="text-center">
                    <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">Page not found</p>
                    <a
                      href="/dashboard"
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Go to Dashboard
                    </a>
                  </div>
                </div>
              }
            />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;