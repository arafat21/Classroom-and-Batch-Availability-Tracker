const { pool } = require('../database/db');

class Teacher {
    static async findByUserId(userId) {
        const [rows] = await pool.execute(`
            SELECT teacher_id, teacher_name, department
            FROM teachers
            WHERE user_id = ?
        `, [userId]);
        return rows[0];
    }

    static async findById(teacherId) {
        const [rows] = await pool.execute(`
            SELECT teacher_id, teacher_name, department
            FROM teachers
            WHERE teacher_id = ?
        `, [teacherId]);
        return rows[0];
    }

    static async findCourses(teacherId) {
        const [rows] = await pool.execute(`
            SELECT c.course_id, c.course_code, c.course_title,
                   sem.semester_id, sem.semester_no
            FROM courses c
            JOIN semesters sem ON c.semester_id = sem.semester_id
            WHERE c.teacher_id = ?
        `, [teacherId]);
        return rows;
    }
}

module.exports = Teacher;