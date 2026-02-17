import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('\n⚠️  WARNING: Running without database connection!');
    console.log('📋 To fix this:');
    console.log('   1. Install MongoDB from: https://www.mongodb.com/try/download/community');
    console.log('   2. Or use MongoDB Atlas (free): https://www.mongodb.com/cloud/atlas/register');
    console.log('   3. Update MONGODB_URI in .env file\n');
    // Don't exit - let server run for testing
  }
};

export default connectDB;
