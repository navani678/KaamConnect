import { ApiError } from './ApiError.js';
import { asyncHandler } from './asyncHandler.js';

export { ApiError, asyncHandler };

export const ok = (res, data = null, status = 200) => {
  return res.status(status).json({
    success: true,
    data
  });
};

export const created = (res, data = null) => ok(res, data, 201);

