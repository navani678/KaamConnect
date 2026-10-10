import jwt from "jsonwebtoken";
import { ApiError } from "../utils/response.js";
import User from "../models/User.js";

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "default_jwt_secret_for_kaamconnect_2026";
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      throw new ApiError(401, "INVALID_TOKEN", "Invalid or expired authentication token");
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError(401, "USER_NOT_FOUND", "User not found");
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "UNAUTHORIZED", "Authentication required"));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, "FORBIDDEN", `Access restricted to: ${roles.join(", ")}`)
      );
    }
    next();
  };
};
