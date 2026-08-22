const express = require('express');
const tripController = require('../controllers/trip.controller');
const stopController = require('../controllers/stop.controller');
const validate = require('../middleware/validate.middleware');
const { createTripSchema, updateTripSchema } = require('../validators/trip.validator');
const { createStopSchema, reorderStopsSchema } = require('../validators/stop.validator');

const router = express.Router();

router.get('/', tripController.list);
router.post('/', validate(createTripSchema), tripController.create);
router.get('/:id', tripController.getById);
router.patch('/:id', validate(updateTripSchema), tripController.update);
router.delete('/:id', tripController.remove);

router.post('/:tripId/stops', validate(createStopSchema), stopController.create);
router.patch('/:tripId/stops/reorder', validate(reorderStopsSchema), stopController.reorder);

module.exports = router;
