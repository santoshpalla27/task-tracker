require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./src/config/database');
const errorHandler = require('./src/middleware/errorHandler');
const logger = require('./src/middleware/logger');

// Initialize express FIRST
const app = express();

// Middleware BEFORE routes
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(logger);
}

// Import routes AFTER middleware
const healthRoutes = require('./src/routes/health');
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const taskRoutes = require('./src/routes/tasks');
const todoRoutes = require('./src/routes/todos');

// Connect to database and seed users if needed
const initializeApp = async () => {
  try {
    await connectDB();
    
    // Check if users exist, if not, seed them
    const User = require('./src/models/User');
    const userCount = await User.countDocuments();
    
    if (userCount === 0) {
      console.log('🌱 No users found. Running initial seed...');
      const seedUsers = require('./src/scripts/seedUsers');
      await seedUsers();
    } else {
      console.log(`✅ Found ${userCount} existing users`);
    }
  } catch (error) {
    console.error('❌ Failed to initialize app:', error);
  }
};

initializeApp();

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Jira Dashboard API',
    version: process.env.API_VERSION || '1.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      tasks: '/api/tasks',
      todos: '/api/todos',
    },
  });
});

// Mount routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/todos', todoRoutes);

// Debug route to list all registered routes
app.get('/api/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods),
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods),
          });
        }
      });
    }
  });
  res.json({ routes });
});

// 404 handler
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;