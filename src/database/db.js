const mysql = require('mysql2/promise');

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'classroom_tracker',
    timezone: '+06:00',  // Bangladesh timezone (UTC+6)
    dateStrings: true,   // Return dates as strings
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('Database connection failed:', error.message);
        return false;
    }
}

// Get connection from pool
async function getConnection() {
    return await pool.getConnection();
}

module.exports = { pool, getConnection, testConnection };