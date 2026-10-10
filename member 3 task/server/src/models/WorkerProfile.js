import mongoose from "mongoose";
import { PROFESSIONS, RATE_TYPES, TIME_SLOTS, LANGUAGES, WEEKDAYS } from "./constants.js";

const portfolioItemSchema = new mongoose.Schema({
  url: { type: String, required: true },
  caption: { type: String, default: "" },
  type: { type: String, enum: ["image", "video"], default: "image" }
});

const certificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  issuer: { type: String, default: "" },
  year: { type: Number },
  documentUrl: { type: String, default: "" }
});

const availabilitySchema = new mongoose.Schema({
  weeklyDays: {
    type: [{ type: String, enum: WEEKDAYS }],
    default: ["mon", "tue", "wed", "thu", "fri", "sat"]
  },
  slots: {
    type: [{ type: String, enum: TIME_SLOTS }],
    default: ["morning", "afternoon", "evening"]
  },
  unavailableDates: {
    type: [Date],
    default: []
  },
  isAvailableNow: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const verificationSchema = new mongoose.Schema({
  idVerified: { type: Boolean, default: false },
  verifiedAt: { type: Date }
}, { _id: false });

const workerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    professions: {
      type: [{ type: String, enum: PROFESSIONS }],
      validate: [
        (val) => Array.isArray(val) && val.length > 0,
        "At least one profession is required"
      ],
      required: true
    },
    specializations: {
      type: [String],
      default: []
    },
    bio: {
      type: String,
      maxlength: 500,
      default: ""
    },
    experienceYears: {
      type: Number,
      min: [0, "Experience years cannot be negative"],
      default: 0
    },
    rateType: {
      type: String,
      enum: RATE_TYPES,
      default: "hourly"
    },
    rate: {
      type: Number,
      required: true,
      min: [0, "Rate must be non-negative"]
    },
    serviceRadiusKm: {
      type: Number,
      default: 15,
      min: [1, "Service radius must be at least 1 km"]
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
              val[0] >= -180 && val[0] <= 180 && // longitude
              val[1] >= -90 && val[1] <= 90       // latitude
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
    availability: {
      type: availabilitySchema,
      default: () => ({})
    },
    languages: {
      type: [{ type: String, enum: LANGUAGES }],
      default: ["en", "te"]
    },
    portfolio: {
      type: [portfolioItemSchema],
      default: []
    },
    certifications: {
      type: [certificationSchema],
      default: []
    },
    verification: {
      type: verificationSchema,
      default: () => ({ idVerified: false })
    },
    ratingAvg: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    ratingCount: {
      type: Number,
      default: 0,
      min: 0
    },
    completedJobs: {
      type: Number,
      default: 0,
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
workerProfileSchema.index({ location: "2dsphere" });
workerProfileSchema.index({ professions: 1 });
workerProfileSchema.index({ isActive: 1 });

export const WorkerProfile = mongoose.model("WorkerProfile", workerProfileSchema);
export default WorkerProfile;
