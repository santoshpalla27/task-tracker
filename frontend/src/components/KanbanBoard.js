import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { motion } from 'framer-motion';
import TaskCard from './TaskCard';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const columns = {
  backlog: { title: 'Backlog', color: 'from-gray-500 to-gray-600' },
  inProgress: { title: 'In Progress', color: 'from-blue-500 to-blue-600' },
  inReview: { title: 'In Review', color: 'from-yellow-500 to-yellow-600' },
  done: { title: 'Done', color: 'from-green-500 to-green-600' },
};

const KanbanBoard = ({ taskCreated, setTaskCreated }) => {
  const [tasks, setTasks] = useState({
    backlog: [],
    inProgress: [],
    inReview: [],
    done: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/tasks`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Normalize task data
        const normalizedTasks = {};
        Object.keys(data.data).forEach(columnId => {
          normalizedTasks[columnId] = data.data[columnId].map(task => ({
            ...task,
            id: String(task._id),
            status: columnId, // Ensure status is set
          }));
        });
        setTasks(normalizedTasks);
      } else {
        throw new Error(data.error || 'Failed to fetch tasks');
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err.message || 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (taskCreated) {
      fetchTasks();
      setTaskCreated(null);
    }
  }, [taskCreated, setTaskCreated, fetchTasks]);

  const handleTaskDelete = useCallback((taskId) => {
    // Optimistically remove task from state
    setTasks(prevTasks => {
      const newTasks = { ...prevTasks };
      Object.keys(newTasks).forEach(columnId => {
        newTasks[columnId] = newTasks[columnId].filter(task => task.id !== taskId);
      });
      return newTasks;
    });
  }, []);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    console.log('Drag ended:', { source, destination, draggableId });

    if (!destination) {
      console.log('No destination, drag cancelled');
      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      console.log('Dropped in same position');
      return;
    }

    // Create copies of the columns
    const sourceColumn = [...tasks[source.droppableId]];
    const destColumn = source.droppableId === destination.droppableId 
      ? sourceColumn 
      : [...tasks[destination.droppableId]];

    // Find and remove the task from source
    const [movedTask] = sourceColumn.splice(source.index, 1);
    
    if (!movedTask) {
      console.error('Could not find task to move');
      return;
    }

    console.log('Moving task:', movedTask);

    // Add to destination
    destColumn.splice(destination.index, 0, movedTask);

    // Update state immediately (optimistic update)
    const newTasks = {
      ...tasks,
      [source.droppableId]: sourceColumn,
      [destination.droppableId]: destColumn,
    };
    
    setTasks(newTasks);

    // Update backend
    try {
      console.log('Updating backend for task:', draggableId);
      const response = await fetch(`${API_URL}/api/tasks/${draggableId}/move`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: destination.droppableId,
          order: destination.index,
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to update task');
      }
      
      console.log('Task moved successfully on backend');
    } catch (err) {
      console.error('Error updating task on backend:', err);
      // Revert on error
      fetchTasks();
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-4 text-4xl">❌</div>
          <p className="text-red-500 mb-4 font-semibold">{error}</p>
          <button
            onClick={fetchTasks}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6"
    >
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Project Board
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Drag and drop tasks between columns • Hover to delete
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchTasks}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </motion.button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(columns).map(([columnId, column]) => (
            <div key={columnId} className="flex flex-col">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`bg-gradient-to-r ${column.color} text-white rounded-lg p-4 mb-4 shadow-md`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{column.title}</h3>
                  <span className="bg-white bg-opacity-30 px-3 py-1 rounded-full text-sm font-bold">
                    {tasks[columnId]?.length || 0}
                  </span>
                </div>
              </motion.div>

              <Droppable droppableId={columnId}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 rounded-lg p-3 transition-all duration-200 min-h-[500px] ${
                      snapshot.isDraggingOver
                        ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-400 ring-opacity-50'
                        : 'bg-gray-50 dark:bg-gray-900/50'
                    }`}
                  >
                    {tasks[columnId]?.map((task, index) => (
                      <TaskCard 
                        key={task.id}
                        task={{
                          ...task,
                          date: task.createdAt 
                            ? new Date(task.createdAt).toLocaleDateString()
                            : new Date().toLocaleDateString()
                        }} 
                        index={index}
                        onDelete={handleTaskDelete}
                      />
                    ))}
                    {provided.placeholder}

                    {(!tasks[columnId] || tasks[columnId].length === 0) && (
                      <div className="flex flex-col items-center justify-center h-32 text-gray-400 dark:text-gray-600 text-sm">
                        <svg
                          className="w-12 h-12 mb-2 opacity-50"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                          />
                        </svg>
                        <p>Drop tasks here</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </motion.div>
  );
};

export default KanbanBoard;