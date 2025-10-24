'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Circle, 
  Calendar,
  Tag,
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react'
import { useTodos } from '@/contexts/TodoContext'
import { Todo } from '@/contexts/TodoContext'
import { formatDate, formatRelativeTime, getPriorityColor, getCategoryColor, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface FormData {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  category: 'personal' | 'work' | 'shopping' | 'health' | 'other'
  dueDate: string
}

export default function TodoList() {
  const { todos, stats, isLoading, createTodo, updateTodo, toggleTodo, deleteTodo } = useTodos()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterCompleted, setFilterCompleted] = useState<string>('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTodo, setEditingTodo] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<FormData>()

  const filteredTodos = todos.filter(todo => {
    const matchesSearch = todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         todo.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || todo.category === filterCategory
    const matchesPriority = filterPriority === 'all' || todo.priority === filterPriority
    const matchesCompleted = filterCompleted === 'all' || 
                           (filterCompleted === 'completed' && todo.completed) ||
                           (filterCompleted === 'pending' && !todo.completed)
    
    return matchesSearch && matchesCategory && matchesPriority && matchesCompleted
  })

  const onSubmit = async (data: FormData) => {
    try {
      const todoData = {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
      }

      if (editingTodo) {
        await updateTodo(editingTodo, todoData)
        toast.success('Todo updated successfully!')
        setEditingTodo(null)
      } else {
        await createTodo(todoData)
        toast.success('Todo created successfully!')
        setShowCreateForm(false)
      }
      
      reset()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save todo')
    }
  }

  const handleToggle = async (id: string) => {
    try {
      await toggleTodo(id)
    } catch (error: any) {
      toast.error(error.message || 'Failed to toggle todo')
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      try {
        await deleteTodo(id)
        toast.success('Todo deleted successfully!')
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete todo')
      }
    }
  }

  const startEditing = (todo: Todo) => {
    setValue('title', todo.title)
    setValue('description', todo.description || '')
    setValue('priority', todo.priority)
    setValue('category', todo.category)
    setValue('dueDate', todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : '')
    setEditingTodo(todo._id)
  }

  const cancelEditing = () => {
    setEditingTodo(null)
    setShowCreateForm(false)
    reset()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            To-Do List
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your personal tasks
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateForm(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Todo</span>
        </motion.button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.total}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Todos
            </div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-success-600">
              {stats.completed}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Completed
            </div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-warning-600">
              {stats.pending}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Pending
            </div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-primary-600">
              {stats.completionRate}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Completion Rate
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search todos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full"
          >
            <option value="all">All Categories</option>
            <option value="personal">Personal</option>
            <option value="work">Work</option>
            <option value="shopping">Shopping</option>
            <option value="health">Health</option>
            <option value="other">Other</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterCompleted}
            onChange={(e) => setFilterCompleted(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Create/Edit Form */}
      <AnimatePresence>
        {(showCreateForm || editingTodo) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingTodo ? 'Edit Todo' : 'Create New Todo'}
            </h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    {...register('title', { required: 'Title is required' })}
                    className="input w-full"
                    placeholder="Enter todo title"
                  />
                  {errors.title && (
                    <p className="text-danger-500 text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    {...register('category')}
                    className="input w-full"
                  >
                    <option value="personal">Personal</option>
                    <option value="work">Work</option>
                    <option value="shopping">Shopping</option>
                    <option value="health">Health</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={2}
                  className="input w-full resize-none"
                  placeholder="Enter todo description"
                />
              </div>

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
                  </select>
                </div>

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
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingTodo ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Todo List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredTodos.map((todo) => (
            <motion.div
              key={todo._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                'card p-4 transition-all duration-200',
                todo.completed && 'opacity-75 bg-gray-50 dark:bg-gray-700'
              )}
            >
              <div className="flex items-start space-x-3">
                {/* Checkbox */}
                <button
                  onClick={() => handleToggle(todo._id)}
                  className="mt-1 text-gray-400 hover:text-success-600 dark:hover:text-success-400 transition-colors"
                >
                  {todo.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-success-600" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={cn(
                        'font-medium text-gray-900 dark:text-white',
                        todo.completed && 'line-through text-gray-500 dark:text-gray-400'
                      )}>
                        {todo.title}
                      </h3>
                      
                      {todo.description && (
                        <p className={cn(
                          'text-sm text-gray-600 dark:text-gray-400 mt-1',
                          todo.completed && 'line-through'
                        )}>
                          {todo.description}
                        </p>
                      )}

                      <div className="flex items-center space-x-4 mt-2">
                        {/* Category */}
                        <span className={cn(
                          'badge badge-sm',
                          `badge-${getCategoryColor(todo.category)}`
                        )}>
                          {todo.category}
                        </span>

                        {/* Priority */}
                        <span className={cn(
                          'badge badge-sm',
                          `badge-${getPriorityColor(todo.priority)}`
                        )}>
                          {todo.priority}
                        </span>

                        {/* Due Date */}
                        {todo.dueDate && (
                          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(todo.dueDate)}</span>
                          </div>
                        )}

                        {/* Created Date */}
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {formatRelativeTime(todo.createdAt)}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => startEditing(todo)}
                        className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(todo._id)}
                        className="p-1 text-gray-400 hover:text-danger-600 dark:hover:text-danger-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredTodos.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No todos found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || filterCategory !== 'all' || filterPriority !== 'all' || filterCompleted !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first todo to get started'
              }
            </p>
            {!searchTerm && filterCategory === 'all' && filterPriority === 'all' && filterCompleted === 'all' && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn btn-primary"
              >
                Create Todo
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
