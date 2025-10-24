require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('../models/Task');
const Todo = require('../models/Todo');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

const sampleTasks = [
  {
    title: 'Design landing page',
    description: 'Create mockups for the new landing page',
    status: 'backlog',
    priority: 'high',
    tags: ['design', 'UI'],
    assignee: 'John',
    order: 0,
  },
  {
    title: 'Setup authentication',
    description: 'Implement JWT authentication',
    status: 'backlog',
    priority: 'high',
    tags: ['backend', 'security'],
    assignee: 'Sarah',
    order: 1,
  },
  {
    title: 'Build API endpoints',
    description: 'Create REST API for user management',
    status: 'inProgress',
    priority: 'medium',
    tags: ['backend', 'API'],
    assignee: 'Mike',
    order: 0,
  },
  {
    title: 'Write unit tests',
    description: 'Add test coverage for core modules',
    status: 'inReview',
    priority: 'medium',
    tags: ['testing'],
    assignee: 'Emma',
    order: 0,
  },
  {
    title: 'Setup project repository',
    description: 'Initialize Git repo and CI/CD',
    status: 'done',
    priority: 'low',
    tags: ['devops'],
    assignee: 'Alex',
    order: 0,
  },
  {
    title: 'Database schema design',
    description: 'Design MongoDB collections and relationships',
    status: 'done',
    priority: 'high',
    tags: ['database', 'backend'],
    assignee: 'Sarah',
    order: 1,
  },
  {
    title: 'Mobile responsive design',
    description: 'Make dashboard responsive for mobile devices',
    status: 'inProgress',
    priority: 'medium',
    tags: ['frontend', 'UI'],
    assignee: 'John',
    order: 1,
  },
];

const sampleTodos = [
  {
    text: 'Review pull requests',
    completed: false,
    order: 0,
  },
  {
    text: 'Update documentation',
    completed: false,
    order: 1,
  },
  {
    text: 'Team standup meeting',
    completed: true,
    order: 2,
  },
  {
    text: 'Code review for feature branch',
    completed: false,
    order: 3,
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Task.deleteMany({});
    await Todo.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert sample data
    await Task.insertMany(sampleTasks);
    await Todo.insertMany(sampleTodos);

    console.log('✅ Database seeded successfully');
    console.log(`📊 Created ${sampleTasks.length} tasks`);
    console.log(`✅ Created ${sampleTodos.length} todos`);

    process.exit(0);
  } catch (error) {
    console.error(`❌ Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();