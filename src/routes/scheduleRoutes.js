const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { teacherOnly } = require('../middleware/roleMiddleware');
const {
    getDashboard,
    getSchedulingData,
    getAvailableSlots,
    createSchedule,
    cancelSchedule,
    rescheduleClass,
    getAvailableCourses,
    getAvailabilityGrid
} = require('../controllers/scheduleController');

const router = express.Router();

// All schedule routes require authentication
router.use(authenticate);

// GET /api/schedule/dashboard - Get dashboard data based on role
router.get('/dashboard', getDashboard);

// GET /api/schedule/scheduling-data - Get data for scheduling (teachers only)
router.get('/scheduling-data', teacherOnly, getSchedulingData);

// GET /api/schedule/available-slots - Get available slots for a course+date (teachers only)
router.get('/available-slots', teacherOnly, getAvailableSlots);

// GET /api/schedule/available-courses - Get available courses for a slot (teachers only)
router.get('/available-courses', teacherOnly, getAvailableCourses);

// GET /api/schedule/availability-grid - Get 30-day availability grid (teachers only)
router.get('/availability-grid', teacherOnly, getAvailabilityGrid);

// POST /api/schedule/create - Create new schedule (teachers only)
router.post('/create', teacherOnly, createSchedule);

// DELETE /api/schedule/:id/cancel - Soft-cancel a schedule (teachers only)
router.delete('/:id/cancel', teacherOnly, cancelSchedule);

// PUT /api/schedule/:id/reschedule - Reschedule a class (teachers only)
router.put('/:id/reschedule', teacherOnly, rescheduleClass);

module.exports = router;