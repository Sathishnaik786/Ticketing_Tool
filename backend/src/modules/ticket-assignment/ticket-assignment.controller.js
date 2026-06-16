const TicketAssignmentService = require('./ticket-assignment.service');

class TicketAssignmentController {
  constructor(deps = {}) {
    this.service = deps.service || new TicketAssignmentService(deps);
  }

  async assignTicket(req, res, next) {
    try {
      const result = await this.service.assignTicket(req.user, req.body);
      return res.status(201).json(result);
    } catch (err) {
      return next(err);
    }
  }

  async reassignTicket(req, res, next) {
    try {
      const result = await this.service.reassignTicket(req.user, req.params.ticketId, req.body);
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  }

  async getMyQueue(req, res, next) {
    try {
      const result = await this.service.getMyQueue(req.user, req.query);
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  }

  async getTeamQueue(req, res, next) {
    try {
      const result = await this.service.getTeamQueue(req.user, req.query);
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  }

  async getUnassigned(req, res, next) {
    try {
      const result = await this.service.getUnassigned(req.user, req.query);
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  }

  async getAnalytics(req, res, next) {
    try {
      const result = await this.service.getAnalytics(req.user);
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  }

  async getTicketHistory(req, res, next) {
    try {
      const result = await this.service.getTicketHistory(req.user, req.params.ticketId);
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new TicketAssignmentController();
