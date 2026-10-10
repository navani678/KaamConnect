import { Router } from 'express';
import authRouter from './auth.js';
import bookingsRouter from './bookings.js';
import jobsRouter from './jobs.js';
import metaRouter from './meta.js';
import reportsRouter from './reports.js';
import reviewsRouter from './reviews.js';
import uploadsRouter from './uploads.js';

const router = Router();

// Member 2 Routes (Alphabetical order per Section 3.3)
router.use('/auth', authRouter);
router.use('/bookings', bookingsRouter);
router.use('/jobs', jobsRouter);
router.use('/reports', reportsRouter);
router.use('/reviews', reviewsRouter);
router.use('/uploads', uploadsRouter);
router.use('/', metaRouter);

// Dynamic hook for Member 3 routes if added
try {
  const workersModule = await import('./workers.js').catch(() => null);
  if (workersModule && workersModule.default) {
    router.use('/workers', workersModule.default);
  }
} catch (e) {
  // Member 3 routes not yet created
}

export default router;
