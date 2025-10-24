'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { 
  X, 
  Calendar, 
  Clock, 
  Tag, 
  MessageCircle, 
  Paperclip,
  Save,
  Trash2
} from 'lucide-react'
import { useTasks } from '@/contexts/TaskContext'
import { Task } from '@/contexts/TaskContext'
import { formatDate, formatDateTime, getPriorityColor, getStatusColor, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface TaskModalProps {
  taskId?: string
  onClose: () => void
  onCreate?: (taskData: Partial<Task>) => Promise<Task>
}

interface FormData {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'backlog' | 'in-progress' | 'in-review' | 'done'
  tags: string
  dueDate: string
  estimatedHours: number
  actualHours: number
}

export default function TaskModal({ taskId, onClose, onCreate }: TaskModalProps) {
  const { tasks, updateTask, deleteTask, addComment } = useTasks()
  const [isLoading, setIsLoading] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isAddingComment, setIsAddingComment] = useState(false)

  const task = taskId ? tasks.find(t => t._id === taskId) : null
  const isEditing = !!taskId && !!task
  const isCreating = !taskId && !!onCreate

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<FormData>({
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      priority: task?.priority || 'medium',
      status: task?.status || 'backlog',
      tags: task?.tags?.join(', ') || '',
      dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      estimatedHours: task?.estimatedHours || 0,
      actualHours: task?.actualHours || 0,
    }
  })

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        status: task.status,
        tags: task.tags?.join(', ') || '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        estimatedHours: task.estimatedHours || 0,
        actualHours: task.actualHours || 0,
      })
    }
  }, [task, reset])

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const taskData = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
      }

      if (isCreating && onCreate) {
        await onCreate(taskData)
        toast.success('Task created successfully!')
      } else if (isEditing) {
        await updateTask(taskId!, taskData)
        toast.success('Task updated successfully!')
      }
      
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save task')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!task) return
    
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(task._id)
        toast.success('Task deleted successfully!')
        onClose()
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete task')
      }
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !task) return

    setIsAddingComment(true)
    try {
      await addComment(task._id, newComment.trim())
      setNewComment('')
      toast.success('Comment added successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to add comment')
    } finally {
      setIsAddingComment(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isCreating ? 'Create New Task' : 'Edit Task'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                {...register('title', { required: 'Title is required' })}
                className="input w-full"
                placeholder="Enter task title"
              />
              {errors.title && (
                <p className="text-danger-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="input w-full resize-none"
                placeholder="Enter task description"
              />
            </div>

            {/* Priority and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  {...register('priority')}
                  className="input w-full"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  {...register('status')}
                  className="input w-full"
                >
                  <option value="backlog">Backlog</option>
                  <option value="in-progress">In Progress</option>
                  <option value="in-review">In Review</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <input
                {...register('tags')}
                className="input w-full"
                placeholder="Enter tags separated by commas"
              />
            </div>

            {/* Due Date and Hours */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Due Date
                </label>
                <input
                  {...register('dueDate')}
                  type="date"
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estimated Hours
                </label>
                <input
                  {...register('estimatedHours', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Actual Hours
                </label>
                <input
                  {...register('actualHours', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  className="input w-full"
                />
              </div>
            </div>

            {/* Comments Section (only for existing tasks) */}
            {isEditing && task && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Comments
                </h3>

                {/* Add Comment */}
                <div className="flex space-x-2 mb-4">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="input flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  />
                  <button
                    type="button"
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isAddingComment}
                    className="btn btn-primary"
                  >
                    {isAddingComment ? 'Adding...' : 'Add'}
                  </button>
                </div>

                {/* Comments List */}
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {task.comments && task.comments.length > 0 ? (
                    task.comments.map((comment) => (
                      <div key={comment._id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {comment.author.name}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDateTime(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {comment.text}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No comments yet
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
              <div>
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="btn btn-danger flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isLoading ? 'Saving...' : isCreating ? 'Create' : 'Save'}</span>
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
