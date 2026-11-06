const pool = require('./src/config/db');

const createTables = async () => {
  try {
    const queryText = `
      CREATE TABLE IF NOT EXISTS treatments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        duration_minutes INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await pool.query(queryText);
    console.log("✅ Table 'treatments' created successfully!");
    
    // Insert the initial data from our old fake array
    const insertQuery = `
      INSERT INTO treatments (name, duration_minutes) VALUES 
      ('Consultation', 15),
      ('Scaling & Polishing', 30),
      ('Root Canal Treatment', 60),
      ('Tooth Extraction', 45)
      ON CONFLICT DO NOTHING;
    `;
    await pool.query(insertQuery);
    console.log("✅ Initial treatments inserted!");
    
  } catch (err) {
    console.error("❌ Error creating table:", err);
  } finally {
    pool.end(); // Close the connection so the script exits
  }
};

createTables();