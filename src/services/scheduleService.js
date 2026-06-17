const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Course = require('../models/Course');
const Schedule = require('../models/Schedule');
const Timeslot = require('../models/Timeslot');
const Classroom = require('../models/Classroom');
const Batch = require('../models/Batch');


// Get current date in Bangladesh timezone (UTC+6) as YYYY-MM-DD
function getCurrentDateInBD() {
    const now = new Date();
    const bdTime = new Date(now.getTime() + (6 * 60 * 60 * 1000));
    return bdTime.toISOString().split('T')[0];
}

// Format time to 12-hour format
function formatTime(time) {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

// Convert date to YYYY-MM-DD format for comparison
function toDateString(date) {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().split('T')[0];
}

// Filter schedules to only include today and future dates
function filterTodayAndFutureSchedules(schedules, currentDate) {
    if (!schedules || schedules.length === 0) return [];
    return schedules.filter(schedule => {
        const scheduleDateStr = toDateString(schedule.schedule_date);
        return scheduleDateStr >= currentDate;
    });
}

// Group schedules by date - stores schedules in a map by date
function groupSchedulesByDate(schedules) {
    const schedulesByDate = {};

    schedules.forEach(schedule => {
        const date = toDateString(schedule.schedule_date);
        const slotNo = schedule.slot_no;

        if (!schedulesByDate[date]) {
            schedulesByDate[date] = {};
        }

        schedulesByDate[date][slotNo] = {
            scheduleId: schedule.schedule_id,
            courseId: schedule.course_id,
            courseCode: schedule.course_code,
            courseTitle: schedule.course_title,
            roomNumber: schedule.room_number,
            teacherName: schedule.teacher_name || schedule.teacherName,
            startTime: formatTime(schedule.start_time),
            endTime: formatTime(schedule.end_time),
            semester: schedule.semester_no,
            scheduleType: schedule.schedule_type || 'class'
        };
    });

    return schedulesByDate;
}

// Generate consecutive dates from startDate (30 days from start)
function generateDateRange(startDate, numberOfDays = 30) {
    const dates = [];
    const start = new Date(startDate);

    for (let i = 0; i < numberOfDays; i++) {
        const date = new Date(start);
        date.setDate(date.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
    }

    return dates;
}

// Build grid data with all dates (including empty ones)
function buildCompleteGridData(schedulesByDate, dateRange, timeslots) {
    const gridData = [];

    dateRange.forEach(date => {
        const row = {
            date: date,
            slots: {}
        };

        // Initialize all slots as null
        timeslots.forEach(slot => {
            row.slots[slot.slot_no] = null;
        });

        // Fill in occupied slots if they exist for this date
        if (schedulesByDate[date]) {
            Object.keys(schedulesByDate[date]).forEach(slotNo => {
                row.slots[slotNo] = schedulesByDate[date][slotNo];
            });
        }

        gridData.push(row);
    });

    return gridData;
}

async function getStudentDashboardData(userId) {
    try {
        const student = await Student.findByUserId(userId);
        if (!student) {
            throw new Error('Student not found');
        }

        const allSchedules = await Schedule.findStudentSchedules(student.semester_id);
        const timeslots = await Timeslot.findAll();
        const classrooms = await Classroom.findAll();
        const courses = await Course.getCoursesBySemester(student.semester_id);
        const currentDate = getCurrentDateInBD();

        const futureSchedules = filterTodayAndFutureSchedules(allSchedules, currentDate);
        const schedulesByDate = groupSchedulesByDate(futureSchedules);
        const dateRange = generateDateRange(currentDate, 30);
        const gridData = buildCompleteGridData(schedulesByDate, dateRange, timeslots);

        const formattedTimeslots = timeslots.map(ts => ({
            timeslotId: ts.timeslot_id,
            slotNo: ts.slot_no,
            startTime: formatTime(ts.start_time),
            endTime: formatTime(ts.end_time),
            label: `Slot ${ts.slot_no} (${formatTime(ts.start_time)} - ${formatTime(ts.end_time)})`
        }));

        return {
            user: {
                name: student.student_name,
                rollNo: student.roll_no,
                batch: student.batch_name,
                semester: student.semester_no,
                role: 'student'
            },
            gridData,
            timeslots: formattedTimeslots,
            classrooms,
            courses,
            currentDate
        };
    } catch (error) {
        console.error('Error in getStudentDashboardData:', error);
        throw error;
    }
}

async function getTeacherDashboardData(userId) {
    try {
        const teacher = await Teacher.findByUserId(userId);
        if (!teacher) {
            throw new Error('Teacher not found');
        }

        const allSchedules = await Schedule.findTeacherSchedules(teacher.teacher_id);
        const timeslots = await Timeslot.findAll();
        const classrooms = await Classroom.findAll();
        const courses = await Teacher.findCourses(teacher.teacher_id);
        const currentDate = getCurrentDateInBD();

        const futureSchedules = filterTodayAndFutureSchedules(allSchedules, currentDate);
        const schedulesByDate = groupSchedulesByDate(futureSchedules);
        const dateRange = generateDateRange(currentDate, 30);
        const gridData = buildCompleteGridData(schedulesByDate, dateRange, timeslots);

        const formattedTimeslots = timeslots.map(ts => ({
            timeslotId: ts.timeslot_id,
            slotNo: ts.slot_no,
            startTime: formatTime(ts.start_time),
            endTime: formatTime(ts.end_time),
            label: `Slot ${ts.slot_no} (${formatTime(ts.start_time)} - ${formatTime(ts.end_time)})`
        }));

        return {
            user: {
                name: teacher.teacher_name,
                department: teacher.department,
                role: 'teacher'
            },
            gridData,
            timeslots: formattedTimeslots,
            classrooms,
            courses,
            currentDate
        };
    } catch (error) {
        console.error('Error in getTeacherDashboardData:', error);
        throw error;
    }
}

async function getAdminDashboardData() {
    try {
        const allSchedules = await Schedule.findAllSchedules();
        const timeslots = await Timeslot.findAll();
        const classrooms = await Classroom.findAll();
        const currentDate = getCurrentDateInBD();

        const futureSchedules = filterTodayAndFutureSchedules(allSchedules, currentDate);
        const schedulesByDate = groupSchedulesByDate(futureSchedules);
        const dateRange = generateDateRange(currentDate, 30);
        const gridData = buildCompleteGridData(schedulesByDate, dateRange, timeslots);

        const formattedTimeslots = timeslots.map(ts => ({
            timeslotId: ts.timeslot_id,
            slotNo: ts.slot_no,
            startTime: formatTime(ts.start_time),
            endTime: formatTime(ts.end_time),
            label: `Slot ${ts.slot_no} (${formatTime(ts.start_time)} - ${formatTime(ts.end_time)})`
        }));

        return {
            user: { role: 'admin' },
            gridData,
            timeslots: formattedTimeslots,
            classrooms,
            currentDate
        };
    } catch (error) {
        console.error('Error in getAdminDashboardData:', error);
        throw error;
    }
}

/**
 * Get available slots for a given course and date.
 * A slot is available if: teacher is free AND batch is free AND ≥1 classroom is free.
 * Returns: array of { timeslot, availableClassrooms[] }
 */
async function getAvailableSlots(courseId, date, userId, excludeScheduleId = null) {
    const course = await Course.findById(courseId);
    const teacher = await Teacher.findByUserId(userId);

    if (!course) throw new Error('Course not found');
    if (!teacher) throw new Error('Teacher not found');
    if (parseInt(course.teacher_id) !== parseInt(teacher.teacher_id)) {
        throw new Error('You are not authorized to schedule this course');
    }

    const currentDate = getCurrentDateInBD();
    if (date < currentDate) {
        throw new Error('Cannot check availability for past dates');
    }

    // Weekend Check
    const day = new Date(date).getUTCDay();
    if (day === 5 || day === 6) {
        throw new Error('Cannot schedule classes on weekends (Friday & Saturday)');
    }

    const timeslots = await Timeslot.findAll();
    const availableSlots = [];

    for (const ts of timeslots) {
        // Check teacher conflict
        const teacherConflict = await Schedule.findTeacherConflict(
            teacher.teacher_id, date, ts.timeslot_id, excludeScheduleId
        );
        if (teacherConflict) continue;

        // Check semester (batch) conflict
        const batchConflict = await Schedule.findSemesterConflict(
            course.semester_id, date, ts.timeslot_id, excludeScheduleId
        );
        if (batchConflict) continue;

        // Get available classrooms for this slot
        const availableClassrooms = await Schedule.findAvailableClassrooms(date, ts.timeslot_id);
        if (availableClassrooms.length === 0) continue;

        availableSlots.push({
            timeslot: {
                timeslotId: ts.timeslot_id,
                slotNo: ts.slot_no,
                startTime: formatTime(ts.start_time),
                endTime: formatTime(ts.end_time),
                label: `Slot ${ts.slot_no} (${formatTime(ts.start_time)} - ${formatTime(ts.end_time)})`
            },
            availableClassrooms
        });
    }

    return availableSlots;
}

async function validateSchedule(scheduleData, excludeScheduleId = null) {
    const { courseId, classroomId, timeslotId, scheduleDate, userId } = scheduleData;

    const course = await Course.findById(courseId);
    const teacher = await Teacher.findByUserId(userId);

    if (!course) throw new Error('Course not found');
    if (parseInt(course.teacher_id) !== parseInt(teacher.teacher_id)) {
        throw new Error('You are not authorized to schedule this course');
    }

    const currentDate = getCurrentDateInBD();
    if (scheduleDate < currentDate) {
        throw new Error('Cannot schedule classes in the past');
    }

    // Weekend Check
    const day = new Date(scheduleDate).getUTCDay();
    if (day === 5 || day === 6) {
        throw new Error('Cannot schedule classes on weekends (Friday & Saturday)');
    }

    const classroomConflict = await Schedule.findClassroomConflict(
        classroomId, scheduleDate, timeslotId, excludeScheduleId
    );
    if (classroomConflict) {
        throw new Error('Classroom is already booked for this time slot');
    }

    const teacherConflict = await Schedule.findTeacherConflict(
        teacher.teacher_id, scheduleDate, timeslotId, excludeScheduleId
    );
    if (teacherConflict) {
        throw new Error('You already have a class scheduled at this time');
    }

    const semesterConflict = await Schedule.findSemesterConflict(
        course.semester_id, scheduleDate, timeslotId, excludeScheduleId
    );
    if (semesterConflict) {
        throw new Error('A class for this batch is already scheduled at this time');
    }

    return true;
}

async function createSchedule(scheduleData) {
    await validateSchedule(scheduleData);
    const scheduleId = await Schedule.create(scheduleData);
    return scheduleId;
}

async function cancelSchedule(scheduleId, userId) {
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) throw new Error('Schedule not found');

    const teacher = await Teacher.findByUserId(userId);
    if (!teacher) throw new Error('Teacher not found');

    // Only the course's teacher can cancel
    if (parseInt(schedule.teacher_id) !== parseInt(teacher.teacher_id)) {
        throw new Error('You are not authorized to cancel this schedule');
    }

    // Check if the schedule date is in the past
    const currentDate = getCurrentDateInBD();
    const scheduleDateStr = toDateString(schedule.schedule_date);
    if (scheduleDateStr < currentDate) {
        throw new Error('Cannot cancel past schedules');
    }

    return await Schedule.cancel(scheduleId);
}

async function rescheduleClass(scheduleId, newScheduleData, userId) {
    // Validate the old schedule belongs to this teacher
    const oldSchedule = await Schedule.findById(scheduleId);
    if (!oldSchedule) throw new Error('Original schedule not found');

    const teacher = await Teacher.findByUserId(userId);
    if (!teacher) throw new Error('Teacher not found');

    if (parseInt(oldSchedule.teacher_id) !== parseInt(teacher.teacher_id)) {
        throw new Error('You are not authorized to reschedule this class');
    }

    // Check old schedule is not in the past
    const currentDate = getCurrentDateInBD();
    const oldDateStr = toDateString(oldSchedule.schedule_date);
    if (oldDateStr < currentDate) {
        throw new Error('Cannot reschedule past classes');
    }

    // Validate new slot (exclude the old schedule from conflict checks)
    await validateSchedule(
        { ...newScheduleData, courseId: oldSchedule.course_id, userId },
        scheduleId
    );

    // Cancel old schedule (soft delete)
    await Schedule.cancel(scheduleId);

    // Create new schedule with same course
    const newScheduleId = await Schedule.create({
        courseId: oldSchedule.course_id,
        classroomId: newScheduleData.classroomId,
        timeslotId: newScheduleData.timeslotId,
        scheduleDate: newScheduleData.scheduleDate,
        scheduleType: oldSchedule.schedule_type || 'class'
    });

    return newScheduleId;
}

async function getAvailableCoursesForSlot(userId, date, timeslotId) {
    const teacher = await Teacher.findByUserId(userId);
    if (!teacher) throw new Error('Teacher not found');

    // Weekend Check
    const day = new Date(date).getUTCDay();
    if (day === 5 || day === 6) {
        throw new Error('Cannot schedule classes on weekends (Friday & Saturday)');
    }

    const courses = await Teacher.findCourses(teacher.teacher_id);
    const availableCourses = [];

    // Check if the teacher has a class scheduled at this time slot
    const teacherConflict = await Schedule.findTeacherConflict(
        teacher.teacher_id, date, timeslotId
    );

    if (teacherConflict) {
        return [];
    }

    for (const course of courses) {
        // Check if the batch (semester) has a class scheduled at this time slot
        const batchConflict = await Schedule.findSemesterConflict(
            course.semester_id, date, timeslotId
        );
        if (!batchConflict) {
            availableCourses.push({
                course_id: course.course_id,
                course_code: course.course_code,
                course_title: course.course_title,
                semester_id: course.semester_id,
                semester_no: course.semester_no
            });
        }
    }

    return availableCourses;
}

async function getAvailabilityGrid(courseId, classroomId, userId) {
    const { pool } = require('../database/db');

    const course = await Course.findById(courseId);
    const teacher = await Teacher.findByUserId(userId);

    if (!course) throw new Error('Course not found');
    if (!teacher) throw new Error('Teacher not found');
    if (parseInt(course.teacher_id) !== parseInt(teacher.teacher_id)) {
        throw new Error('You are not authorized to check availability for this course');
    }

    const currentDate = getCurrentDateInBD();
    const dateRange = generateDateRange(currentDate, 30);
    const activeDates = dateRange.filter(date => {
        const day = new Date(date).getUTCDay();
        return day !== 5 && day !== 6;
    });

    const timeslots = await Timeslot.findAll();

    const [teacherSchedules] = await pool.execute(`
        SELECT s.schedule_date, s.timeslot_id
        FROM schedules s
        JOIN courses c ON s.course_id = c.course_id
        WHERE c.teacher_id = ? AND s.schedule_date >= ? AND s.status = 'scheduled'
    `, [teacher.teacher_id, currentDate]);

    const [batchSchedules] = await pool.execute(`
        SELECT s.schedule_date, s.timeslot_id
        FROM schedules s
        JOIN courses c ON s.course_id = c.course_id
        WHERE c.semester_id = ? AND s.schedule_date >= ? AND s.status = 'scheduled'
    `, [course.semester_id, currentDate]);

    let classroomBookings;
    if (classroomId && classroomId !== 'all') {
        const [rows] = await pool.execute(`
            SELECT schedule_date, timeslot_id, classroom_id
            FROM schedules
            WHERE classroom_id = ? AND schedule_date >= ? AND status = 'scheduled'
        `, [classroomId, currentDate]);
        classroomBookings = rows;
    } else {
        const [rows] = await pool.execute(`
            SELECT schedule_date, timeslot_id, classroom_id
            FROM schedules
            WHERE schedule_date >= ? AND status = 'scheduled'
        `, [currentDate]);
        classroomBookings = rows;
    }

    const teacherBusy = new Set(teacherSchedules.map(s => `${toDateString(s.schedule_date)}_${s.timeslot_id}`));
    const batchBusy = new Set(batchSchedules.map(s => `${toDateString(s.schedule_date)}_${s.timeslot_id}`));

    const classroomBookedIds = {};
    classroomBookings.forEach(b => {
        const key = `${toDateString(b.schedule_date)}_${b.timeslot_id}`;
        if (!classroomBookedIds[key]) {
            classroomBookedIds[key] = new Set();
        }
        classroomBookedIds[key].add(b.classroom_id);
    });

    const allClassrooms = await Classroom.findAll();

    const grid = [];
    for (const date of activeDates) {
        const row = {
            date,
            slots: {}
        };

        for (const ts of timeslots) {
            const key = `${date}_${ts.timeslot_id}`;

            const isTeacherBusy = teacherBusy.has(key);
            const isBatchBusy = batchBusy.has(key);

            let availableRooms = [];
            if (classroomId && classroomId !== 'all') {
                const isRoomBooked = classroomBookedIds[key]?.has(parseInt(classroomId));
                if (!isRoomBooked) {
                    const room = allClassrooms.find(r => r.classroom_id === parseInt(classroomId));
                    if (room) availableRooms.push(room);
                }
            } else {
                const bookedSet = classroomBookedIds[key] || new Set();
                availableRooms = allClassrooms.filter(r => !bookedSet.has(r.classroom_id));
            }

            const isClassroomBusy = availableRooms.length === 0;

            row.slots[ts.slot_no] = {
                timeslotId: ts.timeslot_id,
                isTeacherBusy,
                isBatchBusy,
                isClassroomBusy,
                availableRooms: availableRooms.map(r => ({
                    classroomId: r.classroom_id,
                    roomNumber: r.room_number
                })),
                available: !isTeacherBusy && !isBatchBusy && !isClassroomBusy
            };
        }
        grid.push(row);
    }

    return {
        grid,
        timeslots: timeslots.map(ts => ({
            timeslotId: ts.timeslot_id,
            slotNo: ts.slot_no,
            startTime: formatTime(ts.start_time),
            endTime: formatTime(ts.end_time),
            label: `Slot ${ts.slot_no} (${formatTime(ts.start_time)} - ${formatTime(ts.end_time)})`
        }))
    };
}

module.exports = {
    getStudentDashboardData,
    getTeacherDashboardData,
    getAdminDashboardData,
    getAvailableSlots,
    validateSchedule,
    createSchedule,
    cancelSchedule,
    rescheduleClass,
    getCurrentDateInBD,
    formatTime,
    filterTodayAndFutureSchedules,
    toDateString,
    generateDateRange,
    buildCompleteGridData,
    getAvailableCoursesForSlot,
    getAvailabilityGrid
};