const adminService = require('../services/admin.service');

async function getStats(req, res, next) {
  try {
    const stats = await adminService.getStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
}

async function getAnalytics(req, res, next) {
  try {
    const analytics = await adminService.getAnalytics();
    res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    next(error);
  }
}

async function listUsers(req, res, next) {
  try {
    const users = await adminService.listUsers();
    res.status(200).json({ success: true, data: { users } });
  } catch (error) {
    next(error);
  }
}

async function toggleUserAdmin(req, res, next) {
  try {
    const { id } = req.params;
    const { isAdmin } = req.body;
    const user = await adminService.toggleUserAdmin(id, Boolean(isAdmin));
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStats,
  getAnalytics,
  listUsers,
  toggleUserAdmin,
};
