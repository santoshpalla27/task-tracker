const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Todo = require('../models/Todo');

// Validation middleware
const validateTodo = [
  body('text').trim().notEmpty().withMessage('Todo text is required'),
];

// @route   GET /api/todos
// @desc    Get all todos
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const todos = await Todo.find().sort({ order: 1, createdAt: -1 });

    const todosData = todos.map((todo) => ({
      id: todo._id.toString(),
      text: todo.text,
      completed: todo.completed,
      createdAt: todo.createdAt.toISOString(),
      updatedAt: todo.updatedAt.toISOString(),
    }));

    res.json({
      success: true,
      data: todosData,
      count: todos.length,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/todos/:id
// @desc    Get single todo
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found',
      });
    }

    res.json({
      success: true,
      data: {
        id: todo._id.toString(),
        text: todo.text,
        completed: todo.completed,
        createdAt: todo.createdAt.toISOString(),
        updatedAt: todo.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/todos
// @desc    Create new todo
// @access  Public
router.post('/', validateTodo, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const todo = await Todo.create(req.body);

    res.status(201).json({
      success: true,
      data: {
        id: todo._id.toString(),
        text: todo.text,
        completed: todo.completed,
        createdAt: todo.createdAt.toISOString(),
      },
      message: 'Todo created successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/todos/:id
// @desc    Update todo
// @access  Public
router.put('/:id', validateTodo, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!todo) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found',
      });
    }

    res.json({
      success: true,
      data: {
        id: todo._id.toString(),
        text: todo.text,
        completed: todo.completed,
        updatedAt: todo.updatedAt.toISOString(),
      },
      message: 'Todo updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/todos/:id/toggle
// @desc    Toggle todo completion
// @access  Public
router.patch('/:id/toggle', async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found',
      });
    }

    todo.completed = !todo.completed;
    await todo.save();

    res.json({
      success: true,
      data: {
        id: todo._id.toString(),
        text: todo.text,
        completed: todo.completed,
        updatedAt: todo.updatedAt.toISOString(),
      },
      message: 'Todo toggled successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/todos/:id
// @desc    Delete todo
// @access  Public
router.delete('/:id', async (req, res, next) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);

    if (!todo) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found',
      });
    }

    res.json({
      success: true,
      message: 'Todo deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/todos
// @desc    Delete all completed todos
// @access  Public
router.delete('/', async (req, res, next) => {
  try {
    const result = await Todo.deleteMany({ completed: true });

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} completed todos`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;