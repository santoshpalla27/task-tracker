require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
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
  app.use(morgan('combined'));
}

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://mongodb:27017/jira_dashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

// Initialize app (seed users if needed)
const initializeApp = async () => {
  try {
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    
    if (userCount === 0) {
      console.log('🌱 No users found. Running initial seed...');
      const seedUsers = require('./scripts/seedUsers');
      await seedUsers();
    } else {
      console.log(`✅ Found ${userCount} existing users`);
    }
  } catch (error) {
    console.error('❌ Failed to initialize app:', error);
  }
};

// Wait for MongoDB connection before initializing
mongoose.connection.once('open', () => {
  initializeApp();
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Jira Dashboard API',
    version: process.env.API_VERSION || '1.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      tasks: '/api/tasks',
      todos: '/api/todos',
    },
  });
});

// Load routes
console.log('📦 Loading routes...');

// Health routes
const healthRoutes = require('./routes/health');
app.use('/api/health', healthRoutes);
console.log('✅ Health routes mounted at /api/health');

// Auth routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
console.log('✅ Auth routes mounted at /api/auth');

// User routes
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);
console.log('✅ User routes mounted at /api/users');

// Task routes
const taskRoutes = require('./routes/tasks');
app.use('/api/tasks', taskRoutes);
console.log('✅ Task routes mounted at /api/tasks');

// Todo routes
const todoRoutes = require('./routes/todos');
app.use('/api/todos', todoRoutes);
console.log('✅ Todo routes mounted at /api/todos');

// Debug route to list all routes
app.get('/api/routes', (req, res) => {
  const routes = [];
  
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // Routes registered directly on the app
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods).map(m => m.toUpperCase()),
      });
    } else if (middleware.name === 'router') {
      // Router middleware
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const path = middleware.regexp.source
            .replace('\/?', '')
            .replace('(?=\/|\$)', '')
            .replace(/\\\//g, '/')
            .replace(/\\^/g, '')
            .replace(/\\$/g, '');
          
          routes.push({
            path: path + handler.route.path,
            methods: Object.keys(handler.route.methods).map(m => m.toUpperCase()),
          });
        }
      });
    }
  });

  res.json({
    success: true,
    count: routes.length,
    routes: routes,
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await mongoose.connection.close();
  console.log('MongoDB connection closed.');
  process.exit(0);
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 API Routes: http://localhost:${PORT}/api/routes`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});

module.exports = app;
