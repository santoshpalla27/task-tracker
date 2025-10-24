import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ConnectionStatus = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [connections, setConnections] = useState({
    frontend: { status: 'online', lastCheck: new Date() },
    backend: { status: 'checking', lastCheck: null },
    database: { status: 'checking', lastCheck: null },
  });

  useEffect(() => {
    const checkConnections = async () => {
      try {
        const response = await fetch(`${API_URL}/api/health`);
        const data = await response.json();

        if (data.success) {
          setConnections({
            frontend: { status: 'online', lastCheck: new Date() },
            backend: { 
              status: data.backend === 'connected' ? 'online' : 'offline', 
              lastCheck: new Date(data.timestamp) 
            },
            database: { 
              status: data.database === 'connected' ? 'online' : 'offline', 
              lastCheck: new Date(data.timestamp) 
            },
          });
        } else {
          throw new Error('Health check failed');
        }
      } catch (error) {
        console.error('Connection check failed:', error);
        setConnections(prev => ({
          ...prev,
          backend: { status: 'offline', lastCheck: new Date() },
          database: { status: 'offline', lastCheck: new Date() },
        }));
      }
    };

    checkConnections();
    const interval = setInterval(checkConnections, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-red-500';
      case 'checking':
        return 'bg-yellow-500 animate-pulse';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return '✓';
      case 'offline':
        return '✗';
      case 'checking':
        return '⟳';
      default:
        return '?';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden"
        animate={{ width: isExpanded ? 300 : 60 }}
      >
        <div className="p-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-center w-full"
          >
            <div className="flex items-center space-x-2">
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center"
              >
                <span className="text-blue-600 dark:text-blue-300 text-xl">
                  {isExpanded ? '✕' : '⚡'}
                </span>
              </motion.div>
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Connection Status
                </motion.span>
              )}
            </div>
          </motion.button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-3"
              >
                {Object.entries(connections).map(([key, value]) => (
                  <motion.div
                    key={key}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <motion.div
                        animate={{
                          scale: value.status === 'checking' ? [1, 1.2, 1] : 1,
                        }}
                        transition={{
                          duration: 1,
                          repeat: value.status === 'checking' ? Infinity : 0,
                        }}
                        className={`w-3 h-3 rounded-full ${getStatusColor(value.status)}`}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {key}
                        </p>
                        {value.lastCheck && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {value.lastCheck.toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-lg">
                      {getStatusIcon(value.status)}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ConnectionStatus;