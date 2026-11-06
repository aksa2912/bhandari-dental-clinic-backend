const express = require('express');
const { getAvailableSlots } = require('../services/availabilityService');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { date, treatmentId } = req.query;
    if (!date || !treatmentId) {
      return res.status(400).json({ error: 'Date and treatmentId are required' });
    }
    const slots = await getAvailableSlots(date, treatmentId);
    res.status(200).json({ date, treatmentId, availableSlots: slots });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;