const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');

// Validation middleware
const validateTask = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('status')
    .optional()
    .isIn(['backlog', 'inProgress', 'inReview', 'done'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority'),
];

// @route   GET /api/tasks
// @desc    Get all tasks grouped by status
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const tasks = await Task.find().sort({ order: 1, createdAt: -1 });

    // Group tasks by status
    const groupedTasks = {
      backlog: [],
      inProgress: [],
      inReview: [],
      done: [],
    };

    tasks.forEach((task) => {
      const taskObj = task.toJSON();
      taskObj.id = task._id.toString();
      taskObj.date = taskObj.formattedDate;
      groupedTasks[task.status].push(taskObj);
    });

    res.json({
      success: true,
      data: groupedTasks,
      count: tasks.length,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }

    const taskObj = task.toJSON();
    taskObj.id = task._id.toString();
    taskObj.date = taskObj.formattedDate;

    res.json({
      success: true,
      data: taskObj,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/tasks
// @desc    Create new task
// @access  Public
router.post('/', validateTask, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const task = await Task.create(req.body);

    const taskObj = task.toJSON();
    taskObj.id = task._id.toString();
    taskObj.date = taskObj.formattedDate;

    res.status(201).json({
      success: true,
      data: taskObj,
      message: 'Task created successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Public
router.put('/:id', validateTask, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }

    const taskObj = task.toJSON();
    taskObj.id = task._id.toString();
    taskObj.date = taskObj.formattedDate;

    res.json({
      success: true,
      data: taskObj,
      message: 'Task updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/tasks/:id/move
// @desc    Move task to different status
// @access  Public
router.put('/:id/move', async (req, res, next) => {
  try {
    const { status, order } = req.body;

    if (!status || !['backlog', 'inProgress', 'inReview', 'done'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status',
      });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status, order: order || 0 },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }

    const taskObj = task.toJSON();
    taskObj.id = task._id.toString();
    taskObj.date = taskObj.formattedDate;

    res.json({
      success: true,
      data: taskObj,
      message: 'Task moved successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Public
router.delete('/:id', async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/tasks/bulk-update
// @desc    Bulk update tasks (for drag and drop reordering)
// @access  Public
router.post('/bulk-update', async (req, res, next) => {
  try {
    const { tasks } = req.body;

    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({
        success: false,
        error: 'Tasks array is required',
      });
    }

    // Update all tasks
    const bulkOps = tasks.map((task) => ({
      updateOne: {
        filter: { _id: task.id },
        update: { 
          status: task.status, 
          order: task.order 
        },
      },
    }));

    await Task.bulkWrite(bulkOps);

    res.json({
      success: true,
      message: 'Tasks updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;