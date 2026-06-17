require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function runFile(conn, filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  if (!sql.trim()) return;
  console.log('Executing', filePath);
  try {
    await conn.query(sql);
  } catch (err) {
    console.warn('Bulk execution failed, falling back to statement-by-statement. Error:', err.message);
    const parts = sql.split(/;\s*\n/);
    for (let part of parts) {
      part = part.trim();
      if (!part) continue;
      try {
        await conn.query(part);
      } catch (e) {
        const msg = (e && e.message) ? e.message : '';
        // ignore duplicate/index-exists errors and continue
        if (msg.includes('Duplicate key name') || msg.includes('already exists') || msg.includes('ER_DUP_KEYNAME') || msg.includes('Duplicate entry')) {
          console.log('Ignored non-fatal SQL error:', msg);
          continue;
        }
        console.error('Fatal statement error:', msg);
        throw e;
      }
    }
  }
}

(async () => {
  try {
    const config = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true,
    };

    const conn = await mysql.createConnection(config);

    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const seedPath = path.join(__dirname, 'database', 'seed.sql');

    await runFile(conn, schemaPath);
    await runFile(conn, seedPath);

    // verify
    const [tables] = await conn.query("SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = ?", [process.env.DB_NAME || 'classroom_tracker']);
    console.log('Tables now in database:', tables.map(t => t.TABLE_NAME));

    await conn.end();
    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('setup-db failed:', err.message);
    process.exit(1);
  }
})();
