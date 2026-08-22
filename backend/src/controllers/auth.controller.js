const authService = require('../services/auth.service');

async function register(req, res, next) {
  try {
    const { user, token } = await authService.register(req.body);
    res.cookie('token', token, authService.COOKIE_OPTIONS);
    res.status(201).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { user, token } = await authService.login(req.body);
    res.cookie('token', token, authService.COOKIE_OPTIONS);
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
}

function logout(req, res) {
  res.clearCookie('token');
  res.status(200).json({ success: true, data: { message: 'Logged out' } });
}

async function me(req, res, next) {
  try {
    const user = await authService.getMe(req.user.id);
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, logout, me };
