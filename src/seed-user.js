require('dotenv').config();
const pool = require('./database/db');
const bcrypt = require('bcrypt');

(async () => {
  try {
    const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.SEED_ADMIN_PASSWORD || 'password123';
    const role = 'admin';

    // check exists
    const [rows] = await pool.execute('SELECT user_id FROM users WHERE email = ?', [email]);
    if (rows.length) {
      console.log('Admin user already exists:', email);
      process.exit(0);
    }

    const hash = await bcrypt.hash(password, 10);
    //const [result] = await pool.query('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)', [email, hash, role]);
    
    const [result] = await pool.execute(
            'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
            [email, hash, role]
        );
    
    console.log('Inserted admin user:', email, 'id=', result.insertId);
    console.log('Login with:', email, '/', password);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
})();
