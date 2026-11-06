const express = require('express');
const { createAppointment, getAllAppointments, cancelAppointment } = require('../controllers/appointmentController');
const { requireAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

// Patients can POST without logging in
router.post('/', createAppointment);

// Only admins can GET the list or CANCEL
router.get('/', requireAdmin, getAllAppointments);
router.patch('/:id/cancel', requireAdmin, cancelAppointment); // <-- Add this

module.exports = router;