const express = require('express');
const stopActivityController = require('../controllers/stopActivity.controller');
const validate = require('../middleware/validate.middleware');
const { updateStopActivitySchema } = require('../validators/stopActivity.validator');

const router = express.Router();

router.patch('/:id', validate(updateStopActivitySchema), stopActivityController.update);
router.delete('/:id', stopActivityController.remove);

module.exports = router;
