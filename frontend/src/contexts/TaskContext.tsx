'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { api } from '@/lib/api'

export interface Task {
  _id: string
  title: string
  description?: string
  status: 'backlog' | 'in-progress' | 'in-review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignee: {
    _id: string
    name: string
    email: string
  }
  tags: string[]
  dueDate?: string
  estimatedHours?: number
  actualHours: number
  attachments: Array<{
    name: string
    url: string
    size: number
    uploadedAt: string
  }>
  comments: Array<{
    _id: string
    text: string
    author: {
      _id: string
      name: string
      email: string
    }
    createdAt: string
  }>
  isArchived: boolean
  completedAt?: string
  createdAt: string
  updatedAt: string
}

interface TaskContextType {
  tasks: Task[]
  kanbanTasks: {
    backlog: Task[]
    'in-progress': Task[]
    'in-review': Task[]
    done: Task[]
  }
  isLoading: boolean
  error: string | null
  fetchTasks: () => Promise<void>
  fetchKanbanTasks: () => Promise<void>
  createTask: (taskData: Partial<Task>) => Promise<Task>
  updateTask: (id: string, taskData: Partial<Task>) => Promise<Task>
  updateTaskStatus: (id: string, status: Task['status']) => Promise<Task>
  deleteTask: (id: string) => Promise<void>
  addComment: (taskId: string, text: string) => Promise<Task>
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export const useTasks = () => {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider')
  }
  return context
}

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [kanbanTasks, setKanbanTasks] = useState({
    backlog: [] as Task[],
    'in-progress': [] as Task[],
    'in-review': [] as Task[],
    done: [] as Task[]
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await api.get('/tasks')
      setTasks(response.data.tasks)
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch tasks')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchKanbanTasks = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await api.get('/tasks/kanban')
      setKanbanTasks(response.data)
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch kanban tasks')
    } finally {
      setIsLoading(false)
    }
  }

  const createTask = async (taskData: Partial<Task>): Promise<Task> => {
    try {
      setError(null)
      const response = await api.post('/tasks', taskData)
      const newTask = response.data.task
      setTasks(prev => [newTask, ...prev])
      await fetchKanbanTasks() // Refresh kanban view
      return newTask
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create task'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const updateTask = async (id: string, taskData: Partial<Task>): Promise<Task> => {
    try {
      setError(null)
      const response = await api.put(`/tasks/${id}`, taskData)
      const updatedTask = response.data.task
      setTasks(prev => prev.map(task => task._id === id ? updatedTask : task))
      await fetchKanbanTasks() // Refresh kanban view
      return updatedTask
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update task'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const updateTaskStatus = async (id: string, status: Task['status']): Promise<Task> => {
    try {
      setError(null)
      const response = await api.patch(`/tasks/${id}/status`, { status })
      const updatedTask = response.data.task
      setTasks(prev => prev.map(task => task._id === id ? updatedTask : task))
      await fetchKanbanTasks() // Refresh kanban view
      return updatedTask
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update task status'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const deleteTask = async (id: string): Promise<void> => {
    try {
      setError(null)
      await api.delete(`/tasks/${id}`)
      setTasks(prev => prev.filter(task => task._id !== id))
      await fetchKanbanTasks() // Refresh kanban view
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete task'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const addComment = async (taskId: string, text: string): Promise<Task> => {
    try {
      setError(null)
      const response = await api.post(`/tasks/${taskId}/comments`, { text })
      const updatedTask = response.data.task
      setTasks(prev => prev.map(task => task._id === taskId ? updatedTask : task))
      await fetchKanbanTasks() // Refresh kanban view
      return updatedTask
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to add comment'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  useEffect(() => {
    fetchKanbanTasks()
  }, [])

  const value = {
    tasks,
    kanbanTasks,
    isLoading,
    error,
    fetchTasks,
    fetchKanbanTasks,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    addComment
  }

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  )
}
