const cityService = require('../services/city.service');

async function list(req, res, next) {
  try {
    const cities = await cityService.listCities(req.query);
    res.status(200).json({ success: true, data: { cities } });
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const city = await cityService.getCityById(req.params.id);
    res.status(200).json({ success: true, data: { city } });
  } catch (error) {
    next(error);
  }
}

module.exports = { list, getById };
