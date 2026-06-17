const pool = require('../database/db').pool;

class Batch {   
    static async findById(batchId) {
        const [rows] = await pool.execute(`
            SELECT batch_id, batch_name, semester_id
            FROM batches
            WHERE batch_id = ?
        `, [batchId]);
        return rows[0];
    }
    // find batch by semester
    static async findBySemester(semesterId) {
        const [rows] = await pool.execute(`
            SELECT batch_id, batch_name, semester_id
            FROM batches
            WHERE semester_id = ?
        `, [semesterId]);
        return rows;
    }
    // find batch by course
    static async findByCourse(courseId) {
        const [rows] = await pool.execute(`
            SELECT b.batch_id, b.batch_name, b.semester_id
            FROM batches b
            JOIN courses c ON b.semester_id = c.semester_id
            WHERE c.course_id = ?
        `, [courseId]);
        return rows[0];
    }
}