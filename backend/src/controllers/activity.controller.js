const activityService = require('../services/activity.service');

async function list(req, res, next) {
  try {
    const activities = await activityService.listActivities(req.query);
    res.status(200).json({ success: true, data: { activities } });
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const activity = await activityService.getActivityById(req.params.id);
    res.status(200).json({ success: true, data: { activity } });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const activity = await activityService.createActivity(req.body);
    res.status(201).json({ success: true, data: { activity } });
  } catch (error) {
    next(error);
  }
}

module.exports = { list, getById, create };
