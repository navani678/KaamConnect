import mongoose from 'mongoose';
import { z } from 'zod';
import { ApiError } from '../utils/ApiError.js';
import { ok } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { JobRequest, Booking } from '../services/modelProvider.js';
import { PROFESSIONS, TIME_SLOTS, JOB_STATUS } from '../utils/constants.js';

export const createJobSchema = z
  .object({
    profession: z.enum(PROFESSIONS, {
      errorMap: () => ({ message: `Profession must be one of: ${PROFESSIONS.join(', ')}` })
    }),
    title: z.string().min(3, 'Title must be at least 3 characters').max(150),
    description: z.string().max(2000).optional().default(''),
    media: z
      .array(
        z.object({
          url: z.string().url('Media URL must be valid'),
          type: z.enum(['image', 'video']).default('image')
        })
      )
      .max(6, 'Maximum 6 media items allowed')
      .optional()
      .default([]),
    location: z.object({
      lat: z.number().min(-90).max(90, 'Invalid latitude'),
      lng: z.number().min(-180).max(180, 'Invalid longitude')
    }),
    addressText: z.string().optional().default(''),
    budgetMin: z.number().min(0).optional(),
    budgetMax: z.number().min(0).optional(),
    preferredDate: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val))
      .optional(),
    preferredTimeSlot: z.enum(TIME_SLOTS).optional().default('anytime'),
    estimatedDuration: z
      .object({
        value: z.number().min(0.5),
        unit: z.enum(['hours', 'days']).default('hours')
      })
      .optional()
  })
  .refine(
    (data) => {
      if (data.budgetMin !== undefined && data.budgetMax !== undefined) {
        return data.budgetMin <= data.budgetMax;
      }
      return true;
    },
    {
      message: 'budgetMin must not be greater than budgetMax',
      path: ['budgetMin']
    }
  )
  .refine(
    (data) => {
      if (data.preferredDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return data.preferredDate >= today;
      }
      return true;
    },
    {
      message: 'preferredDate cannot be in the past',
      path: ['preferredDate']
    }
  );

export const updateJobSchema = z
  .object({
    title: z.string().min(3).max(150).optional(),
    description: z.string().max(2000).optional(),
    media: z
      .array(
        z.object({
          url: z.string().url(),
          type: z.enum(['image', 'video']).default('image')
        })
      )
      .max(6)
      .optional(),
    location: z
      .object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180)
      })
      .optional(),
    addressText: z.string().optional(),
    budgetMin: z.number().min(0).optional(),
    budgetMax: z.number().min(0).optional(),
    preferredDate: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val))
      .optional(),
    preferredTimeSlot: z.enum(TIME_SLOTS).optional(),
    estimatedDuration: z
      .object({
        value: z.number().min(0.5),
        unit: z.enum(['hours', 'days']).default('hours')
      })
      .optional(),
    status: z.enum(['open', 'cancelled']).optional()
  })
  .refine(
    (data) => {
      if (data.budgetMin !== undefined && data.budgetMax !== undefined) {
        return data.budgetMin <= data.budgetMax;
      }
      return true;
    },
    {
      message: 'budgetMin must not be greater than budgetMax',
      path: ['budgetMin']
    }
  );

export const createJob = asyncHandler(async (req, res) => {
  const {
    profession,
    title,
    description,
    media,
    location,
    addressText,
    budgetMin,
    budgetMax,
    preferredDate,
    preferredTimeSlot,
    estimatedDuration
  } = req.body;

  // Convert {lat, lng} to GeoJSON [lng, lat]
  const geoPoint = {
    type: 'Point',
    coordinates: [location.lng, location.lat]
  };

  const job = await JobRequest.create({
    customer: req.user._id,
    profession,
    title,
    description,
    media,
    location: geoPoint,
    addressText,
    budgetMin,
    budgetMax,
    preferredDate,
    preferredTimeSlot,
    estimatedDuration,
    status: 'open'
  });

  return ok(res, job, 201);
});

export const getMyJobs = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const query = { customer: req.user._id };
  if (status && JOB_STATUS.includes(status)) {
    query.status = status;
  }

  const [items, total] = await Promise.all([
    JobRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('selectedBooking'),
    JobRequest.countDocuments(query)
  ]);

  return ok(res, {
    items,
    page: pageNum,
    limit: limitNum,
    total
  });
});

export const getJobById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError(400, 'INVALID_ID', 'Invalid job ID format'));
  }

  const job = await JobRequest.findById(id).populate('customer', 'name avatarUrl language');
  if (!job) {
    return next(new ApiError(404, 'NOT_FOUND', 'Job not found'));
  }

  // Authorization check: owner customer, OR worker who has a booking on it, OR admin
  const isOwner = job.customer._id.equals(req.user._id);
  let isBookedWorker = false;

  if (!isOwner && req.user.role === 'worker') {
    const booking = await Booking.findOne({ job: job._id, worker: req.user._id });
    if (booking) {
      isBookedWorker = true;
    }
  }

  if (!isOwner && !isBookedWorker && req.user.role !== 'admin') {
    return next(new ApiError(403, 'FORBIDDEN', 'You do not have permission to view this job'));
  }

  return ok(res, job);
});

export const updateJob = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError(400, 'INVALID_ID', 'Invalid job ID format'));
  }

  const job = await JobRequest.findById(id);
  if (!job) {
    return next(new ApiError(404, 'NOT_FOUND', 'Job not found'));
  }

  if (!job.customer.equals(req.user._id) && req.user.role !== 'admin') {
    return next(new ApiError(403, 'FORBIDDEN', 'Only the customer who posted this job can edit it'));
  }

  if (job.status !== 'open') {
    return next(
      new ApiError(409, 'JOB_NOT_OPEN', `Job cannot be modified because its current status is "${job.status}"`)
    );
  }

  const updates = req.body;
  if (updates.location) {
    job.location = {
      type: 'Point',
      coordinates: [updates.location.lng, updates.location.lat]
    };
    delete updates.location;
  }

  Object.assign(job, updates);
  await job.save();

  return ok(res, job);
});
