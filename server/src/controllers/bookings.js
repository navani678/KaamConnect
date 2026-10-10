import mongoose from 'mongoose';
import { z } from 'zod';
import { ApiError } from '../utils/ApiError.js';
import { ok } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { transition } from '../services/bookingStateMachine.js';
import { Booking, JobRequest, WorkerProfile, User } from '../services/modelProvider.js';
import { TIME_SLOTS } from '../utils/constants.js';

export const createBookingSchema = z.object({
  jobId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), 'Invalid jobId format'),
  workerProfileId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), 'Invalid workerProfileId format'),
  proposedPrice: z.number().min(1, 'Proposed price must be at least ₹1'),
  scheduledDate: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val)),
  timeSlot: z.enum(TIME_SLOTS).optional().default('anytime'),
  scope: z.string().optional().default(''),
  message: z.string().optional().default('')
});

export const rejectBookingSchema = z.object({
  reason: z.string().optional().default('')
});

export const counterBookingSchema = z.object({
  price: z.number().min(1, 'Counter price must be at least ₹1'),
  message: z.string().optional().default('')
});

const sanitizeCounterpartPhone = (bookingObj, currentUserId) => {
  const isAcceptedOrDone = ['accepted', 'completed'].includes(bookingObj.status);
  if (isAcceptedOrDone) return bookingObj;

  const sanitized = { ...bookingObj };
  if (sanitized.customer && sanitized.customer.phone && !sanitized.customer._id.equals(currentUserId)) {
    sanitized.customer = { ...sanitized.customer, phone: undefined };
  }
  if (sanitized.worker && sanitized.worker.phone && !sanitized.worker._id.equals(currentUserId)) {
    sanitized.worker = { ...sanitized.worker, phone: undefined };
  }
  return sanitized;
};

export const createBooking = asyncHandler(async (req, res, next) => {
  const {
    jobId,
    workerProfileId,
    proposedPrice,
    scheduledDate,
    timeSlot,
    scope,
    message
  } = req.body;

  const job = await JobRequest.findById(jobId);
  if (!job) {
    return next(new ApiError(404, 'NOT_FOUND', 'Job not found'));
  }

  if (!job.customer.equals(req.user._id)) {
    return next(new ApiError(403, 'FORBIDDEN', 'You can only create booking requests for your own jobs'));
  }

  if (job.status !== 'open') {
    return next(
      new ApiError(409, 'JOB_NOT_OPEN', `Cannot book for a job that is already "${job.status}"`)
    );
  }

  const workerProfile = await WorkerProfile.findById(workerProfileId);
  if (!workerProfile || !workerProfile.isActive) {
    return next(new ApiError(404, 'WORKER_NOT_AVAILABLE', 'Worker profile not found or inactive'));
  }

  // Prevent duplicate active bookings
  const existingActive = await Booking.findOne({
    job: job._id,
    worker: workerProfile.user,
    status: { $in: ['pending', 'countered', 'accepted'] }
  });

  if (existingActive) {
    return next(
      new ApiError(
        409,
        'DUPLICATE_BOOKING',
        'An active booking request already exists between this job and worker'
      )
    );
  }

  const negotiation = [
    {
      by: 'customer',
      price: proposedPrice,
      message: message || '',
      at: new Date()
    }
  ];

  const booking = await Booking.create({
    job: job._id,
    customer: req.user._id,
    worker: workerProfile.user,
    workerProfile: workerProfile._id,
    scope,
    proposedPrice,
    finalPrice: proposedPrice,
    scheduledDate,
    timeSlot,
    negotiation,
    status: 'pending'
  });

  return ok(res, booking, 201);
});

export const getMyBookings = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const filter = {
    $or: [{ customer: req.user._id }, { worker: req.user._id }]
  };

  if (status) {
    filter.status = status;
  }

  const bookings = await Booking.find(filter)
    .sort({ updatedAt: -1 })
    .populate('job', 'title profession location addressText status')
    .populate('customer', 'name email phone avatarUrl language')
    .populate('worker', 'name email phone avatarUrl language')
    .populate('workerProfile', 'professions rateType rate ratingAvg ratingCount');

  const sanitizedBookings = bookings.map((b) =>
    sanitizeCounterpartPhone(b.toObject(), req.user._id)
  );

  return ok(res, sanitizedBookings);
});

export const getBookingById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError(400, 'INVALID_ID', 'Invalid booking ID format'));
  }

  const booking = await Booking.findById(id)
    .populate('job')
    .populate('customer', 'name email phone avatarUrl language')
    .populate('worker', 'name email phone avatarUrl language')
    .populate('workerProfile');

  if (!booking) {
    return next(new ApiError(404, 'NOT_FOUND', 'Booking not found'));
  }

  const isCustomer = booking.customer._id.equals(req.user._id);
  const isWorker = booking.worker._id.equals(req.user._id);
  const isAdmin = req.user.role === 'admin';

  if (!isCustomer && !isWorker && !isAdmin) {
    return next(new ApiError(403, 'FORBIDDEN', 'You do not have permission to view this booking'));
  }

  const sanitized = sanitizeCounterpartPhone(booking.toObject(), req.user._id);
  return ok(res, sanitized);
});

