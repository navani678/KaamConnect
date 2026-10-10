import { Router } from 'express';
import { createReport, createReportSchema } from '../controllers/reports.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/', requireAuth, validate(createReportSchema), createReport);

export default router;
