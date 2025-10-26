require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

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

const initialUsers = [
  {
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    isActive: true,
  },
  {
    username: 'john_doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'user',
    firstName: 'John',
    lastName: 'Doe',
    isActive: true,
  },
  {
    username: 'jane_smith',
    email: 'jane@example.com',
    password: 'password123',
    role: 'user',
    firstName: 'Jane',
    lastName: 'Smith',
    isActive: true,
  },
];

const seedUsers = async () => {
  try {
    await connectDB();

    // Check if users already exist
    const existingUsers = await User.countDocuments();
    
    if (existingUsers > 0) {
      console.log('⚠️  Users already exist. Skipping seed...');
      console.log('💡 To reseed, delete existing users first.');
      process.exit(0);
    }

    // Create users
    const createdUsers = await User.insertMany(initialUsers);

    console.log('✅ Users seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Initial Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Admin Account:');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');
    console.log('');
    console.log('👤 Regular Users:');
    console.log('   Email: john@example.com');
    console.log('   Password: password123');
    console.log('   ');
    console.log('   Email: jane@example.com');
    console.log('   Password: password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Total users created: ${createdUsers.length}`);

    process.exit(0);
  } catch (error) {
    console.error(`❌ Error seeding users: ${error.message}`);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedUsers();
}

module.exports = seedUsers;