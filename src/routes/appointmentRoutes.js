const express = require('express');
const { createAppointment, getAllAppointments } = require('../controllers/appointmentController');
const { requireAdmin } = require('../middleware/authMiddleware'); // <-- Import middleware
const router = express.Router();

// Patients can POST without logging in
router.post('/', createAppointment);

// Only admins can GET the list
router.get('/', requireAdmin, getAllAppointments);

module.exports = router;