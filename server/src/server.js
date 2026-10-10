import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

const startServer = async () => {
  try {
    await connectDB();
    app.listen(env.PORT, () => {
      console.log(`KaamConnect Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      console.log(`API documentation base: http://localhost:${env.PORT}/api`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();
