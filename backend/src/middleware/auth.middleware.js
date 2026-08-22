const { unauthorized } = require('../utils/errors');
const { verifyToken } = require('../utils/jwt');

function authMiddleware(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return next(unauthorized());
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.id, email: payload.email, name: payload.name };
    next();
  } catch {
    next(unauthorized('Invalid or expired session'));
  }
}

module.exports = authMiddleware;
