const bcrypt = require('bcrypt');
const pool = require('./src/config/db');

const createAdmin = async () => {
  try {
    const email = 'admin@bhandari.com';
    const plainPassword = 'clinic123';
    
    // Hash the password
    const hash = await bcrypt.hash(plainPassword, 10);
    
    // Insert into database
    await pool.query(
      'INSERT INTO admin_users (email, password_hash) VALUES ($1, $2) ON CONFLICT DO NOTHING', 
      [email, hash]
    );
    
    console.log(`✅ Admin user created: ${email} (Password: ${plainPassword})`);
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    pool.end();
  }
};

createAdmin();