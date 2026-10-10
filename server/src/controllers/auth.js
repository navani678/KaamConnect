import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { ok } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/User.js';
import { WorkerProfile } from '../services/modelProvider.js';
import { ROLES, LANGUAGES } from '../utils/constants.js';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Phone must be a valid 10-digit Indian mobile number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(ROLES).default('customer'),
  language: z.enum(LANGUAGES).default('en'),
  avatarUrl: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const updateMeSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Phone must be a valid 10-digit Indian mobile number').optional(),
  language: z.enum(LANGUAGES).optional(),
  avatarUrl: z.string().optional()
});

export const register = asyncHandler(async (req, res, next) => {
  const { name, email, phone, password, role, language, avatarUrl } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return next(new ApiError(409, 'EMAIL_EXISTS', 'Email is already registered', {
      email: 'Email is already in use'
    }));
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    phone,
    passwordHash,
    role,
    language,
    avatarUrl
  });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  return ok(res, {
    token,
    user: user.toSafeObject()
  }, 201);
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user) {
    return next(new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid credentials'));
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid credentials'));
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  return ok(res, {
    token,
    user: user.toSafeObject()
  }, 200);
});

export const getMe = asyncHandler(async (req, res) => {
  let workerProfile = null;
  if (req.user.role === 'worker') {
    workerProfile = await WorkerProfile.findOne({ user: req.user._id });
  }

  return ok(res, {
    user: req.user.toSafeObject(),
    ...(req.user.role === 'worker' ? { workerProfile } : {})
  });
});

export const updateMe = asyncHandler(async (req, res) => {
  const { name, phone, language, avatarUrl } = req.body;

  if (name !== undefined) req.user.name = name;
  if (phone !== undefined) req.user.phone = phone;
  if (language !== undefined) req.user.language = language;
  if (avatarUrl !== undefined) req.user.avatarUrl = avatarUrl;

  await req.user.save();

  return ok(res, {
    user: req.user.toSafeObject()
  });
});
