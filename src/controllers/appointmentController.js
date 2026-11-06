const { sendBookingEmail } = require('../utils/emailService');
const pool = require('../config/db');

const createAppointment = async (req, res) => {
  // 1. Get the data from the request body
  const { patientName, patientPhone, treatmentId, startTime } = req.body;

  if (!patientName || !patientPhone || !treatmentId || !startTime) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // We need a dedicated client from the pool to run a transaction
  const client = await pool.connect();

  try {
    // 2. Start the transaction with SERIALIZABLE isolation
    await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

    // 3. Get treatment duration
    const treatmentResult = await client.query('SELECT duration_minutes FROM treatments WHERE id = $1', [treatmentId]);
    if (treatmentResult.rows.length === 0) {
      throw new Error('Treatment not found');
    }
    const duration = treatmentResult.rows[0].duration_minutes;

    // 4. Calculate times
    const startDate = new Date(startTime);
    const endDate = new Date(startDate.getTime() + duration * 60000);

    // 5. CHECK IF THE SLOT IS BLOCKED BY THE ADMIN
    const blockedQuery = `
      SELECT 1 FROM blocked_dates 
      WHERE start_time < $2 AND end_time > $1
    `;
    const blockedResult = await client.query(blockedQuery, [startDate.toISOString(), endDate.toISOString()]);

    if (blockedResult.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Clinic is closed at this time. Please choose another slot.' });
    }

    // 6. THE CONCURRENCY CHECK
    // We need to know if adding this appointment would cause 3 concurrent overlaps
    const overlapQuery = `
      SELECT a1.id
      FROM appointments a1
      JOIN appointments a2 
        ON a1.id < a2.id 
       AND a1.start_time < a2.end_time 
       AND a2.start_time < a1.end_time
      WHERE a1.status = 'confirmed' AND a2.status = 'confirmed'
        AND a1.start_time < $2 AND a1.end_time > $1
    `;

    const overlapResult = await client.query(overlapQuery, [startDate.toISOString(), endDate.toISOString()]);

    if (overlapResult.rows.length > 0) {
      // If we found ANY pair of appointments that overlap with each other AND our new time slot,
      // adding a third one would exceed capacity.
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Slot full. Please choose another time.' });
    }

    // 7. Insert
    const insertQuery = `
      INSERT INTO appointments (patient_name, patient_phone, treatment_id, start_time, end_time) 
      VALUES ($1, $2, $3, $4, $5) RETURNING *;
    `;
    const result = await client.query(insertQuery, [
      patientName, patientPhone, treatmentId, startDate.toISOString(), endDate.toISOString()
    ]);

    // 8. Commit
    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
    
    // Send email in the background (we don't await it so it doesn't slow down the response)
    sendBookingEmail(result.rows[0]).catch(err => console.error(err));
    
  } catch (err) {
    // If the transaction fails due to a serialization conflict, Postgres will throw a 40001 error
    await client.query('ROLLBACK');
    
    if (err.code === '40001') {
      return res.status(409).json({ error: 'Someone just booked this slot. Please try again.' });
    }
    
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    // Always release the client back to the pool
    client.release();
  }
};

const getAllAppointments = async (req, res) => {
  try {
    const query = `
      SELECT 
        a.id, 
        a.patient_name, 
        a.patient_phone, 
        a.start_time, 
        a.end_time, 
        a.status,
        t.name AS treatment_name
      FROM appointments a
      JOIN treatments t ON a.treatment_id = t.id
      WHERE a.status != 'cancelled'
      ORDER BY a.start_time ASC
    `;
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE appointments SET status = 'cancelled' WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.status(200).json({ message: 'Appointment cancelled', appointment: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

module.exports = {
  createAppointment,
  getAllAppointments,
  cancelAppointment
};