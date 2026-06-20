const mysql = require('mysql2/promise');
const fs = require('fs');

async function runSeed() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
  });

  const sql = fs.readFileSync('src\\database\\seed.sql', 'utf8');

  await db.query(sql);

  console.log('Database seeded successfully');
  await db.end();
}

runSeed().catch(err => {
  console.error(err);
  process.exit(1);
});