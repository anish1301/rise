const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/auth');

// All analytics routes are protected
router.use(authMiddleware);

router.get('/', analyticsController.getAnalyticsOverview);
router.get('/popular-items', analyticsController.getPopularItems);
router.get('/revenue', analyticsController.getRevenueStats);
router.get('/customers', analyticsController.getCustomerInsights);

module.exports = router;
