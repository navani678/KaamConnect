import mongoose from 'mongoose';
import { env } from './env.js';

let isConnected = false;

export const connectDB = async (retryCount = 5, delayMs = 3000) => {
  if (isConnected) return;

  for (let i = 0; i < retryCount; i++) {
    try {
      const conn = await mongoose.connect(env.MONGO_URI);
      isConnected = true;
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (err) {
      console.error(`MongoDB connection attempt ${i + 1}/${retryCount} failed: ${err.message}`);
      if (i < retryCount - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  if (env.NODE_ENV !== 'test') {
    console.error('All MongoDB connection attempts failed.');
  }
};

export const disconnectDB = async () => {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
};
