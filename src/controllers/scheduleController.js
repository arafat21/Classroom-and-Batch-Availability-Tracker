const scheduleService = require('../services/scheduleService');

async function getDashboard(req, res) {
    try {
        const userId = req.userId;
        const userRole = req.user.role;

        let dashboardData;

        if (userRole === 'student') {
            dashboardData = await scheduleService.getStudentDashboardData(userId);
        } else if (userRole === 'teacher') {
            dashboardData = await scheduleService.getTeacherDashboardData(userId);
        } else {
            dashboardData = await scheduleService.getAdminDashboardData();
        }

        res.json({ success: true, data: dashboardData });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function getSchedulingData(req, res) {
    try {
        const Timeslot = require('../models/Timeslot');
        const Classroom = require('../models/Classroom');
        const Teacher = require('../models/Teacher');

        const timeslots = await Timeslot.findAll();
        const classrooms = await Classroom.findAll();

        let courses = [];
        if (req.user.role === 'teacher') {
            const teacher = await Teacher.findByUserId(req.userId);
            if (teacher) {
                courses = await Teacher.findCourses(teacher.teacher_id);
            }
        }

        res.json({
            success: true,
            data: { timeslots, classrooms, courses }
        });
    } catch (error) {
        console.error('Scheduling data error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function getAvailableSlots(req, res) {
    try {
        const { courseId, date, excludeScheduleId } = req.query;
        const userId = req.userId;

        if (!courseId || !date) {
            return res.status(400).json({
                success: false,
                error: 'courseId and date are required'
            });
        }

        const availableSlots = await scheduleService.getAvailableSlots(
            courseId,
            date,
            userId,
            excludeScheduleId || null
        );

        res.json({ success: true, data: { availableSlots } });
    } catch (error) {
        console.error('Available slots error:', error);
        res.status(400).json({ success: false, error: error.message });
    }
}

async function createSchedule(req, res) {
    try {
        const { courseId, classroomId, timeslotId, scheduleDate, scheduleType } = req.body;
        const userId = req.userId;

        if (!courseId || !classroomId || !timeslotId || !scheduleDate) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: courseId, classroomId, timeslotId, scheduleDate'
            });
        }

        const scheduleId = await scheduleService.createSchedule({
            courseId,
            classroomId,
            timeslotId,
            scheduleDate,
            scheduleType: scheduleType || 'class',
            userId
        });

        res.json({
            success: true,
            message: 'Schedule created successfully',
            scheduleId
        });
    } catch (error) {
        console.error('Create schedule error:', error);
        res.status(409).json({ success: false, error: error.message });
    }
}

async function cancelSchedule(req, res) {
    try {
        const scheduleId = req.params.id;
        const userId = req.userId;

        const result = await scheduleService.cancelSchedule(scheduleId, userId);

        if (result) {
            res.json({ success: true, message: 'Schedule cancelled successfully' });
        } else {
            res.status(404).json({ success: false, error: 'Schedule not found' });
        }
    } catch (error) {
        console.error('Cancel schedule error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function rescheduleClass(req, res) {
    try {
        const scheduleId = req.params.id;
        const { classroomId, timeslotId, scheduleDate } = req.body;
        const userId = req.userId;

        if (!classroomId || !timeslotId || !scheduleDate) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: classroomId, timeslotId, scheduleDate'
            });
        }

        const newScheduleId = await scheduleService.rescheduleClass(
            scheduleId,
            { classroomId, timeslotId, scheduleDate },
            userId
        );

        res.json({
            success: true,
            message: 'Class rescheduled successfully',
            newScheduleId
        });
    } catch (error) {
        console.error('Reschedule error:', error);
        res.status(409).json({ success: false, error: error.message });
    }
}

async function getAvailableCourses(req, res) {
    try {
        const { date, timeslotId } = req.query;
        const userId = req.userId;

        if (!date || !timeslotId) {
            return res.status(400).json({
                success: false,
                error: 'date and timeslotId are required'
            });
        }

        const courses = await scheduleService.getAvailableCoursesForSlot(userId, date, parseInt(timeslotId));
        res.json({ success: true, data: { courses } });
    } catch (error) {
        console.error('Available courses error:', error);
        res.status(400).json({ success: false, error: error.message });
    }
}

async function getAvailabilityGrid(req, res) {
    try {
        const { courseId, classroomId } = req.query;
        const userId = req.userId;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                error: 'courseId is required'
            });
        }

        const data = await scheduleService.getAvailabilityGrid(
            courseId,
            classroomId || null,
            userId
        );

        res.json({ success: true, data });
    } catch (error) {
        console.error('Availability grid error:', error);
        res.status(400).json({ success: false, error: error.message });
    }
}

module.exports = {
    getDashboard,
    getSchedulingData,
    getAvailableSlots,
    createSchedule,
    cancelSchedule,
    rescheduleClass,
    getAvailableCourses,
    getAvailabilityGrid
};