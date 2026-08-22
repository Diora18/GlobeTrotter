const budgetService = require('../services/budget.service');

async function getByTripId(req, res, next) {
  try {
    const budget = await budgetService.calculateBudget(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: { budget } });
  } catch (error) {
    next(error);
  }
}

module.exports = { getByTripId };
