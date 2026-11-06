const pool = require('../config/db');

const blockTime = async (req, res) => {
  try {
    const { startTime, endTime, reason } = req.body;
    if (!startTime || !endTime) {
      return res.status(400).json({ error: 'Start and end time are required' });
    }

    await pool.query(
      'INSERT INTO blocked_dates (start_time, end_time, reason) VALUES ($1, $2, $3)',
      [startTime, endTime, reason]
    );
    res.status(201).json({ message: 'Time blocked successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getBlockedTimes = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM blocked_dates WHERE end_time >= NOW() ORDER BY start_time ASC'
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const unblockTime = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM blocked_dates WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blocked time not found' });
    }
    res.status(200).json({ message: 'Unblocked successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { blockTime, getBlockedTimes, unblockTime };