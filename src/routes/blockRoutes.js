const express = require('express');
const { blockTime, getBlockedTimes, unblockTime } = require('../controllers/blockController');
const { requireAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', requireAdmin, getBlockedTimes);
router.post('/', requireAdmin, blockTime);
router.delete('/:id', requireAdmin, unblockTime);

module.exports = router;