import { ApiError } from '../utils/ApiError.js';

const checkForMongoOperators = (obj) => {
  if (!obj || typeof obj !== 'object') return false;
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$')) return true;
    if (typeof obj[key] === 'object' && checkForMongoOperators(obj[key])) {
      return true;
    }
  }
  return false;
};

export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const dataToValidate = req[source];

    // Sanitize Mongo query injection
    if (checkForMongoOperators(dataToValidate)) {
      return next(
        new ApiError(400, 'INVALID_INPUT', 'Query operators starting with $ are not permitted.')
      );
    }

    const result = schema.safeParse(dataToValidate);

    if (!result.success) {
      const fields = {};
      result.error.errors.forEach((err) => {
        const path = err.path.length > 0 ? err.path.join('.') : 'general';
        fields[path] = err.message;
      });

      return next(
        new ApiError(400, 'VALIDATION_ERROR', 'Request validation failed', fields)
      );
    }

    req[source] = result.data;
    next();
  };
};
