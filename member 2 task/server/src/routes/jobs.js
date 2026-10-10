import { Router } from 'express';
import {
  createJob,
  getMyJobs,
  getJobById,
  updateJob,
  createJobSchema,
  updateJobSchema
} from '../controllers/jobs.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/', requireAuth, requireRole('customer', 'admin'), validate(createJobSchema), createJob);
router.get('/mine', requireAuth, requireRole('customer', 'admin'), getMyJobs);
router.get('/:id', requireAuth, getJobById);
router.patch('/:id', requireAuth, requireRole('customer', 'admin'), validate(updateJobSchema), updateJob);

export default router;
