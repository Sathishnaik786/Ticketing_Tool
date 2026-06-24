const express = require('express');
const router = express.Router();
const attendanceController = require('@controllers/attendance.controller');
const authMiddleware = require('@middlewares/auth.middleware');

router.use(authMiddleware);

router.post('/check-in', attendanceController.checkIn);
router.post('/check-out', attendanceController.checkOut);
router.get('/me', attendanceController.getMyAttendance);
router.get('/report', attendanceController.getReport);

module.exports = router;
