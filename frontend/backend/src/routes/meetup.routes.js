const express = require('express');
const router = express.Router();
const MeetupController = require('../controllers/meetup.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// GET /api/meetups - list all visible meetups (approved + own pending)
router.get('/', authMiddleware, MeetupController.getAll);

// POST /api/meetups/request - employee requests a meetup (status will be pending)
router.post('/request', authMiddleware, MeetupController.request);

// POST /api/meetups/create - admin/manager creates an approved meetup
router.post('/create', authMiddleware, roleMiddleware(['ADMIN', 'MANAGER']), MeetupController.create);

// POST /api/meetups/approve/:id - approve or reject a meetup
router.post('/approve/:id', authMiddleware, roleMiddleware(['ADMIN', 'MANAGER']), MeetupController.approve);

// GET /api/meetups/:id - get a specific meetup by ID
router.get('/:id', authMiddleware, MeetupController.getById);

module.exports = router;