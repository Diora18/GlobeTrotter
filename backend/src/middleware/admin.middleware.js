const prisma = require('../lib/prisma');
const { forbidden, unauthorized } = require('../utils/errors');

async function adminMiddleware(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return next(unauthorized());
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, isAdmin: true },
    });

    if (!dbUser || !dbUser.isAdmin) {
      return next(forbidden('Access denied. Admin privileges required.'));
    }

    req.user.isAdmin = true;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = adminMiddleware;
