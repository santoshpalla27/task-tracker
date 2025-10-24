'use client'

import React, { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { motion } from 'framer-motion'
import { Plus, Search, Filter, MoreHorizontal } from 'lucide-react'
import { useTasks } from '@/contexts/TaskContext'
import TaskCard from './TaskCard'
import TaskModal from './TaskModal'
import LoadingSpinner from './LoadingSpinner'
import { cn, getStatusColor } from '@/lib/utils'

const columns = [
  { id: 'backlog', title: 'Backlog', color: 'gray' },
  { id: 'in-progress', title: 'In Progress', color: 'primary' },
  { id: 'in-review', title: 'In Review', color: 'warning' },
  { id: 'done', title: 'Done', color: 'success' },
] as const

export default function KanbanBoard() {
  const { kanbanTasks, isLoading, updateTaskStatus, createTask } = useTasks()
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPriority, setFilterPriority] = useState<string>('all')

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    try {
      await updateTaskStatus(draggableId, destination.droppableId as any)
    } catch (error) {
      console.error('Failed to update task status:', error)
    }
  }

  const filteredTasks = (tasks: any[]) => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority
      return matchesSearch && matchesPriority
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Kanban Board
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your tasks with drag and drop
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          {/* Create Task Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </motion.button>
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {columns.map((column) => {
            const tasks = filteredTasks(kanbanTasks[column.id] || [])
            
            return (
              <div key={column.id} className="space-y-4">
                {/* Column Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={cn(
                      'w-3 h-3 rounded-full',
                      `bg-${column.color}-500`
                    )} />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {column.title}
                    </h3>
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-sm">
                      {tasks.length}
                    </span>
                  </div>
                </div>

                {/* Tasks */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        'min-h-[400px] p-2 rounded-lg border-2 border-dashed transition-colors',
                        snapshot.isDraggingOver
                          ? 'border-primary-300 bg-primary-50 dark:border-primary-600 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      )}
                    >
                      {tasks.map((task, index) => (
                        <Draggable
                          key={task._id}
                          draggableId={task._id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={cn(
                                'mb-3',
                                snapshot.isDragging && 'opacity-50 rotate-2 scale-105'
                              )}
                            >
                              <TaskCard
                                task={task}
                                onClick={() => setSelectedTask(task._id)}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {tasks.length === 0 && (
                        <div className="flex items-center justify-center h-32 text-gray-400 dark:text-gray-500">
                          <div className="text-center">
                            <div className="text-4xl mb-2">📋</div>
                            <p className="text-sm">No tasks</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            )
          })}
        </div>
      </DragDropContext>

      {/* Task Modal */}
      {selectedTask && (
        <TaskModal
          taskId={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {/* Create Task Modal */}
      {isCreateModalOpen && (
        <TaskModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={createTask}
        />
      )}
    </div>
  )
}
