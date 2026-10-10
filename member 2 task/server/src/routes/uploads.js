import { Router } from 'express';
import { multerUpload, uploadFileToStorage } from '../services/upload.js';
import { ok } from '../utils/response.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post(
  '/',
  requireAuth,
  (req, res, next) => {
    multerUpload.array('files', 6)(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new ApiError(400, 'FILE_TOO_LARGE', 'File size exceeds 10MB limit'));
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE' || err.code === 'LIMIT_FILE_COUNT') {
          return next(new ApiError(400, 'TOO_MANY_FILES', 'Maximum 6 files allowed per upload'));
        }
        return next(err);
      }
      next();
    });
  },
  asyncHandler(async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
      return next(new ApiError(400, 'NO_FILES_PROVIDED', 'Please provide at least one file in the "files" field'));
    }

    const hostUrl = `${req.protocol}://${req.get('host')}`;
    const uploadPromises = req.files.map((file) => uploadFileToStorage(file, hostUrl));
    const uploadedFiles = await Promise.all(uploadPromises);

    return ok(res, {
      files: uploadedFiles
    }, 201);
  })
);

export default router;
