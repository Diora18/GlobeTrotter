const tripService = require('../services/trip.service');

async function list(req, res, next) {
  try {
    const trips = await tripService.listTrips(req.user.id, req.query);
    res.status(200).json({ success: true, data: { trips } });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const trip = await tripService.createTrip(req.user.id, req.body);
    res.status(201).json({ success: true, data: { trip } });
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const trip = await tripService.getTripById(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: { trip } });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const trip = await tripService.updateTrip(req.params.id, req.user.id, req.body);
    res.status(200).json({ success: true, data: { trip } });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await tripService.deleteTrip(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: { message: 'Trip deleted' } });
  } catch (error) {
    next(error);
  }
}

module.exports = { list, create, getById, update, remove };
