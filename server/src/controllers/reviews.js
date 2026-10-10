import mongoose from 'mongoose';
import { z } from 'zod';
import { ApiError } from '../utils/ApiError.js';
import { ok } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Review, Booking, WorkerProfile } from '../services/modelProvider.js';

export const createReviewSchema = z.object({
  bookingId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), 'Invalid bookingId format'),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().max(500, 'Comment cannot exceed 500 characters').optional().default('')
});

export const createReview = asyncHandler(async (req, res, next) => {
  const { bookingId, rating, comment } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return next(new ApiError(404, 'NOT_FOUND', 'Booking not found'));
  }

  if (!booking.customer.equals(req.user._id)) {
    return next(new ApiError(403, 'FORBIDDEN', 'You can only review bookings made by you'));
  }

  if (booking.status !== 'completed') {
    return next(
      new ApiError(400, 'BOOKING_NOT_COMPLETED', 'Reviews can only be submitted for completed bookings')
    );
  }

  const existingReview = await Review.findOne({ booking: booking._id });
  if (existingReview) {
    return next(new ApiError(409, 'ALREADY_REVIEWED', 'A review has already been submitted for this booking'));
  }

  const review = await Review.create({
    booking: booking._id,
    customer: req.user._id,
    worker: booking.worker,
    workerProfile: booking.workerProfile,
    rating,
    comment
  });

  // Recompute worker's ratingAvg and ratingCount using aggregation
  const stats = await Review.aggregate([
    { $match: { workerProfile: booking.workerProfile } },
    {
      $group: {
        _id: '$workerProfile',
        ratingAvg: { $avg: '$rating' },
        ratingCount: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    const roundedAvg = Math.round(stats[0].ratingAvg * 10) / 10;
    await WorkerProfile.findByIdAndUpdate(booking.workerProfile, {
      ratingAvg: roundedAvg,
      ratingCount: stats[0].ratingCount
    });
  }

  return ok(res, review, 201);
});
