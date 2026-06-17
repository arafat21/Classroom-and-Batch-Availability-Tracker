const { pool } = require('../database/db');

class Student {
    static async findByUserId(userId) {
        const [rows] = await pool.execute(`
            SELECT s.student_id, s.student_name, s.roll_no, 
                   b.batch_id, b.batch_name,
                   sem.semester_id, sem.semester_no
            FROM students s
            JOIN batches b ON s.batch_id = b.batch_id
            JOIN semesters sem ON b.semester_id = sem.semester_id
            WHERE s.user_id = ?
        `, [userId]);
        return rows[0];
    }

    static async findById(studentId) {
        const [rows] = await pool.execute(`
            SELECT s.student_id, s.student_name, s.roll_no, 
                   b.batch_id, b.batch_name,
                   sem.semester_id, sem.semester_no
            FROM students s
            JOIN batches b ON s.batch_id = b.batch_id
            JOIN semesters sem ON b.semester_id = sem.semester_id
            WHERE s.student_id = ?
        `, [studentId]);
        return rows[0];
    }

    static async getSemester(studentId) {
        const [rows] = await pool.execute(`
            SELECT sem.semester_id, sem.semester_no
            FROM students s
            JOIN batches b ON s.batch_id = b.batch_id
            JOIN semesters sem ON b.semester_id = sem.semester_id
            WHERE s.student_id = ?
        `, [studentId]);
        return rows[0];
    }
}

module.exports = Student;