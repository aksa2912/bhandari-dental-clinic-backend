const pool = require('../config/db');

const blockDate = async (req, res) => {
  try {
    const { date, reason } = req.body;
    if (!date) return res.status(400).json({ error: 'Date is required' });

    await pool.query(
      'INSERT INTO blocked_dates (date, reason) VALUES ($1, $2) ON CONFLICT (date) DO UPDATE SET reason = $2',
      [date, reason]
    );
    res.status(201).json({ message: 'Date blocked successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getBlockedDates = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM blocked_dates ORDER BY date ASC');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { blockDate, getBlockedDates };