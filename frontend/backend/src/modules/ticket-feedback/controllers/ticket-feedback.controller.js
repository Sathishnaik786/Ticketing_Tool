const TicketFeedbackService = require('../services/ticket-feedback.service');

class TicketFeedbackController {
  constructor(deps = {}) {
    this.service = deps.service || new TicketFeedbackService(deps);
  }

  async submitFeedback(req, res, next) {
    try {
      const result = await this.service.submitFeedback(req.user, req.body);
      return res.status(201).json(result);
    } catch (err) {
      return next(err);
    }
  }

  async getFeedbackByTicket(req, res, next) {
    try {
      const result = await this.service.getFeedbackByTicketId(req.user, req.params.ticketId);
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  }

  async getMetrics(req, res, next) {
    try {
      const result = await this.service.getMetrics(req.user, req.query);
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  }

  async getMySubmissionCount(req, res, next) {
    try {
      const result = await this.service.getEmployeeSubmissionCount(req.user);
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new TicketFeedbackController();
