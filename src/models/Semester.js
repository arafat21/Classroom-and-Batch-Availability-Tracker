const { pool } = require('../database/db');

class Semester {
    static async findById(semesterId) {
        const [rows] = await pool.execute(`
            SELECT semester_id, semester_no, start_date, end_date
            FROM semesters
            WHERE semester_id = ?
        `, [semesterId]);
        return rows[0];
    }

    static async getCurrent() {
        const [rows] = await pool.execute(`
            SELECT semester_id, semester_no, start_date, end_date
            FROM semesters
            WHERE CURDATE() BETWEEN start_date AND end_date
            LIMIT 1
        `);
        return rows[0];
    }

    static async getAll() {
        const [rows] = await pool.execute(`
            SELECT semester_id, semester_no, start_date, end_date
            FROM semesters
            ORDER BY start_date DESC
        `);
        return rows;
    }
}

module.exports = Semester;