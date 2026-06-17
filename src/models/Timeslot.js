const { pool } = require('../database/db');

class Timeslot {
    static async findAll() {
        const [rows] = await pool.execute(`
            SELECT timeslot_id, slot_no, start_time, end_time
            FROM timeslots
            ORDER BY slot_no
        `);
        return rows;
    }

    static async findById(timeslotId) {
        const [rows] = await pool.execute(`
            SELECT timeslot_id, slot_no, start_time, end_time
            FROM timeslots
            WHERE timeslot_id = ?
        `, [timeslotId]);
        return rows[0];
    }
}

module.exports = Timeslot;