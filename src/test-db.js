require('dotenv').config();
const { pool } = require('./database/db');

(async () => {
  try {
    const [rows] = await pool.query('SELECT NOW() AS now');
    console.log('DB connection OK — server time:', rows[0].now);
    // show count of tables in classroom_tracker
    const [tables] = await pool.query("SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = ?", [process.env.DB_NAME || 'classroom_tracker']);
    console.log('Tables in database:', tables.map(t => t.TABLE_NAME));
    process.exit(0);
  } catch (err) {
    console.error('DB connection failed:', err.message);
    process.exit(1);
  }
})();
