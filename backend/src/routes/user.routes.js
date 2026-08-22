const express = require('express');
const userController = require('../controllers/user.controller');

const router = express.Router();

router.get('/me', userController.getMe);
router.patch('/me', userController.updateMe);

module.exports = router;
