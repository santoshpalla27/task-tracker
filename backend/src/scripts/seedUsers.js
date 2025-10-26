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

const seedUsers = async () => {
  try {
    // Only connect if not already connected (for standalone execution)
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    // Check if users already exist
    const existingUsers = await User.countDocuments();
    
    if (existingUsers > 0) {
      console.log('⚠️  Users already exist. Skipping seed...');
      console.log('💡 To reseed, delete existing users first.');
      return; // Return instead of process.exit when called from server
    }

    // Create admin user - using .save() to trigger middleware
    console.log('Creating admin user...');
    const admin = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
    });
    await admin.save();
    console.log('✅ Admin user created');

    // Create user 1
    console.log('Creating user 1...');
    const user1 = new User({
      username: 'john_doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'user',
      firstName: 'John',
      lastName: 'Doe',
      isActive: true,
    });
    await user1.save();
    console.log('✅ User 1 created');

    // Create user 2
    console.log('Creating user 2...');
    const user2 = new User({
      username: 'jane_smith',
      email: 'jane@example.com',
      password: 'password123',
      role: 'user',
      firstName: 'Jane',
      lastName: 'Smith',
      isActive: true,
    });
    await user2.save();
    console.log('✅ User 2 created');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
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
    console.log(`📊 Total users created: 3`);

    // Only exit if run directly, not when imported
    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error(`❌ Error seeding users: ${error.message}`);
    console.error(error);
    if (require.main === module) {
      process.exit(1);
    }
  }
};

// Run if called directly
if (require.main === module) {
  seedUsers();
}

module.exports = seedUsers;