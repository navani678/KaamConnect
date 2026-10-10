import { Router } from 'express';
import { ok } from '../utils/response.js';
import { PROFESSIONS_META } from '../utils/constants.js';

const router = Router();

router.get('/health', (req, res) => {
  return ok(res, {
    status: 'ok',
    time: new Date().toISOString()
  });
});

router.get('/meta/professions', (req, res) => {
  return ok(res, PROFESSIONS_META);
});

export default router;
