'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  MessageCircle, 
  Paperclip, 
  Tag,
  User
} from 'lucide-react'
import { Task } from '@/contexts/TaskContext'
import { formatDate, formatRelativeTime, getPriorityColor, getStatusColor, cn } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onClick: () => void
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const priorityColor = getPriorityColor(task.priority)
  const statusColor = getStatusColor(task.status)

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="card p-4 cursor-pointer hover:shadow-md transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
          {task.title}
        </h3>
        <div className={cn(
          'badge badge-sm',
          `badge-${priorityColor}`
        )}>
          {task.priority}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              +{task.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-3">
          {/* Due Date */}
          {task.dueDate && (
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          )}

          {/* Estimated Hours */}
          {task.estimatedHours && (
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{task.estimatedHours}h</span>
            </div>
          )}

          {/* Comments */}
          {task.comments && task.comments.length > 0 && (
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-3 h-3" />
              <span>{task.comments.length}</span>
            </div>
          )}

          {/* Attachments */}
          {task.attachments && task.attachments.length > 0 && (
            <div className="flex items-center space-x-1">
              <Paperclip className="w-3 h-3" />
              <span>{task.attachments.length}</span>
            </div>
          )}
        </div>

        {/* Status */}
        <div className={cn(
          'badge badge-sm',
          `badge-${statusColor}`
        )}>
          {task.status.replace('-', ' ')}
        </div>
      </div>

      {/* Progress Bar for In Progress Tasks */}
      {task.status === 'in-progress' && task.estimatedHours && task.actualHours > 0 && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{Math.round((task.actualHours / task.estimatedHours) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min((task.actualHours / task.estimatedHours) * 100, 100)}%`
              }}
            />
          </div>
        </div>
      )}

      {/* Created Date */}
      <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
        Created {formatRelativeTime(task.createdAt)}
      </div>
    </motion.div>
  )
}
