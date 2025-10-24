import React from 'react';
import { motion } from 'framer-motion';
import { Draggable } from '@hello-pangea/dnd';

const TaskCard = ({ task, index }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  // Ensure we have a consistent ID
  const taskId = task._id || task.id;

  return (
    <Draggable draggableId={String(taskId)} index={index}>
      {(provided, snapshot) => (
        <motion.div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
          className={`bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 shadow-md cursor-move transition-all \${
            snapshot.isDragging ? 'rotate-3 shadow-2xl' : ''
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex-1">
              {task.title}
            </h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium \${getPriorityColor(
                task.priority
              )}`}
            >
              {task.priority}
            </span>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {task.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-wrap gap-1">
              {task.tags?.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
            </div>

            {task.assignee && (
              <div className="flex items-center space-x-1">
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  title={task.assignee}
                >
                  {task.assignee?.[0]?.toUpperCase() || '?'}
                </motion.div>
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>ID: {String(taskId).slice(-8)}</span>
            <span>{task.date}</span>
          </div>
        </motion.div>
      )}
    </Draggable>
  );
};

export default TaskCard;