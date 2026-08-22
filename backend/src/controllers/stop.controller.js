const stopService = require('../services/stop.service');

async function create(req, res, next) {
  try {
    const stop = await stopService.createStop(req.params.tripId, req.user.id, req.body);
    res.status(201).json({ success: true, data: { stop } });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const stop = await stopService.updateStop(req.params.id, req.user.id, req.body);
    res.status(200).json({ success: true, data: { stop } });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await stopService.deleteStop(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: { message: 'Stop deleted' } });
  } catch (error) {
    next(error);
  }
}

async function reorder(req, res, next) {
  try {
    const stops = await stopService.reorderStops(req.params.tripId, req.user.id, req.body.orderedIds);
    res.status(200).json({ success: true, data: { stops } });
  } catch (error) {
    next(error);
  }
}

module.exports = { create, update, remove, reorder };
