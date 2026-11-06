const pool = require('./src/config/db');

const createTables = async () => {
  try {
    // 1. Create treatments table
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
    
    // Insert treatments
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

    // 2. Create appointments table
    const appointmentTableQuery = `
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        patient_name VARCHAR(100) NOT NULL,
        patient_phone VARCHAR(15) NOT NULL,
        treatment_id INTEGER REFERENCES treatments(id),
        start_time TIMESTAMPTZ NOT NULL,
        end_time TIMESTAMPTZ NOT NULL,
        status VARCHAR(20) DEFAULT 'confirmed',
        source VARCHAR(20) DEFAULT 'online',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(appointmentTableQuery);
    console.log("✅ Table 'appointments' created successfully!");

    // 3. Create admin_users table (NOW INSIDE THE TRY BLOCK)
    const adminTableQuery = `
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL
      );
    `;
    await pool.query(adminTableQuery);
    console.log("✅ Table 'admin_users' created successfully!");
        // 4. Create blocked_dates table
    const blockedTableQuery = `
      CREATE TABLE IF NOT EXISTS blocked_dates (
        id SERIAL PRIMARY KEY,
        date DATE UNIQUE NOT NULL,
        reason VARCHAR(100)
      );
    `;
    await pool.query(blockedTableQuery);
    console.log("✅ Table 'blocked_dates' created successfully!");
  } catch (err) {
    console.error("❌ Error creating table:", err);
  } finally {
    pool.end(); // Close the connection so the script exits
  }
};

createTables();