require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');


async function seed() {

console.log({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME
});

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME // e.g. classroom_tracker_main
  });

  const sqlPath = path.join(__dirname, 'src', 'database', 'seed.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  await connection.query(sql);

  console.log('Seed completed');
  await connection.end();
}

seed().catch(console.error);