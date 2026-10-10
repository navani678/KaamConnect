import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/User.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new ApiError(401, 'UNAUTHORIZED', 'Missing or invalid authorization header'));
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next(new ApiError(401, 'UNAUTHORIZED', 'Token not provided'));
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      return next(new ApiError(401, 'UNAUTHORIZED', 'Invalid token payload'));
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new ApiError(401, 'UNAUTHORIZED', 'User associated with token no longer exists'));
    }

    req.user = user;
    req.tokenPayload = decoded;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'UNAUTHORIZED', 'Invalid or expired token'));
    }
    next(err);
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'UNAUTHORIZED', 'Authentication required'));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, 'FORBIDDEN', `Access restricted to roles: ${roles.join(', ')}`)
      );
    }
    next();
  };
};
