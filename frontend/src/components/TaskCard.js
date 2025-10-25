import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import ConfirmDialog from './ConfirmDialog';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const TaskCard = ({ task, index, onDelete }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const getDeleteWarning = () => {
    switch (task.status) {
      case 'done':
        return {
          type: 'info',
          title: 'Delete Completed Task?',
          message: 'This task is marked as done. Are you sure you want to delete it?',
        };
      case 'inProgress':
        return {
          type: 'warning',
          title: 'Delete In-Progress Task?',
          message: '⚠️ Warning: This task is currently in progress. Deleting it may affect ongoing work. Are you sure?',
        };
      case 'inReview':
        return {
          type: 'warning',
          title: 'Delete Task Under Review?',
          message: '⚠️ Warning: This task is under review. Deleting it may affect the review process. Are you sure?',
        };
      case 'backlog':
      default:
        return {
          type: 'danger',
          title: 'Delete Task?',
          message: 'Are you sure you want to delete this task? This action cannot be undone.',
        };
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_URL}/api/tasks/${task.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        console.log('Task deleted successfully');
        if (onDelete) {
          onDelete(task.id);
        }
        setShowDeleteDialog(false);
      } else {
        throw new Error(data.error || 'Failed to delete task');
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      alert('Failed to delete task. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const taskId = task.id;
  const warningData = getDeleteWarning();

  return (
    <>
      <Draggable draggableId={taskId} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 shadow-md cursor-grab active:cursor-grabbing transition-all group ${
              snapshot.isDragging 
                ? 'shadow-2xl ring-2 ring-blue-400 rotate-2 scale-105 opacity-90' 
                : 'hover:shadow-lg hover:scale-[1.02]'
            }`}
          >
            {/* Header with Delete Button */}
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex-1 pr-2">
                {task.title}
              </h3>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getPriorityColor(
                    task.priority
                  )}`}
                >
                  {task.priority}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteDialog(true);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-500 hover:text-red-600"
                  title="Delete task"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {task.description}
            </p>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center flex-wrap gap-1">
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
                <div
                  className="w-7 h-7 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ml-2"
                  title={task.assignee}
                >
                  {task.assignee?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span className="font-mono">#{taskId.slice(-6)}</span>
              <span>{task.date}</span>
            </div>
          </div>
        )}
      </Draggable>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title={warningData.title}
        message={warningData.message}
        type={warningData.type}
        isLoading={isDeleting}
      />
    </>
  );
};

export default TaskCard;