import mongoose from 'mongoose';
import { z } from 'zod';
import { ApiError } from '../utils/ApiError.js';
import { ok } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Report, Booking } from '../services/modelProvider.js';
import { REPORT_REASONS } from '../utils/constants.js';

export const createReportSchema = z.object({
  bookingId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), 'Invalid bookingId format'),
  reason: z.enum(REPORT_REASONS, {
    errorMap: () => ({ message: `Reason must be one of: ${REPORT_REASONS.join(', ')}` })
  }),
  details: z.string().min(5, 'Please provide more details regarding the report').max(2000)
});

export const createReport = asyncHandler(async (req, res, next) => {
  const { bookingId, reason, details } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return next(new ApiError(404, 'NOT_FOUND', 'Booking not found'));
  }

  const isCustomer = booking.customer.equals(req.user._id);
  const isWorker = booking.worker.equals(req.user._id);

  if (!isCustomer && !isWorker && req.user.role !== 'admin') {
    return next(new ApiError(403, 'FORBIDDEN', 'You can only report issues on bookings you participated in'));
  }

  // Determine who the report is filed against
  const againstUserId = isCustomer ? booking.worker : booking.customer;

  const report = await Report.create({
    booking: booking._id,
    reporter: req.user._id,
    against: againstUserId,
    reason,
    details,
    status: 'open'
  });

  return ok(res, report, 201);
});
