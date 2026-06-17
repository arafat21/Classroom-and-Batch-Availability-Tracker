const { pool } = require('../database/db');

class User {
    static async findByEmail(email) {
        const [rows] = await pool.execute(
            'SELECT user_id, email, password_hash, role FROM users WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    static async findById(userId) {
        const [rows] = await pool.execute(
            'SELECT user_id, email, role FROM users WHERE user_id = ?',
            [userId]
        );
        return rows[0];
    }

    static async create(email, passwordHash, role) {
        const [result] = await pool.execute(
            'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
            [email, passwordHash, role]
        );
        return result.insertId;
    }
}

module.exports = User;