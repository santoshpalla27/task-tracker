import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import TaskCard from './TaskCard';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const columns = {
  backlog: { title: 'Backlog', color: 'from-gray-500 to-gray-600' },
  inProgress: { title: 'In Progress', color: 'from-blue-500 to-blue-600' },
  inReview: { title: 'In Review', color: 'from-yellow-500 to-yellow-600' },
  done: { title: 'Done', color: 'from-green-500 to-green-600' },
};

const KanbanBoard = () => {
  const [tasks, setTasks] = useState({
    backlog: [],
    inProgress: [],
    inReview: [],
    done: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/tasks`);
      const data = await response.json();
      
      if (data.success) {
        setTasks(data.data);
      } else {
        setError('Failed to fetch tasks');
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const onDragEnd = async (result) => {
    const { source, destination } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceColumn = Array.from(tasks[source.droppableId]);
    const destColumn =
      source.droppableId === destination.droppableId
        ? sourceColumn
        : Array.from(tasks[destination.droppableId]);

    const [movedTask] = sourceColumn.splice(source.index, 1);
    destColumn.splice(destination.index, 0, movedTask);

    // Optimistic update
    setTasks({
      ...tasks,
      [source.droppableId]: sourceColumn,
      ...(source.droppableId !== destination.droppableId && {
        [destination.droppableId]: destColumn,
      }),
    });

    // Update backend
    try {
      await fetch(`${API_URL}/api/tasks/${movedTask._id}/move`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: destination.droppableId,
          order: destination.index,
        }),
      });
    } catch (err) {
      console.error('Error updating task:', err);
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
          <p className="text-red-500 mb-4">❌ {error}</p>
          <button
            onClick={fetchTasks}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Project Board
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Drag and drop tasks between columns
        </p>
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
                  <span className="bg-white bg-opacity-30 px-2 py-1 rounded-full text-sm">
                    {tasks[columnId]?.length || 0}
                  </span>
                </div>
              </motion.div>

              <Droppable droppableId={columnId}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 rounded-lg p-3 transition-all min-h-[500px] ${
                      snapshot.isDraggingOver
                        ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-400'
                        : 'bg-gray-50 dark:bg-gray-900/50'
                    }`}
                  >
                    <AnimatePresence>
                      {tasks[columnId]?.map((task, index) => (
                        <TaskCard 
                          key={task._id} 
                          task={{
                            ...task,
                            id: task._id,
                            date: new Date(task.createdAt).toLocaleDateString()
                          }} 
                          index={index} 
                        />
                      ))}
                    </AnimatePresence>
                    {provided.placeholder}

                    {tasks[columnId]?.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center h-32 text-gray-400 dark:text-gray-600 text-sm"
                      >
                        Drop tasks here
                      </motion.div>
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