const { pool } = require('../database/db');

class Schedule {
    // Get schedules for a student's semester (only 'scheduled' status)
    static async findStudentSchedules(semesterId) {
        const [rows] = await pool.execute(`
            SELECT s.schedule_id, s.schedule_date, s.schedule_type,
                   c.course_id, c.course_code, c.course_title,
                   cr.room_number,
                   ts.timeslot_id, ts.slot_no, ts.start_time, ts.end_time,
                   t.teacher_name
            FROM schedules s
            JOIN courses c ON s.course_id = c.course_id
            JOIN classrooms cr ON s.classroom_id = cr.classroom_id
            JOIN timeslots ts ON s.timeslot_id = ts.timeslot_id
            JOIN teachers t ON c.teacher_id = t.teacher_id
            WHERE c.semester_id = ? AND s.status = 'scheduled'
            ORDER BY s.schedule_date, ts.slot_no
        `, [semesterId]);
        return rows;
    }

    // Get schedules for a teacher's courses (only 'scheduled' status)
    static async findTeacherSchedules(teacherId) {
        const [rows] = await pool.execute(`
            SELECT s.schedule_id, s.schedule_date, s.schedule_type,
                   c.course_id, c.course_code, c.course_title,
                   cr.room_number,
                   ts.timeslot_id, ts.slot_no, ts.start_time, ts.end_time,
                   sem.semester_no
            FROM schedules s
            JOIN courses c ON s.course_id = c.course_id
            JOIN classrooms cr ON s.classroom_id = cr.classroom_id
            JOIN timeslots ts ON s.timeslot_id = ts.timeslot_id
            JOIN semesters sem ON c.semester_id = sem.semester_id
            WHERE c.teacher_id = ? AND s.status = 'scheduled'
            ORDER BY s.schedule_date, ts.slot_no
        `, [teacherId]);
        return rows;
    }

    // Get all schedules (for admin, only scheduled)
    static async findAllSchedules() {
        const [rows] = await pool.execute(`
            SELECT s.schedule_id, s.schedule_date, s.schedule_type,
                   c.course_id, c.course_code, c.course_title,
                   cr.room_number,
                   ts.timeslot_id, ts.slot_no, ts.start_time, ts.end_time,
                   t.teacher_name,
                   sem.semester_no
            FROM schedules s
            JOIN courses c ON s.course_id = c.course_id
            JOIN classrooms cr ON s.classroom_id = cr.classroom_id
            JOIN timeslots ts ON s.timeslot_id = ts.timeslot_id
            JOIN teachers t ON c.teacher_id = t.teacher_id
            JOIN semesters sem ON c.semester_id = sem.semester_id
            WHERE s.status = 'scheduled'
            ORDER BY s.schedule_date, ts.slot_no
        `);
        return rows;
    }

    // Check classroom conflict (only active schedules)
    static async findClassroomConflict(classroomId, date, timeslotId, excludeScheduleId = null) {
        let query = `
            SELECT schedule_id FROM schedules
            WHERE classroom_id = ? AND schedule_date = ? AND timeslot_id = ?
            AND status = 'scheduled'
        `;
        const params = [classroomId, date, timeslotId];
        if (excludeScheduleId) {
            query += ' AND schedule_id != ?';
            params.push(excludeScheduleId);
        }
        const [rows] = await pool.execute(query, params);
        return rows[0];
    }

    // Check teacher conflict (only active schedules)
    static async findTeacherConflict(teacherId, date, timeslotId, excludeScheduleId = null) {
        let query = `
            SELECT s.schedule_id
            FROM schedules s
            JOIN courses c ON s.course_id = c.course_id
            WHERE c.teacher_id = ? AND s.schedule_date = ? AND s.timeslot_id = ?
            AND s.status = 'scheduled'
        `;
        const params = [teacherId, date, timeslotId];
        if (excludeScheduleId) {
            query += ' AND s.schedule_id != ?';
            params.push(excludeScheduleId);
        }
        const [rows] = await pool.execute(query, params);
        return rows[0];
    }

    // Check semester/batch conflict (only active schedules)
    static async findSemesterConflict(semesterId, date, timeslotId, excludeScheduleId = null) {
        let query = `
            SELECT s.schedule_id
            FROM schedules s
            JOIN courses c ON s.course_id = c.course_id
            WHERE c.semester_id = ? AND s.schedule_date = ? AND s.timeslot_id = ?
            AND s.status = 'scheduled'
        `;
        const params = [semesterId, date, timeslotId];
        if (excludeScheduleId) {
            query += ' AND s.schedule_id != ?';
            params.push(excludeScheduleId);
        }
        const [rows] = await pool.execute(query, params);
        return rows[0];
    }

    // Get classrooms available for a given date and timeslot
    static async findAvailableClassrooms(date, timeslotId) {
        const [rows] = await pool.execute(
            `SELECT c.classroom_id, c.room_number
             FROM classrooms c
             WHERE c.classroom_id NOT IN (
                 SELECT s.classroom_id
                 FROM schedules s
                 WHERE s.schedule_date = ? AND s.timeslot_id = ? AND s.status = 'scheduled'
             )
             ORDER BY c.room_number`,
            [date, timeslotId]
        );
        return rows;
    }

    // Get schedule by ID
    static async findById(scheduleId) {
        const [rows] = await pool.execute(`
            SELECT s.*, c.course_code, c.course_title, c.teacher_id, c.semester_id,
                   cr.room_number, ts.slot_no, ts.start_time, ts.end_time
            FROM schedules s
            JOIN courses c ON s.course_id = c.course_id
            JOIN classrooms cr ON s.classroom_id = cr.classroom_id
            JOIN timeslots ts ON s.timeslot_id = ts.timeslot_id
            WHERE s.schedule_id = ?
        `, [scheduleId]);
        return rows[0];
    }

    // Create new schedule
    static async create(scheduleData) {
        const { courseId, classroomId, timeslotId, scheduleDate, scheduleType = 'class' } = scheduleData;
        const [result] = await pool.execute(`
            INSERT INTO schedules (course_id, classroom_id, timeslot_id, schedule_date, status, schedule_type)
            VALUES (?, ?, ?, ?, 'scheduled', ?)
        `, [courseId, classroomId, timeslotId, scheduleDate, scheduleType]);
        return result.insertId;
    }

    // Soft-cancel schedule (update status to cancelled)
    static async cancel(scheduleId) {
        const [result] = await pool.execute(`
            UPDATE schedules SET status = 'cancelled' WHERE schedule_id = ?
        `, [scheduleId]);
        return result.affectedRows > 0;
    }
}

module.exports = Schedule;