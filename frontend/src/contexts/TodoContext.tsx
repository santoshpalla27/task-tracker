'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { api } from '@/lib/api'

export interface Todo {
  _id: string
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  assignee: {
    _id: string
    name: string
    email: string
  }
  category: 'personal' | 'work' | 'shopping' | 'health' | 'other'
  dueDate?: string
  completedAt?: string
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

interface TodoStats {
  total: number
  completed: number
  pending: number
  completionRate: number
  categoryStats: Array<{ _id: string; count: number }>
  priorityStats: Array<{ _id: string; count: number }>
}

interface TodoContextType {
  todos: Todo[]
  stats: TodoStats | null
  isLoading: boolean
  error: string | null
  fetchTodos: () => Promise<void>
  fetchStats: () => Promise<void>
  createTodo: (todoData: Partial<Todo>) => Promise<Todo>
  updateTodo: (id: string, todoData: Partial<Todo>) => Promise<Todo>
  toggleTodo: (id: string) => Promise<Todo>
  completeTodo: (id: string) => Promise<Todo>
  incompleteTodo: (id: string) => Promise<Todo>
  deleteTodo: (id: string) => Promise<void>
}

const TodoContext = createContext<TodoContextType | undefined>(undefined)

export const useTodos = () => {
  const context = useContext(TodoContext)
  if (context === undefined) {
    throw new Error('useTodos must be used within a TodoProvider')
  }
  return context
}

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>([])
  const [stats, setStats] = useState<TodoStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTodos = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await api.get('/todos')
      setTodos(response.data.todos)
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch todos')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      setError(null)
      const response = await api.get('/todos/stats')
      setStats(response.data)
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch todo stats')
    }
  }

  const createTodo = async (todoData: Partial<Todo>): Promise<Todo> => {
    try {
      setError(null)
      const response = await api.post('/todos', todoData)
      const newTodo = response.data.todo
      setTodos(prev => [newTodo, ...prev])
      await fetchStats() // Refresh stats
      return newTodo
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create todo'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const updateTodo = async (id: string, todoData: Partial<Todo>): Promise<Todo> => {
    try {
      setError(null)
      const response = await api.put(`/todos/${id}`, todoData)
      const updatedTodo = response.data.todo
      setTodos(prev => prev.map(todo => todo._id === id ? updatedTodo : todo))
      await fetchStats() // Refresh stats
      return updatedTodo
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update todo'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const toggleTodo = async (id: string): Promise<Todo> => {
    try {
      setError(null)
      const response = await api.patch(`/todos/${id}/toggle`)
      const updatedTodo = response.data.todo
      setTodos(prev => prev.map(todo => todo._id === id ? updatedTodo : todo))
      await fetchStats() // Refresh stats
      return updatedTodo
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to toggle todo'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const completeTodo = async (id: string): Promise<Todo> => {
    try {
      setError(null)
      const response = await api.patch(`/todos/${id}/complete`)
      const updatedTodo = response.data.todo
      setTodos(prev => prev.map(todo => todo._id === id ? updatedTodo : todo))
      await fetchStats() // Refresh stats
      return updatedTodo
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to complete todo'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const incompleteTodo = async (id: string): Promise<Todo> => {
    try {
      setError(null)
      const response = await api.patch(`/todos/${id}/incomplete`)
      const updatedTodo = response.data.todo
      setTodos(prev => prev.map(todo => todo._id === id ? updatedTodo : todo))
      await fetchStats() // Refresh stats
      return updatedTodo
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to mark todo as incomplete'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const deleteTodo = async (id: string): Promise<void> => {
    try {
      setError(null)
      await api.delete(`/todos/${id}`)
      setTodos(prev => prev.filter(todo => todo._id !== id))
      await fetchStats() // Refresh stats
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete todo'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  useEffect(() => {
    fetchTodos()
    fetchStats()
  }, [])

  const value = {
    todos,
    stats,
    isLoading,
    error,
    fetchTodos,
    fetchStats,
    createTodo,
    updateTodo,
    toggleTodo,
    completeTodo,
    incompleteTodo,
    deleteTodo
  }

  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  )
}
