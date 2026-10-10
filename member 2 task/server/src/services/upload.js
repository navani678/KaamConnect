import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env.js';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { ApiError } from '../utils/ApiError.js';

// Setup memory storage
const storage = multer.memoryStorage();

const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
  'video/mp4'
];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        'INVALID_FILE_TYPE',
        `File type ${file.mimetype} is not supported. Only JPG, PNG, WEBP, and MP4 are allowed.`
      ),
      false
    );
  }
};

export const multerUpload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 6 // max 6 files
  },
  fileFilter
});

export const uploadFileToStorage = async (file, hostUrl = '') => {
  const isVideo = file.mimetype.startsWith('video');
  const fileType = isVideo ? 'video' : 'image';

  // If Cloudinary is configured, upload to Cloudinary
  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'kaamconnect',
          resource_type: isVideo ? 'video' : 'image'
        },
        (error, result) => {
          if (error) {
            return reject(new ApiError(500, 'UPLOAD_ERROR', `Cloudinary upload failed: ${error.message}`));
          }
          resolve({
            url: result.secure_url,
            type: fileType
          });
        }
      );
      uploadStream.end(file.buffer);
    });
  }

  // Fallback to local disk storage
  const uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR || './uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const ext = path.extname(file.originalname) || (isVideo ? '.mp4' : '.jpg');
  const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const filePath = path.join(uploadDir, uniqueName);

  await fs.promises.writeFile(filePath, file.buffer);

  const baseUrl = hostUrl || `http://localhost:${env.PORT}`;
  const url = `${baseUrl}/uploads/${uniqueName}`;

  return {
    url,
    type: fileType
  };
};
