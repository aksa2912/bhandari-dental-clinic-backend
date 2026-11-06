const express = require('express');
const { createAppointment, getAllAppointments } = require('../controllers/appointmentController');

const router = express.Router();

router.post('/', createAppointment);
router.get('/', getAllAppointments);


module.exports = router;
