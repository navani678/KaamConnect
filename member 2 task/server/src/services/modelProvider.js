import mongoose from 'mongoose';
import { User } from '../models/User.js';
import {
  PROFESSIONS,
  RATE_TYPES,
  JOB_STATUS,
  BOOKING_STATUS,
  TIME_SLOTS,
  WEEKDAYS,
  REPORT_REASONS
} from '../utils/constants.js';

// WorkerProfile schema per Section 4.3
const workerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    professions: {
      type: [String],
      enum: PROFESSIONS,
      required: true,
      validate: [(val) => val.length > 0, 'At least one profession is required']
    },
    specializations: {
      type: [String],
      default: []
    },
    bio: {
      type: String,
      maxlength: 500,
      default: ''
    },
    experienceYears: {
      type: Number,
      min: 0,
      default: 0
    },
    rateType: {
      type: String,
      enum: RATE_TYPES,
      default: 'daily'
    },
    rate: {
      type: Number,
      min: 0,
      default: 0
    },
    serviceRadiusKm: {
      type: Number,
      default: 15
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
        default: [79.5941, 17.9689]
      }
    },
    addressText: {
      type: String,
      default: ''
    },
    availability: {
      weeklyDays: {
        type: [String],
        enum: WEEKDAYS,
        default: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat']
      },
      slots: {
        type: [String],
        enum: TIME_SLOTS,
        default: ['anytime']
      },
      unavailableDates: {
        type: [Date],
        default: []
      },
      isAvailableNow: {
        type: Boolean,
        default: true
      }
    },
    languages: {
      type: [String],
      default: ['en', 'hi', 'te']
    },
    portfolio: [
      {
        url: { type: String, required: true },
        caption: { type: String, default: '' },
        type: { type: String, enum: ['image', 'video'], default: 'image' }
      }
    ],
    certifications: [
      {
        title: { type: String, required: true },
        issuer: { type: String, default: '' },
        year: { type: Number },
        documentUrl: { type: String, default: '' }
      }
    ],
    verification: {
      idVerified: { type: Boolean, default: false },
      verifiedAt: { type: Date }
    },
    ratingAvg: {
      type: Number,
      default: 0
    },
    ratingCount: {
      type: Number,
      default: 0
    },
    completedJobs: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

workerProfileSchema.index({ location: '2dsphere' });
workerProfileSchema.index({ professions: 1 });
workerProfileSchema.index({ isActive: 1 });

// JobRequest schema per Section 4.4
const jobRequestSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    profession: {
      type: String,
      enum: PROFESSIONS,
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      maxlength: 2000,
      default: ''
    },
    media: [
      {
        url: { type: String, required: true },
        type: { type: String, enum: ['image', 'video'], default: 'image' }
      }
    ],
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true
      }
    },
    addressText: {
      type: String,
      default: ''
    },
    budgetMin: {
      type: Number,
      min: 0
    },
    budgetMax: {
      type: Number,
      min: 0
    },
    preferredDate: {
      type: Date
    },
    preferredTimeSlot: {
      type: String,
      enum: TIME_SLOTS,
      default: 'anytime'
    },
    estimatedDuration: {
      value: { type: Number },
      unit: { type: String, enum: ['hours', 'days'], default: 'hours' }
    },
    status: {
      type: String,
      enum: JOB_STATUS,
      default: 'open'
    },
    selectedBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    }
  },
  { timestamps: true }
);

jobRequestSchema.index({ location: '2dsphere' });
jobRequestSchema.index({ customer: 1, status: 1 });

// Booking schema per Section 4.5
const bookingSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobRequest',
      required: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    workerProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkerProfile',
      required: true
    },
    scope: {
      type: String,
      default: ''
    },
    proposedPrice: {
      type: Number,
      required: true,
      min: 0
    },
    finalPrice: {
      type: Number,
      min: 0
    },
    scheduledDate: {
      type: Date,
      required: true
    },
    timeSlot: {
      type: String,
      enum: TIME_SLOTS,
      default: 'anytime'
    },
    negotiation: [
      {
        by: { type: String, enum: ['customer', 'worker'], required: true },
        price: { type: Number, required: true },
        message: { type: String, default: '' },
        at: { type: Date, default: Date.now }
      }
    ],
    status: {
      type: String,
      enum: BOOKING_STATUS,
      default: 'pending'
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    completedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

bookingSchema.index({ worker: 1, status: 1 });
bookingSchema.index({ customer: 1, status: 1 });

// Review schema per Section 4.6
const reviewSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    workerProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkerProfile',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: 500,
      default: ''
    }
  },
  { timestamps: true }
);

// Report schema per Section 4.7
const reportSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    against: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: {
      type: String,
      enum: REPORT_REASONS,
      required: true
    },
    details: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['open', 'reviewed', 'closed'],
      default: 'open'
    }
  },
  { timestamps: true }
);

export const WorkerProfile =
  mongoose.models.WorkerProfile || mongoose.model('WorkerProfile', workerProfileSchema);
export const JobRequest =
  mongoose.models.JobRequest || mongoose.model('JobRequest', jobRequestSchema);
export const Booking =
  mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
export const Review =
  mongoose.models.Review || mongoose.model('Review', reviewSchema);
export const Report =
  mongoose.models.Report || mongoose.model('Report', reportSchema);

export { User };
