const express = require('express');
const activityController = require('../controllers/activity.controller');

const router = express.Router();

router.get('/', activityController.list);
router.get('/:id', activityController.getById);

module.exports = router;
