import mongoose from "mongoose";
import { BOOKING_STATUS, TIME_SLOTS } from "./constants.js";

const negotiationEntrySchema = new mongoose.Schema({
  by: {
    type: String,
    enum: ["customer", "worker"],
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  message: {
    type: String,
    default: ""
  },
  at: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const bookingSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobRequest",
      required: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    workerProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkerProfile",
      required: true
    },
    scope: {
      type: String,
      default: ""
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
      type: Date
    },
    timeSlot: {
      type: String,
      enum: TIME_SLOTS,
      default: "anytime"
    },
    negotiation: {
      type: [negotiationEntrySchema],
      default: []
    },
    status: {
      type: String,
      enum: BOOKING_STATUS,
      default: "pending"
    },
    rejectionReason: {
      type: String,
      default: ""
    },
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

bookingSchema.index({ worker: 1, status: 1 });
bookingSchema.index({ customer: 1, status: 1 });
bookingSchema.index({ job: 1 });

export const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
