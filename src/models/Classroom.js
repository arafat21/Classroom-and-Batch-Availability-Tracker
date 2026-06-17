const { pool } = require('../database/db');

class Classroom {
    static async findAll() {
        const [rows] = await pool.execute(
            'SELECT classroom_id, room_number FROM classrooms ORDER BY room_number'
        );
        return rows;
    }

    static async findById(classroomId) {
        const [rows] = await pool.execute(
            'SELECT classroom_id, room_number FROM classrooms WHERE classroom_id = ?',
            [classroomId]
        );
        return rows[0];
    }

    static async getAvailableClassrooms(date, timeslotId) {
        const [rows] = await pool.execute(
            `SELECT c.classroom_id, c.room_number
             FROM classrooms c
             WHERE c.classroom_id NOT IN (
                 SELECT s.classroom_id 
                 FROM schedules s 
                 WHERE s.schedule_date = ? AND s.timeslot_id = ?
             )`,
            [date, timeslotId]
        );
        return rows;
    }
}

module.exports = Classroom;