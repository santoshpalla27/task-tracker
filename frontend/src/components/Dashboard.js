import React, { useState } from 'react';
import { motion } from 'framer-motion';
import KanbanBoard from './KanbanBoard';
import TodoList from './TodoList';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('kanban');

  const tabs = [
    { id: 'kanban', label: '📊 Kanban Board', icon: '📊' },
    { id: 'todo', label: '✅ To-Do List', icon: '✅' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex space-x-1 p-2">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'kanban' && <KanbanBoard />}
          {activeTab === 'todo' && <TodoList />}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;