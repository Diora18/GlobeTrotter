class AppError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

function badRequest(message, code = 'VALIDATION_ERROR') {
  return new AppError(400, code, message);
}

function unauthorized(message = 'Not authenticated') {
  return new AppError(401, 'UNAUTHORIZED', message);
}

function forbidden(message = 'Not allowed') {
  return new AppError(403, 'FORBIDDEN', message);
}

function notFound(message = 'Resource not found') {
  return new AppError(404, 'NOT_FOUND', message);
}

function conflict(message, code = 'CONFLICT') {
  return new AppError(409, code, message);
}

module.exports = {
  AppError,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
};
