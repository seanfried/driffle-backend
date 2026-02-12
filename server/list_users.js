const mongoose = require('mongoose');
const { User } = require('./models');
require('dotenv').config();

const listUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to MongoDB');

    const users = await User.find().select('email firstName lastName role');
    
    console.log('\n👥 Users List:');
    console.log('------------------------------------------------');
    users.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.email}) [${user.role}]`);
    });
    console.log('------------------------------------------------\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

listUsers();
