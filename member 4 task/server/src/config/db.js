import mongoose from 'mongoose';

export async function connectDB(uri) {
  const mongoUri = uri || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.warn('⚠️  MONGODB_URI not provided. Skipping MongoDB connection for now.');
    return null;
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    // In dev, do not crash outright so health check still works
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return null;
  }
}
