const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getLinkAnalytics, getAnalyticsSummary } = require('../controllers/analyticsController');

router.use(protect);

router.get('/:linkId', getLinkAnalytics);
router.get('/:linkId/summary', getAnalyticsSummary);

module.exports = router;