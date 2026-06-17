const { pool } = require('../database/db');

class Course {
    static async findById(courseId) {
        const [rows] = await pool.execute(`
            SELECT c.course_id, c.course_code, c.course_title, c.semester_id,
                   t.teacher_id, t.teacher_name
            FROM courses c
            JOIN teachers t ON c.teacher_id = t.teacher_id
            WHERE c.course_id = ?
        `, [courseId]);
        return rows[0];
    }

    static async findByTeacher(teacherId) {
        const [rows] = await pool.execute(`
            SELECT course_id, course_code, course_title, semester_id
            FROM courses
            WHERE teacher_id = ?
        `, [teacherId]);
        return rows;
    }

    static async getSemester(courseId) {
        const [rows] = await pool.execute(`
            SELECT semester_id
            FROM courses
            WHERE course_id = ?
        `, [courseId]);
        return rows[0];
    }

    static async getCoursesBySemester(semesterId) {
        const [rows] = await pool.execute(`
            SELECT c.course_id, c.course_code, c.course_title,
                   t.teacher_name, t.teacher_id
            FROM courses c
            JOIN teachers t ON c.teacher_id = t.teacher_id
            WHERE c.semester_id = ?
        `, [semesterId]);
        return rows;
    }
}

module.exports = Course;