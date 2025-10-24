import React, { useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import TaskCard from './TaskCard';

const initialTasks = {
  backlog: [
    {
      id: '1',
      title: 'Design landing page',
      description: 'Create mockups for the new landing page',
      priority: 'high',
      tags: ['design', 'UI'],
      assignee: 'John',
      date: '2024-01-15',
    },
    {
      id: '2',
      title: 'Setup authentication',
      description: 'Implement JWT authentication',
      priority: 'high',
      tags: ['backend', 'security'],
      assignee: 'Sarah',
      date: '2024-01-16',
    },
  ],
  inProgress: [
    {
      id: '3',
      title: 'Build API endpoints',
      description: 'Create REST API for user management',
      priority: 'medium',
      tags: ['backend', 'API'],
      assignee: 'Mike',
      date: '2024-01-14',
    },
  ],
  inReview: [
    {
      id: '4',
      title: 'Write unit tests',
      description: 'Add test coverage for core modules',
      priority: 'medium',
      tags: ['testing'],
      assignee: 'Emma',
      date: '2024-01-13',
    },
  ],
  done: [
    {
      id: '5',
      title: 'Setup project repository',
      description: 'Initialize Git repo and CI/CD',
      priority: 'low',
      tags: ['devops'],
      assignee: 'Alex',
      date: '2024-01-10',
    },
  ],
};

const columns = {
  backlog: { title: 'Backlog', color: 'from-gray-500 to-gray-600' },
  inProgress: { title: 'In Progress', color: 'from-blue-500 to-blue-600' },
  inReview: { title: 'In Review', color: 'from-yellow-500 to-yellow-600' },
  done: { title: 'Done', color: 'from-green-500 to-green-600' },
};

const KanbanBoard = () => {
  const [tasks, setTasks] = useState(initialTasks);

  const onDragEnd = (result) => {
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

    setTasks({
      ...tasks,
      [source.droppableId]: sourceColumn,
      ...(source.droppableId !== destination.droppableId && {
        [destination.droppableId]: destColumn,
      }),
    });
  };

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
                        <TaskCard key={task.id} task={task} index={index} />
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