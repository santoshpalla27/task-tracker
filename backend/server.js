require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

// Import seed function
const seedUsers = require('./src/scripts/seedUsers');

// Route imports
const healthRoutes = require('./src/routes/health');
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
// Note: tasks and todos routes would need to be created separately
// const taskRoutes = require('./src/routes/tasks');
// const todoRoutes = require('./src/routes/todos');

// Initialize express
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database and seed users if needed
const initializeApp = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/jira_dashboard';
  
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('✅ MongoDB Connected');
  
  // Check if users exist, if not, seed them
  const User = require('./src/models/User');
  const userCount = await User.countDocuments();
  
  if (userCount === 0) {
    console.log('🌱 No users found. Running initial seed...');
    await seedUsers();
  }
};

initializeApp();

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
  // Simple logger for production (you could expand this later)
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Jira Dashboard API',
    version: process.env.API_VERSION || '1.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      // tasks: '/api/tasks',
      // todos: '/api/todos',
    },
  });
});

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
// app.use('/api/tasks', taskRoutes);
// app.use('/api/todos', todoRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handler (you may want to create a proper error handler middleware)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!',
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});