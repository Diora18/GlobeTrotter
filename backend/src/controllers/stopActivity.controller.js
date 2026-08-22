const stopActivityService = require('../services/stopActivity.service');

async function add(req, res, next) {
  try {
    const stopActivity = await stopActivityService.addActivityToStop(
      req.params.stopId,
      req.user.id,
      req.body
    );
    res.status(201).json({ success: true, data: { stopActivity } });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const stopActivity = await stopActivityService.updateStopActivity(
      req.params.id,
      req.user.id,
      req.body
    );
    res.status(200).json({ success: true, data: { stopActivity } });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await stopActivityService.removeStopActivity(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: { message: 'Activity removed from stop' } });
  } catch (error) {
    next(error);
  }
}

module.exports = { add, update, remove };
