import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { env } from './config/env.js';
import apiRouter from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';

const app = express();

// Security and middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or matching CLIENT_URL
      if (!origin || origin === env.CLIENT_URL || env.NODE_ENV === 'development' || env.NODE_ENV === 'test') {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS'));
      }
    },
    credentials: true
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve local uploads statically
const uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR || './uploads');
app.use('/uploads', express.static(uploadDir));

// Mount API router
app.use('/api', apiRouter);

// Root health ping
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

// 404 and global error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
