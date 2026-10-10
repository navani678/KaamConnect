import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  acceptBooking,
  rejectBooking,
  counterBooking,
  confirmBooking,
  declineCounterBooking,
  cancelBooking,
  completeBooking,
  createBookingSchema,
  rejectBookingSchema,
  counterBookingSchema
} from '../controllers/bookings.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/', requireAuth, requireRole('customer', 'admin'), validate(createBookingSchema), createBooking);
router.get('/mine', requireAuth, getMyBookings);
router.get('/:id', requireAuth, getBookingById);
router.post('/:id/accept', requireAuth, requireRole('worker', 'admin'), acceptBooking);
router.post('/:id/reject', requireAuth, requireRole('worker', 'admin'), validate(rejectBookingSchema), rejectBooking);
router.post('/:id/counter', requireAuth, requireRole('worker', 'admin'), validate(counterBookingSchema), counterBooking);
router.post('/:id/confirm', requireAuth, requireRole('customer', 'admin'), confirmBooking);
router.post('/:id/decline-counter', requireAuth, requireRole('customer', 'admin'), declineCounterBooking);
router.post('/:id/cancel', requireAuth, requireRole('customer', 'admin'), cancelBooking);
router.post('/:id/complete', requireAuth, requireRole('customer', 'admin'), completeBooking);

export default router;
