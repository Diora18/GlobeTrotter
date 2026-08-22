const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');
const adminController = require('../controllers/admin.controller');

const router = express.Router();

// Enforce auth & admin authorization across all routes
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/stats', adminController.getStats);
router.get('/analytics', adminController.getAnalytics);
router.get('/users', adminController.listUsers);
router.patch('/users/:id/role', adminController.toggleUserAdmin);

module.exports = router;
