import mongoose from "mongoose";
import { REPORT_REASONS, REPORT_STATUS } from "./constants.js";

const reportSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    against: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    reason: {
      type: String,
      enum: REPORT_REASONS,
      required: true
    },
    details: {
      type: String,
      maxlength: 1000,
      default: ""
    },
    status: {
      type: String,
      enum: REPORT_STATUS,
      default: "open"
    }
  },
  {
    timestamps: true
  }
);

reportSchema.index({ reporter: 1 });
reportSchema.index({ against: 1 });
reportSchema.index({ status: 1 });

export const Report = mongoose.model("Report", reportSchema);
export default Report;
