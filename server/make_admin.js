const mongoose = require('mongoose');
const { User } = require('./models');
require('dotenv').config();

const makeAdmin = async () => {
  try {
    // 1. Connect to DB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to MongoDB');

    // 2. Get email from command line
    const email = process.argv[2];
    if (!email) {
      console.error('❌ Please provide an email address');
      console.log('Usage: node make_admin.js <email>');
      process.exit(1);
    }

    // 3. Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.error(`❌ User not found with email: ${email}`);
      process.exit(1);
    }

    // 4. Update role
    user.role = 'admin'; // or 'superadmin' if you have that role
    await user.save();

    console.log(`✅ Success! User ${user.firstName} ${user.lastName} (${email}) is now an Admin.`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

makeAdmin();
