const MeetupService = require('./meetup.service');

class MeetupController {
  // GET /api/meetups - list all visible meetups
  static async getAll(req, res) {
    try {
      const userId = req.user.id;
      const role = req.user.role;

      const meetups = await MeetupService.getAllMeetups(userId, role);

      res.status(200).json({
        success: true,
        data: meetups
      });
    } catch (error) {
      console.error('Error getting meetups:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // POST /api/meetups/request - employee requests a meetup (status will be pending)
  static async request(req, res) {
    try {
      const userId = req.user.id;
      const role = req.user.role;
      const meetupData = req.body;

      const meetup = await MeetupService.requestMeetup(meetupData, userId, role);

      res.status(201).json({
        success: true,
        data: meetup
      });
    } catch (error) {
      console.error('Error requesting meetup:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // POST /api/meetups/create - admin/manager creates an approved meetup
  static async create(req, res) {
    try {
      const userId = req.user.id;
      const role = req.user.role;
      const meetupData = req.body;

      const meetup = await MeetupService.createMeetup(meetupData, userId, role);

      res.status(201).json({
        success: true,
        data: meetup
      });
    } catch (error) {
      console.error('Error creating meetup:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // POST /api/meetups/approve/:id - approve or reject a meetup
  static async approve(req, res) {
    try {
      const { id } = req.params;
      const { approved } = req.body;
      const userId = req.user.id;
      const role = req.user.role;

      const meetup = await MeetupService.approveMeetup(id, approved, userId, role);

      res.status(200).json({
        success: true,
        data: meetup
      });
    } catch (error) {
      console.error('Error approving/rejecting meetup:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/meetups/:id - get a specific meetup by ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const role = req.user.role;

      const meetup = await MeetupService.getMeetupById(id, userId, role);

      res.status(200).json({
        success: true,
        data: meetup
      });
    } catch (error) {
      console.error('Error getting meetup by ID:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = MeetupController;