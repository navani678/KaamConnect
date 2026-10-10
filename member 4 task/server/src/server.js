import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 KaamConnect AI Server listening on http://localhost:${PORT}`);
    console.log(`🩺 Health check available at: http://localhost:${PORT}/api/health`);
  });
}

startServer();
