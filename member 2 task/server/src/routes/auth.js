import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateMe,
  registerSchema,
  loginSchema,
  updateMeSchema
} from '../controllers/auth.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authRateLimiter, validate(registerSchema), register);
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.get('/me', requireAuth, getMe);
router.patch('/me', requireAuth, validate(updateMeSchema), updateMe);

export default router;
