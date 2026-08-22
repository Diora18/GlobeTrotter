const express = require('express');
const cityController = require('../controllers/city.controller');

const router = express.Router();

router.get('/', cityController.list);
router.get('/:id', cityController.getById);

module.exports = router;
