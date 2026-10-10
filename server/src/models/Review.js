import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: 500,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

reviewSchema.index({ workerProfile: 1, createdAt: -1 });
reviewSchema.index({ worker: 1 });
reviewSchema.index({ customer: 1 });

export const Review = mongoose.model("Review", reviewSchema);
export default Review;