export const acceptBooking = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const booking = await Booking.findById(id);
  if (!booking) {
    return next(new ApiError(404, 'NOT_FOUND', 'Booking not found'));
  }

  if (!booking.worker.equals(req.user._id)) {
    return next(new ApiError(403, 'FORBIDDEN', 'Only the assigned worker can accept this booking'));
  }

  const nextStatus = transition(booking.status, 'accept', 'worker');

  booking.status = nextStatus;
  booking.finalPrice = booking.proposedPrice;
  await booking.save();

  // Mark job as booked and assign selected booking
  await JobRequest.findByIdAndUpdate(booking.job, {
    status: 'booked',
    selectedBooking: booking._id
  });

  // Auto-reject other pending / countered bookings for this job
  await Booking.updateMany(
    {
      job: booking.job,
      _id: { $ne: booking._id },
      status: { $in: ['pending', 'countered'] }
    },
    {
      status: 'rejected',
      rejectionReason: 'Job booked with another worker'
    }
  );

  return ok(res, booking);
});

export const rejectBooking = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;

  const booking = await Booking.findById(id);
  if (!booking) {
    return next(new ApiError(404, 'NOT_FOUND', 'Booking not found'));
  }

  if (!booking.worker.equals(req.user._id)) {
    return next(new ApiError(403, 'FORBIDDEN', 'Only the assigned worker can reject this booking'));
  }

  const nextStatus = transition(booking.status, 'reject', 'worker');

  booking.status = nextStatus;
  booking.rejectionReason = reason || '';
  await booking.save();

  return ok(res, booking);
});

export const counterBooking = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { price, message } = req.body;

  const booking = await Booking.findById(id);
  if (!booking) {
    return next(new ApiError(404, 'NOT_FOUND', 'Booking not found'));
  }

  if (!booking.worker.equals(req.user._id)) {
    return next(new ApiError(403, 'FORBIDDEN', 'Only the assigned worker can counter this booking'));
  }

  const nextStatus = transition(booking.status, 'counter', 'worker');

  booking.status = nextStatus;
  booking.negotiation.push({
    by: 'worker',
    price,
    message: message || '',
    at: new Date()
  });

  await booking.save();

  return ok(res, booking);
});

export const confirmBooking = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const booking = await Booking.findById(id);
  if (!booking) {
    return next(new ApiError(404, 'NOT_FOUND', 'Booking not found'));
  }

  if (!booking.customer.equals(req.user._id)) {
    return next(new ApiError(403, 'FORBIDDEN', 'Only the customer can confirm the counter offer'));
  }

  const nextStatus = transition(booking.status, 'confirm', 'customer');

  const lastCounter = [...booking.negotiation].reverse().find((n) => n.by === 'worker');
  booking.finalPrice = lastCounter ? lastCounter.price : booking.proposedPrice;
  booking.status = nextStatus;

  await booking.save();

  // Mark job as booked
  await JobRequest.findByIdAndUpdate(booking.job, {
    status: 'booked',
    selectedBooking: booking._id
  });

  // Auto-reject other pending / countered bookings for this job
  await Booking.updateMany(
    {
      job: booking.job,
      _id: { $ne: booking._id },
      status: { $in: ['pending', 'countered'] }
    },
    {
      status: 'rejected',
      rejectionReason: 'Job booked with another worker'
    }
  );

  return ok(res, booking);
});

export const declineCounterBooking = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const booking = await Booking.findById(id);
  if (!booking) {
    return next(new ApiError(404, 'NOT_FOUND', 'Booking not found'));
  }

  if (!booking.customer.equals(req.user._id)) {
    return next(new ApiError(403, 'FORBIDDEN', 'Only the customer can decline the counter offer'));
  }

  const nextStatus = transition(booking.status, 'decline-counter', 'customer');

  booking.status = nextStatus;
  await booking.save();

  return ok(res, booking);
});

export const cancelBooking = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const booking = await Booking.findById(id);
  if (!booking) {
    return next(new ApiError(404, 'NOT_FOUND', 'Booking not found'));
  }

  if (!booking.customer.equals(req.user._id)) {
    return next(new ApiError(403, 'FORBIDDEN', 'Only the customer can cancel this booking'));
  }

  const nextStatus = transition(booking.status, 'cancel', 'customer');

  const wasAccepted = booking.status === 'accepted';
  booking.status = nextStatus;
  await booking.save();

  // If the booking was accepted, reopen the job
  if (wasAccepted) {
    await JobRequest.findByIdAndUpdate(booking.job, {
      status: 'open',
      $unset: { selectedBooking: 1 }
    });
  }

  return ok(res, booking);
});

export const completeBooking = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const booking = await Booking.findById(id);
  if (!booking) {
    return next(new ApiError(404, 'NOT_FOUND', 'Booking not found'));
  }

  if (!booking.customer.equals(req.user._id)) {
    return next(new ApiError(403, 'FORBIDDEN', 'Only the customer can mark this booking as complete'));
  }

  const nextStatus = transition(booking.status, 'complete', 'customer');

  booking.status = nextStatus;
  booking.completedAt = new Date();
  await booking.save();

  // Mark job as completed
  await JobRequest.findByIdAndUpdate(booking.job, {
    status: 'completed'
  });

  // Increment completedJobs on worker's profile
  await WorkerProfile.findByIdAndUpdate(booking.workerProfile, {
    $inc: { completedJobs: 1 }
  });

  return ok(res, booking);
});
