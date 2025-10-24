import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const TodoList = ({ onConvertToTask }) => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [convertingId, setConvertingId] = useState(null);

  // Fetch todos from API
  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/todos`);
      const data = await response.json();
      
      if (data.success) {
        setTodos(data.data);
      } else {
        setError('Failed to fetch todos');
      }
    } catch (err) {
      console.error('Error fetching todos:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async (e) => {
    e.preventDefault();
    if (newTodo.trim()) {
      try {
        const response = await fetch(`${API_URL}/api/todos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: newTodo }),
        });
        
        const data = await response.json();
        
        if (data.success) {
          setTodos([...todos, data.data]);
          setNewTodo('');
        }
      } catch (err) {
        console.error('Error adding todo:', err);
        setError('Failed to add todo');
      }
    }
  };

  const toggleTodo = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/todos/${id}/toggle`, {
        method: 'PATCH',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTodos(
          todos.map((todo) =>
            todo.id === id ? data.data : todo
          )
        );
      }
    } catch (err) {
      console.error('Error toggling todo:', err);
    }
  };

  const deleteTodo = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/todos/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTodos(todos.filter((todo) => todo.id !== id));
      }
    } catch (err) {
      console.error('Error deleting todo:', err);
    }
  };

  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = async () => {
    if (editText.trim()) {
      try {
        const response = await fetch(`${API_URL}/api/todos/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: editText }),
        });
        
        const data = await response.json();
        
        if (data.success) {
          setTodos(
            todos.map((todo) =>
              todo.id === editingId ? data.data : todo
            )
          );
          setEditingId(null);
          setEditText('');
        }
      } catch (err) {
        console.error('Error updating todo:', err);
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const convertToTask = async (todo) => {
    setConvertingId(todo.id);
    try {
      const taskData = {
        title: todo.text,
        description: `Converted from todo list`,
        status: 'backlog',
        priority: 'medium',
        tags: ['from-todo'],
      };

      const response = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      const data = await response.json();

      if (data.success) {
        // Delete the todo after successful conversion
        await deleteTodo(todo.id);
        
        // Notify parent component
        if (onConvertToTask) {
          onConvertToTask(data.data);
        }
        
        // Show success message (you can add a toast notification here)
        console.log('Successfully converted to task!');
      }
    } catch (err) {
      console.error('Error converting to task:', err);
      alert('Failed to convert todo to task');
    } finally {
      setConvertingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading todos...</p>
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
            onClick={fetchTodos}
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              📝 To-Do List
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Keep track of your daily tasks or convert them to project tasks
            </p>
          </div>

          <form onSubmit={addTodo} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add a new task..."
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-medium shadow-md"
              >
                Add
              </motion.button>
            </div>
          </form>

          <AnimatePresence mode="popLayout">
            {todos.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12 text-gray-400 dark:text-gray-600"
              >
                <p className="text-lg">No tasks yet!</p>
                <p className="text-sm mt-2">Add your first task to get started</p>
              </motion.div>
            ) : (
              <div className="space-y-2">
                {todos.map((todo) => (
                  <motion.div
                    key={todo.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="group"
                  >
                    {editingId === todo.id ? (
                      <div className="flex gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                          autoFocus
                        />
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={saveEdit}
                          className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          ✓
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={cancelEdit}
                          className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                          ✕
                        </motion.button>
                      </div>
                    ) : (
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-all"
                      >
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.8 }}
                          onClick={() => toggleTodo(todo.id)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                            todo.completed
                              ? 'bg-green-500 border-green-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          {todo.completed && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-white text-sm"
                            >
                              ✓
                            </motion.span>
                          )}
                        </motion.button>

                        <span
                          className={`flex-1 text-gray-900 dark:text-white transition-all ${
                            todo.completed
                              ? 'line-through opacity-50'
                              : ''
                          }`}
                        >
                          {todo.text}
                        </span>

                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <motion.button
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.8 }}
                            onClick={() => convertToTask(todo)}
                            disabled={convertingId === todo.id}
                            className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors disabled:opacity-50"
                            title="Convert to Project Task"
                          >
                            {convertingId === todo.id ? (
                              <svg
                                className="w-5 h-5 animate-spin"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                            ) : (
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
                                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                              </svg>
                            )}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.8 }}
                            onClick={() => startEdit(todo)}
                            className="p-2 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded transition-colors"
                            title="Edit"
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
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.8 }}
                            onClick={() => deleteTodo(todo.id)}
                            className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Delete"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>

          {todos.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                <span>
                  {todos.filter((t) => !t.completed).length} active tasks
                </span>
                <span>
                  {todos.filter((t) => t.completed).length} completed
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TodoList;