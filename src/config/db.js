// Load environment variables from the .env file into process.env
require('dotenv').config();

const { Pool } = require('pg');

// A Pool manages multiple connections to the database. 
// When your app needs to query the database, it borrows a connection from the pool, 
// uses it, and returns it. This is highly efficient.
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
});


// Test the connection immediately when this file is loaded
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err.stack);
  } else {
    console.log('✅ Connected to PostgreSQL database at:', res.rows[0].now);
  }
});

// Export the pool so other files can use it
module.exports = pool;