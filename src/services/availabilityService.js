const pool = require('../config/db');

const getAvailableSlots = async (date, treatmentId) => {
  // 1. Get the duration of the treatment
  const treatmentRes = await pool.query('SELECT duration_minutes FROM treatments WHERE id = $1', [treatmentId]);
  if (treatmentRes.rows.length === 0) {
    throw new Error('Treatment not found');
  }
  const duration = treatmentRes.rows[0].duration_minutes;

  // Check if the clinic is closed on this date
  const blockedRes = await pool.query('SELECT * FROM blocked_dates WHERE date = $1', [date]);
  if (blockedRes.rows.length > 0) {
    return []; // Return an empty array (no slots available)
  }

  // 2. Get all existing appointments for this day
  const dayStart = `${date}T00:00:00.000Z`;
  const dayEnd = `${date}T23:59:59.999Z`;

  const appointmentsRes = await pool.query(
    `SELECT start_time, end_time FROM appointments 
     WHERE status = 'confirmed' AND start_time < $2 AND end_time > $1`,
    [dayStart, dayEnd]
  );

  const busyIntervals = appointmentsRes.rows;
  const freeSlots = [];

  // 3. The Clinic Hours (in UTC hours)
  // 10:00 AM IST = 04:30 UTC. 2:00 PM IST = 08:30 UTC.
  // 4:00 PM IST = 10:30 UTC. 7:00 PM IST = 13:30 UTC.
  const periods = [
    { start: 4.5, end: 8.5 },   // Morning
    { start: 10.5, end: 13.5 }  // Evening
  ];

  // 4. Generate the slots
  for (const period of periods) {
    let currentMinutes = period.start * 60;
    const endMinutes = period.end * 60;

    while (currentMinutes + duration <= endMinutes) {
      // Create a date object for this slot
      const slotStart = new Date(`${date}T00:00:00.000Z`);
      slotStart.setUTCMinutes(currentMinutes);
      
      const slotEnd = new Date(slotStart.getTime() + duration * 60000);

      // Count how many appointments overlap with this slot
      let overlapCount = 0;
      for (const busy of busyIntervals) {
        const bStart = new Date(busy.start_time).getTime();
        const bEnd = new Date(busy.end_time).getTime();
        
        // Overlap test: half-open intervals [start, end)
        if (slotStart.getTime() < bEnd && slotEnd.getTime() > bStart) {
          overlapCount++;
        }
      }

      // If less than 2 chairs are taken, the slot is available
      if (overlapCount < 2) {
        freeSlots.push(slotStart.toISOString());
      }

      currentMinutes += 15; // Move to next 15-minute interval
    }
  }

  return freeSlots;
};

module.exports = {
  getAvailableSlots
};