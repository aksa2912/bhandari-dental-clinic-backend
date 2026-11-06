const pool = require('../config/db');

// GET all treatments
const getAllTreatments = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM treatments WHERE is_active = TRUE ORDER BY id ASC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// GET a single treatment by ID
const getTreatmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM treatments WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Treatment not found' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

module.exports = {
  getAllTreatments,
  getTreatmentById
};