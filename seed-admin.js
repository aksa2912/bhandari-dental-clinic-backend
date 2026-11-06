const bcrypt = require('bcrypt');
const pool = require('./src/config/db');

const createAdmin = async () => {
  try {
    const email = 'kimmybhandari1984@gmail.com';
    const plainPassword = 'aksa2008';
    
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