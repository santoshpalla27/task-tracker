import React from 'react';
import { motion } from 'framer-motion';

const UserStats = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.total || 0,
      icon: '👥',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Active Users',
      value: stats?.active || 0,
      icon: '✅',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Inactive Users',
      value: stats?.inactive || 0,
      icon: '⏸️',
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
    {
      title: 'Admin Users',
      value: stats?.admins || 0,
      icon: '👑',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      title: 'Regular Users',
      value: stats?.regularUsers || 0,
      icon: '👤',
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    },
    {
      title: 'Recent Registrations',
      value: stats?.recentRegistrations || 0,
      icon: '🆕',
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
      subtitle: 'Last 30 days',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
          className={`${card.bgColor} rounded-xl p-6 border border-gray-200 dark:border-gray-700`}
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-lg flex items-center justify-center text-2xl`}
            >
              {card.icon}
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {card.value}
              </p>
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {card.title}
          </h3>
          {card.subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {card.subtitle}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default UserStats;