const express = require('express');
const stopController = require('../controllers/stop.controller');
const validate = require('../middleware/validate.middleware');
const { updateStopSchema } = require('../validators/stop.validator');

const router = express.Router();

router.patch('/:id', validate(updateStopSchema), stopController.update);
router.delete('/:id', stopController.remove);

module.exports = router;
