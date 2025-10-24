const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Task = require('../models/Task');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// @route   GET /api/tasks
// @desc    Get all tasks with filtering and search
// @access  Private
router.get('/', [
  query('status').optional().isIn(['backlog', 'in-progress', 'in-review', 'done']),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
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
      status,
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

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const tasks = await Task.find(filter)
      .populate('assignee', 'name email')
      .populate('comments.author', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(filter);

    res.json({
      tasks,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      message: 'Failed to fetch tasks',
      error: error.message
    });
  }
});

// @route   GET /api/tasks/kanban
// @desc    Get tasks organized by status for Kanban board
// @access  Private
router.get('/kanban', async (req, res) => {
  try {
    const tasks = await Task.find({
      assignee: req.user._id,
      isArchived: false
    }).populate('assignee', 'name email');

    // Group tasks by status
    const kanbanData = {
      backlog: tasks.filter(task => task.status === 'backlog'),
      'in-progress': tasks.filter(task => task.status === 'in-progress'),
      'in-review': tasks.filter(task => task.status === 'in-review'),
      done: tasks.filter(task => task.status === 'done')
    };

    res.json(kanbanData);
  } catch (error) {
    console.error('Get kanban data error:', error);
    res.status(500).json({
      message: 'Failed to fetch kanban data',
      error: error.message
    });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      assignee: req.user._id
    }).populate('assignee', 'name email')
      .populate('comments.author', 'name email');

    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      message: 'Failed to fetch task',
      error: error.message
    });
  }
});

// @route   POST /api/tasks
// @desc    Create new task
// @access  Private
router.post('/', [
  body('title').trim().isLength({ min: 1, max: 200 }),
  body('description').optional().isLength({ max: 1000 }),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('status').optional().isIn(['backlog', 'in-progress', 'in-review', 'done']),
  body('tags').optional().isArray(),
  body('dueDate').optional().isISO8601(),
  body('estimatedHours').optional().isInt({ min: 0, max: 1000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const taskData = {
      ...req.body,
      assignee: req.user._id
    };

    const task = new Task(taskData);
    await task.save();

    await task.populate('assignee', 'name email');

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      message: 'Failed to create task',
      error: error.message
    });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', [
  body('title').optional().trim().isLength({ min: 1, max: 200 }),
  body('description').optional().isLength({ max: 1000 }),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('status').optional().isIn(['backlog', 'in-progress', 'in-review', 'done']),
  body('tags').optional().isArray(),
  body('dueDate').optional().isISO8601(),
  body('estimatedHours').optional().isInt({ min: 0, max: 1000 }),
  body('actualHours').optional().isInt({ min: 0, max: 1000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, assignee: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('assignee', 'name email')
     .populate('comments.author', 'name email');

    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    res.json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      message: 'Failed to update task',
      error: error.message
    });
  }
});

// @route   PATCH /api/tasks/:id/status
// @desc    Update task status (for drag and drop)
// @access  Private
router.patch('/:id/status', [
  body('status').isIn(['backlog', 'in-progress', 'in-review', 'done']),
  body('position').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status } = req.body;
    const updateData = { status };

    // If marking as done, set completion date
    if (status === 'done') {
      updateData.completedAt = new Date();
    } else {
      updateData.completedAt = null;
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, assignee: req.user._id },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('assignee', 'name email');

    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    res.json({
      message: 'Task status updated successfully',
      task
    });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({
      message: 'Failed to update task status',
      error: error.message
    });
  }
});

// @route   POST /api/tasks/:id/comments
// @desc    Add comment to task
// @access  Private
router.post('/:id/comments', [
  body('text').trim().isLength({ min: 1, max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      assignee: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    await task.addComment(req.body.text, req.user._id);
    await task.populate('comments.author', 'name email');

    res.json({
      message: 'Comment added successfully',
      task
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      message: 'Failed to add comment',
      error: error.message
    });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task (soft delete by archiving)
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, assignee: req.user._id },
      { $set: { isArchived: true } },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    res.json({
      message: 'Task archived successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      message: 'Failed to delete task',
      error: error.message
    });
  }
});

module.exports = router;
