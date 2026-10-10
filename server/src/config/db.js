import mongoose from 'mongoose';
import { env } from './env.js';

let isConnected = false;

export const connectDB = async (retryCount = 3, delayMs = 2000) => {
  if (isConnected) return;

  for (let i = 0; i < retryCount; i++) {
    try {
      const conn = await mongoose.connect(env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000
      });
      isConnected = true;
      console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.error(`❌ MongoDB connection attempt ${i + 1}/${retryCount} failed: ${err.message}`);
      if (i < retryCount - 1) {
        console.log(`Retrying connection in ${delayMs / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  if (env.NODE_ENV !== 'test') {
    throw new Error('Could not connect to MongoDB. Please check your MONGO_URI, network connection, and Atlas IP allowlist.');
  }
};


export const disconnectDB = async () => {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
};
