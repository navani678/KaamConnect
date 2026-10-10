import { Router } from 'express';
import { createReview, createReviewSchema } from '../controllers/reviews.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/', requireAuth, requireRole('customer', 'admin'), validate(createReviewSchema), createReview);

export default router;
