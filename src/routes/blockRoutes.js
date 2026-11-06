const express = require('express');
const { blockDate, getBlockedDates } = require('../controllers/blockController');
const { requireAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

// Only admins can view or create blocked dates
router.get('/', requireAdmin, getBlockedDates);
router.post('/', requireAdmin, blockDate);

module.exports = router;