const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('CRITICAL: MONGODB_URI is not defined in environment variables!');
      return;
    }
    
    // Log a masked version of the URI for debugging (hiding password)
    const maskedUri = uri.replace(/\/\/(.*):(.*)@/, '//***:***@');
    console.log(`Attempting to connect to: ${maskedUri}`);

    await mongoose.connect(uri);
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error(`❌ MongoDB Connection Error: ${err.message}`);
    console.error(err); // Log the full error stack
  }
};

module.exports = connectDB;
