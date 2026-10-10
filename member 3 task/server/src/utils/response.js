export class ApiError extends Error {
  constructor(statusCode, code, message, fields = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || "INTERNAL_ERROR";
    this.fields = fields;
  }
}

export function ok(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data
  });
}

export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
