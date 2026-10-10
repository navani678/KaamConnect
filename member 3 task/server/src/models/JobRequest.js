import mongoose from "mongoose";
import { PROFESSIONS, JOB_STATUS, TIME_SLOTS } from "./constants.js";

const jobMediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  type: { type: String, enum: ["image", "video"], default: "image" }
}, { _id: false });

const estimatedDurationSchema = new mongoose.Schema({
  value: { type: Number, min: 1, default: 1 },
  unit: { type: String, enum: ["hours", "days"], default: "hours" }
}, { _id: false });

const jobRequestSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      maxlength: 2000,
      default: ""
    },
    media: {
      type: [jobMediaSchema],
      validate: [
        (val) => !val || val.length <= 6,
        "Maximum 6 media files allowed"
      ],
      default: []
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        validate: {
          validator: function (val) {
            return (
              Array.isArray(val) &&
              val.length === 2 &&
              val[0] >= -180 && val[0] <= 180 &&
              val[1] >= -90 && val[1] <= 90
            );
          },
          message: "Invalid coordinates format. Must be [longitude, latitude]."
        }
      }
    },
    addressText: {
      type: String,
      default: ""
    },
    budgetMin: {
      type: Number,
      min: 0
    },
    budgetMax: {
      type: Number,
      min: 0,
      validate: {
        validator: function (val) {
          if (this.budgetMin != null && val != null) {
            return val >= this.budgetMin;
          }
          return true;
        },
        message: "budgetMax cannot be less than budgetMin"
      }
    },
    preferredDate: {
      type: Date
    },
    preferredTimeSlot: {
      type: String,
      enum: TIME_SLOTS,
      default: "anytime"
    },
    estimatedDuration: {
      type: estimatedDurationSchema,
      default: () => ({ value: 1, unit: "hours" })
    },
    status: {
      type: String,
      enum: JOB_STATUS,
      default: "open"
    },
    selectedBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null
    }
  },
  {
    timestamps: true
  }
);

jobRequestSchema.index({ location: "2dsphere" });
jobRequestSchema.index({ customer: 1, status: 1 });
jobRequestSchema.index({ status: 1, profession: 1 });

export const JobRequest = mongoose.model("JobRequest", jobRequestSchema);
export default JobRequest;
