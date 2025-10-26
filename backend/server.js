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
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// MongoDB connection - using the existing database config
mongoose.connect(process.env.MONGO_URI || 'mongodb://mongodb:27017/jira_dashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
})
.catch(err => console.error('❌ MongoDB connection error:', err));

// Connect to database and seed users if needed
const initializeApp = async () => {
  try {
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

// Load routes
console.log('📦 Loading routes...');

try {
  const healthRoutes = require('./src/routes/health');
  app.use('/api/health', healthRoutes);
  console.log('✅ Health routes mounted at /api/health');
} catch (error) {
  console.error('❌ Error loading health routes:', error.message);
}

try {
  const authRoutes = require('./src/routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes mounted at /api/auth');
} catch (error) {
  console.error('❌ Error loading auth routes:', error.message);
}

try {
  const userRoutes = require('./src/routes/users');
  app.use('/api/users', userRoutes);
  console.log('✅ User routes mounted at /api/users');
} catch (error) {
  console.error('❌ Error loading user routes:', error.message);
}

try {
  const taskRoutes = require('./src/routes/tasks');
  app.use('/api/tasks', taskRoutes);
  console.log('✅ Task routes mounted at /api/tasks');
} catch (error) {
  console.error('❌ Error loading task routes:', error.message);
}

try {
  const todoRoutes = require('./src/routes/todos');
  app.use('/api/todos', todoRoutes);
  console.log('✅ Todo routes mounted at /api/todos');
} catch (error) {
  console.error('❌ Error loading todo routes:', error.message);
}

// List all routes (debug)
app.get('/api/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods),
      });
    } else if (middleware.name === 'router') {
      const routerPath = middleware.regexp.source
        .replace('\\/?', '')
        .replace('(?=\\/|\$)', '')
        .replace(/\\\//g, '/');
      
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const fullPath = routerPath + handler.route.path;
          routes.push({
            path: fullPath.replace(/\\/g, ''),
            methods: Object.keys(handler.route.methods),
          });
        }
      });
    }
  });
  res.json({ 
    success: true,
    count: routes.length,
    routes 
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`❌ 404 - Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error',
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Routes: http://localhost:${PORT}/api/routes`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

module.exports = app;