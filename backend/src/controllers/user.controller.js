const userService = require('../services/user.service');

async function getMe(req, res, next) {
  try {
    const user = await userService.getUser(req.user.id);
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
}

async function updateMe(req, res, next) {
  try {
    const user = await userService.updateUser(req.user.id, req.body);
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
}

module.exports = { getMe, updateMe };
