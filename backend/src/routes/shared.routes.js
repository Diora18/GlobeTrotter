const express = require('express');
const tripController = require('../controllers/trip.controller');

const router = express.Router();

router.get('/trips/:slug', tripController.getBySlug);

module.exports = router;
