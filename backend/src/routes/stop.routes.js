const express = require('express');
const stopController = require('../controllers/stop.controller');
const stopActivityController = require('../controllers/stopActivity.controller');
const validate = require('../middleware/validate.middleware');
const { updateStopSchema } = require('../validators/stop.validator');
const { addStopActivitySchema } = require('../validators/stopActivity.validator');

const router = express.Router();

router.post('/:stopId/activities', validate(addStopActivitySchema), stopActivityController.add);
router.patch('/:id', validate(updateStopSchema), stopController.update);
router.delete('/:id', stopController.remove);

module.exports = router;
