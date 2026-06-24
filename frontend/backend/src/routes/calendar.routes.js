const express = require('express');
const router = express.Router();
const CalendarController = require('../controllers/calendar.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// GET /api/calendar-events - get all calendar events (currently just approved meetups)
router.get('/', authMiddleware, CalendarController.getEvents);

module.exports = router;