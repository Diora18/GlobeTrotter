const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const { signToken } = require('../utils/jwt');
const { AppError, conflict, unauthorized, notFound, badRequest } = require('../utils/errors');
const { formatUser } = require('../utils/format');
const { sendPasswordResetEmail } = require('../utils/mailer');

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

async function register({ email, password, name, phoneNumber, city, country }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw conflict('Email already registered', 'EMAIL_EXISTS');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      phoneNumber: phoneNumber || null,
      city: city || null,
      country: country || null,
    },
  });

  const token = signToken({ id: user.id, email: user.email, name: user.name, isAdmin: Boolean(user.isAdmin) });
  return { user: formatUser(user), token };
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Wrong email or password');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Wrong email or password');
  }

  const token = signToken({ id: user.id, email: user.email, name: user.name, isAdmin: Boolean(user.isAdmin) });
  return { user: formatUser(user), token };
}

async function getMe(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw unauthorized();
  }
  return formatUser(user);
}

async function forgotPassword(email) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Return friendly message without leaking account existence
    return { message: 'If an account exists with that email, a password reset link has been sent.' };
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetTokenExpiry },
  });

  const { resetUrl, previewUrl } = await sendPasswordResetEmail(user.email, resetToken, user.name);

  return {
    message: 'Password reset email sent successfully. Please check your inbox.',
    previewUrl: previewUrl || undefined,
  };
}

async function resetPassword({ token, newPassword }) {
  if (!token) throw badRequest('Reset token is required');

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    throw badRequest('Invalid or expired password reset token');
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  return { message: 'Password has been reset successfully. You can now log in.' };
}

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  COOKIE_OPTIONS,
};
