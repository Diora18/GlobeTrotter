const express = require('express');
const activityController = require('../controllers/activity.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', activityController.list);
router.get('/:id', activityController.getById);
router.post('/', authMiddleware, activityController.create);

module.exports = router;
