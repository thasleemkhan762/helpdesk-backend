const express = require('express');
const router = express.Router();
const {
  getDashboardAnalytics,
  getAgentStatistics,
  getTicketTrends
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, authorize('admin'), getDashboardAnalytics);
router.get('/agents', protect, authorize('admin'), getAgentStatistics);
router.get('/trends', protect, authorize('admin'), getTicketTrends);

module.exports = router;