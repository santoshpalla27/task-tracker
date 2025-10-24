import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

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
  const taskId = String(task._id || task.id);

  return (
    <Draggable draggableId={taskId} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 shadow-md cursor-move transition-all transform hover:scale-[1.02] ${
            snapshot.isDragging ? 'shadow-2xl rotate-2 scale-105' : ''
          }`}
          style={{
            ...provided.draggableProps.style,
            transition: snapshot.isDragging ? 'none' : 'all 0.2s ease',
          }}
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex-1 pr-2">
              {task.title}
            </h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getPriorityColor(
                task.priority
              )}`}
            >
              {task.priority}
            </span>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {task.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-wrap gap-1">
              {task.tags?.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
              {task.tags?.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{task.tags.length - 3}
                </span>
              )}
            </div>

            {task.assignee && (
              <div className="flex items-center space-x-1 ml-2">
                <div
                  className="w-7 h-7 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold hover:scale-110 transition-transform"
                  title={task.assignee}
                >
                  {task.assignee?.[0]?.toUpperCase() || '?'}
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span className="font-mono">#{taskId.slice(-6)}</span>
            <span>{task.date}</span>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;