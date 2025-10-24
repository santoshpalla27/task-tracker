const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Todo = require('../models/Todo');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// @route   GET /api/todos
// @desc    Get all todos with filtering and search
// @access  Private
router.get('/', [
  query('completed').optional().isBoolean(),
  query('category').optional().isIn(['personal', 'work', 'shopping', 'health', 'other']),
  query('priority').optional().isIn(['low', 'medium', 'high']),
  query('search').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      completed,
      category,
      priority,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {
      assignee: req.user._id,
      isArchived: false
    };

    if (completed !== undefined) filter.completed = completed === 'true';
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const todos = await Todo.find(filter)
      .populate('assignee', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Todo.countDocuments(filter);

    res.json({
      todos,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({
      message: 'Failed to fetch todos',
      error: error.message
    });
  }
});

// @route   GET /api/todos/stats
// @desc    Get todo statistics
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user._id;

    const [
      totalTodos,
      completedTodos,
      pendingTodos,
      categoryStats,
      priorityStats
    ] = await Promise.all([
      Todo.countDocuments({ assignee: userId, isArchived: false }),
      Todo.countDocuments({ assignee: userId, completed: true, isArchived: false }),
      Todo.countDocuments({ assignee: userId, completed: false, isArchived: false }),
      Todo.aggregate([
        { $match: { assignee: userId, isArchived: false } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      Todo.aggregate([
        { $match: { assignee: userId, isArchived: false } },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ])
    ]);

    const completionRate = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

    res.json({
      total: totalTodos,
      completed: completedTodos,
      pending: pendingTodos,
      completionRate: Math.round(completionRate * 100) / 100,
      categoryStats,
      priorityStats
    });
  } catch (error) {
    console.error('Get todo stats error:', error);
    res.status(500).json({
      message: 'Failed to fetch todo statistics',
      error: error.message
    });
  }
});

// @route   GET /api/todos/:id
// @desc    Get single todo
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      assignee: req.user._id
    }).populate('assignee', 'name email');

    if (!todo) {
      return res.status(404).json({
        message: 'Todo not found'
      });
    }

    res.json(todo);
  } catch (error) {
    console.error('Get todo error:', error);
    res.status(500).json({
      message: 'Failed to fetch todo',
      error: error.message
    });
  }
});

// @route   POST /api/todos
// @desc    Create new todo
// @access  Private
router.post('/', [
  body('title').trim().isLength({ min: 1, max: 200 }),
  body('description').optional().isLength({ max: 500 }),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('category').optional().isIn(['personal', 'work', 'shopping', 'health', 'other']),
  body('dueDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const todoData = {
      ...req.body,
      assignee: req.user._id
    };

    const todo = new Todo(todoData);
    await todo.save();

    await todo.populate('assignee', 'name email');

    res.status(201).json({
      message: 'Todo created successfully',
      todo
    });
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({
      message: 'Failed to create todo',
      error: error.message
    });
  }
});

// @route   PUT /api/todos/:id
// @desc    Update todo
// @access  Private
router.put('/:id', [
  body('title').optional().trim().isLength({ min: 1, max: 200 }),
  body('description').optional().isLength({ max: 500 }),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('category').optional().isIn(['personal', 'work', 'shopping', 'health', 'other']),
  body('dueDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, assignee: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('assignee', 'name email');

    if (!todo) {
      return res.status(404).json({
        message: 'Todo not found'
      });
    }

    res.json({
      message: 'Todo updated successfully',
      todo
    });
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({
      message: 'Failed to update todo',
      error: error.message
    });
  }
});

// @route   PATCH /api/todos/:id/toggle
// @desc    Toggle todo completion status
// @access  Private
router.patch('/:id/toggle', async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      assignee: req.user._id
    });

    if (!todo) {
      return res.status(404).json({
        message: 'Todo not found'
      });
    }

    await todo.toggleCompletion();
    await todo.populate('assignee', 'name email');

    res.json({
      message: `Todo ${todo.completed ? 'completed' : 'marked as incomplete'}`,
      todo
    });
  } catch (error) {
    console.error('Toggle todo error:', error);
    res.status(500).json({
      message: 'Failed to toggle todo',
      error: error.message
    });
  }
});

// @route   PATCH /api/todos/:id/complete
// @desc    Mark todo as completed
// @access  Private
router.patch('/:id/complete', async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      assignee: req.user._id
    });

    if (!todo) {
      return res.status(404).json({
        message: 'Todo not found'
      });
    }

    await todo.markAsCompleted();
    await todo.populate('assignee', 'name email');

    res.json({
      message: 'Todo marked as completed',
      todo
    });
  } catch (error) {
    console.error('Complete todo error:', error);
    res.status(500).json({
      message: 'Failed to complete todo',
      error: error.message
    });
  }
});

// @route   PATCH /api/todos/:id/incomplete
// @desc    Mark todo as incomplete
// @access  Private
router.patch('/:id/incomplete', async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      assignee: req.user._id
    });

    if (!todo) {
      return res.status(404).json({
        message: 'Todo not found'
      });
    }

    await todo.markAsIncomplete();
    await todo.populate('assignee', 'name email');

    res.json({
      message: 'Todo marked as incomplete',
      todo
    });
  } catch (error) {
    console.error('Incomplete todo error:', error);
    res.status(500).json({
      message: 'Failed to mark todo as incomplete',
      error: error.message
    });
  }
});

// @route   DELETE /api/todos/:id
// @desc    Delete todo (soft delete by archiving)
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, assignee: req.user._id },
      { $set: { isArchived: true } },
      { new: true }
    );

    if (!todo) {
      return res.status(404).json({
        message: 'Todo not found'
      });
    }

    res.json({
      message: 'Todo archived successfully'
    });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({
      message: 'Failed to delete todo',
      error: error.message
    });
  }
});

module.exports = router;
