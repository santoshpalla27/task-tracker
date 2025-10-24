const express = require('express');
const { query, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Todo = require('../models/Todo');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// @route   GET /api/analytics/overview
// @desc    Get overview analytics
// @access  Private
router.get('/overview', async (req, res) => {
  try {
    const userId = req.user._id;

    const [
      taskStats,
      todoStats,
      recentTasks,
      recentTodos,
      productivityData
    ] = await Promise.all([
      // Task statistics
      Task.aggregate([
        { $match: { assignee: userId, isArchived: false } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalHours: { $sum: '$actualHours' }
          }
        }
      ]),
      // Todo statistics
      Todo.aggregate([
        { $match: { assignee: userId, isArchived: false } },
        {
          $group: {
            _id: '$completed',
            count: { $sum: 1 }
          }
        }
      ]),
      // Recent tasks
      Task.find({ assignee: userId, isArchived: false })
        .sort({ updatedAt: -1 })
        .limit(5)
        .populate('assignee', 'name email'),
      // Recent todos
      Todo.find({ assignee: userId, isArchived: false })
        .sort({ updatedAt: -1 })
        .limit(5)
        .populate('assignee', 'name email'),
      // Productivity data (last 30 days)
      getProductivityData(userId)
    ]);

    // Process task stats
    const taskStatusCounts = {
      backlog: 0,
      'in-progress': 0,
      'in-review': 0,
      done: 0
    };
    let totalTaskHours = 0;

    taskStats.forEach(stat => {
      taskStatusCounts[stat._id] = stat.count;
      totalTaskHours += stat.totalHours || 0;
    });

    // Process todo stats
    const todoCounts = {
      completed: 0,
      pending: 0
    };

    todoStats.forEach(stat => {
      if (stat._id) {
        todoCounts.completed = stat.count;
      } else {
        todoCounts.pending = stat.count;
      }
    });

    const totalTodos = todoCounts.completed + todoCounts.pending;
    const todoCompletionRate = totalTodos > 0 ? (todoCounts.completed / totalTodos) * 100 : 0;

    res.json({
      tasks: {
        counts: taskStatusCounts,
        total: Object.values(taskStatusCounts).reduce((sum, count) => sum + count, 0),
        totalHours: totalTaskHours
      },
      todos: {
        counts: todoCounts,
        total: totalTodos,
        completionRate: Math.round(todoCompletionRate * 100) / 100
      },
      recent: {
        tasks: recentTasks,
        todos: recentTodos
      },
      productivity: productivityData
    });
  } catch (error) {
    console.error('Get overview analytics error:', error);
    res.status(500).json({
      message: 'Failed to fetch overview analytics',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/productivity
// @desc    Get productivity analytics for charts
// @access  Private
router.get('/productivity', [
  query('period').optional().isIn(['7d', '30d', '90d', '1y']),
  query('type').optional().isIn(['tasks', 'todos', 'both'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { period = '30d', type = 'both' } = req.query;
    const userId = req.user._id;

    const data = await getProductivityData(userId, period, type);

    res.json(data);
  } catch (error) {
    console.error('Get productivity analytics error:', error);
    res.status(500).json({
      message: 'Failed to fetch productivity analytics',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/priority-distribution
// @desc    Get priority distribution analytics
// @access  Private
router.get('/priority-distribution', async (req, res) => {
  try {
    const userId = req.user._id;

    const [taskPriorities, todoPriorities] = await Promise.all([
      Task.aggregate([
        { $match: { assignee: userId, isArchived: false } },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      Todo.aggregate([
        { $match: { assignee: userId, isArchived: false } },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      tasks: taskPriorities,
      todos: todoPriorities
    });
  } catch (error) {
    console.error('Get priority distribution error:', error);
    res.status(500).json({
      message: 'Failed to fetch priority distribution',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/completion-trends
// @desc    Get completion trends over time
// @access  Private
router.get('/completion-trends', [
  query('period').optional().isIn(['7d', '30d', '90d', '1y'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { period = '30d' } = req.query;
    const userId = req.user._id;

    const days = getDaysForPeriod(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [taskCompletions, todoCompletions] = await Promise.all([
      Task.aggregate([
        {
          $match: {
            assignee: userId,
            completedAt: { $gte: startDate },
            isArchived: false
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$completedAt' },
              month: { $month: '$completedAt' },
              day: { $dayOfMonth: '$completedAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]),
      Todo.aggregate([
        {
          $match: {
            assignee: userId,
            completedAt: { $gte: startDate },
            isArchived: false
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$completedAt' },
              month: { $month: '$completedAt' },
              day: { $dayOfMonth: '$completedAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ])
    ]);

    res.json({
      tasks: taskCompletions,
      todos: todoCompletions
    });
  } catch (error) {
    console.error('Get completion trends error:', error);
    res.status(500).json({
      message: 'Failed to fetch completion trends',
      error: error.message
    });
  }
});

// Helper function to get productivity data
async function getProductivityData(userId, period = '30d', type = 'both') {
  const days = getDaysForPeriod(period);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const data = {
    daily: [],
    weekly: [],
    monthly: []
  };

  if (type === 'both' || type === 'tasks') {
    const taskData = await Task.aggregate([
      {
        $match: {
          assignee: userId,
          createdAt: { $gte: startDate },
          isArchived: false
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          created: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    data.daily = taskData;
  }

  if (type === 'both' || type === 'todos') {
    const todoData = await Todo.aggregate([
      {
        $match: {
          assignee: userId,
          createdAt: { $gte: startDate },
          isArchived: false
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          created: { $sum: 1 },
          completed: {
            $sum: { $cond: ['$completed', 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    if (type === 'todos') {
      data.daily = todoData;
    } else {
      data.daily = data.daily.map(taskDay => {
        const todoDay = todoData.find(td => 
          td._id.year === taskDay._id.year &&
          td._id.month === taskDay._id.month &&
          td._id.day === taskDay._id.day
        );
        
        return {
          ...taskDay,
          todoCreated: todoDay ? todoDay.created : 0,
          todoCompleted: todoDay ? todoDay.completed : 0
        };
      });
    }
  }

  return data;
}

// Helper function to get days for period
function getDaysForPeriod(period) {
  const periods = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '1y': 365
  };
  return periods[period] || 30;
}

module.exports = router;
