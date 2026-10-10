import mongoose from "mongoose";
import { ROLES, LANGUAGES } from "./constants.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      enum: ROLES,
      required: true
    },
    language: {
      type: String,
      enum: LANGUAGES,
      default: "en"
    },
    avatarUrl: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

export const User = mongoose.model("User", userSchema);
export default User;
