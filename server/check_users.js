const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { User } = require('./models');

dotenv.config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    const users = await User.find({}, 'email isEmailVerified role');
    console.log('Users found:', users);

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkUsers();