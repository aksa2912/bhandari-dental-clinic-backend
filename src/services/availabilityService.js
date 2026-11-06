const pool = require('../config/db');

const getAvailableSlots = async (date, treatmentId) => {
  // 1. Check if the date is a Sunday (0 = Sunday)
  const dayOfWeek = new Date(`${date}T00:00:00Z`).getUTCDay();
  if (dayOfWeek === 0) {
    return []; // No slots available on Sundays
  }

  // 2. Get the duration of the treatment
  const treatmentRes = await pool.query('SELECT duration_minutes FROM treatments WHERE id = $1', [treatmentId]);
  if (treatmentRes.rows.length === 0) {
    throw new Error('Treatment not found');
  }
  const duration = treatmentRes.rows[0].duration_minutes;

  // 3. Define the day start and end FIRST
  const dayStart = `${date}T00:00:00.000Z`;
  const dayEnd = `${date}T23:59:59.999Z`;

  // 4. Fetch existing appointments for this day
  const appointmentsRes = await pool.query(
    `SELECT start_time, end_time FROM appointments 
     WHERE status = 'confirmed' AND start_time < $2 AND end_time > $1`,
    [dayStart, dayEnd]
  );

  // 5. Fetch blocked slots for this day
  const blockedRes = await pool.query(
    `SELECT start_time, end_time FROM blocked_dates 
     WHERE start_time < $2 AND end_time > $1`,
    [dayStart, dayEnd]
  );

  // 6. Combine both arrays of busy times
  const busyIntervals = appointmentsRes.rows.concat(blockedRes.rows);

  const freeSlots = [];

  // 7. The Clinic Hours (in UTC hours)
  // 10:00 AM IST = 04:30 UTC. 2:00 PM IST = 08:30 UTC.
  // 4:00 PM IST = 10:30 UTC. 7:00 PM IST = 13:30 UTC.
  const periods = [
    { start: 4.5, end: 8.5 },   // Morning
    { start: 10.5, end: 13.5 }  // Evening
  ];

  // 8. Generate the slots
  for (const period of periods) {
    let currentMinutes = period.start * 60;
    const endMinutes = period.end * 60;

    while (currentMinutes + duration <= endMinutes) {
      const slotStart = new Date(`${date}T00:00:00.000Z`);
      slotStart.setUTCMinutes(currentMinutes);
      
      const slotEnd = new Date(slotStart.getTime() + duration * 60000);

      let overlapCount = 0;
      for (const busy of busyIntervals) {
        const bStart = new Date(busy.start_time).getTime();
        const bEnd = new Date(busy.end_time).getTime();
        
        // Overlap test: half-open intervals [start, end)
        if (slotStart.getTime() < bEnd && slotEnd.getTime() > bStart) {
          overlapCount++;
        }
      }

      if (overlapCount < 2) {
        freeSlots.push(slotStart.toISOString());
      }

      currentMinutes += 15;
    }
  }

  return freeSlots;
};

module.exports = {
  getAvailableSlots
};