const CommunicationTrackingService = require('../services/communication-tracking.service');

class CommunicationTrackingController {
  constructor(deps = {}) {
    this.service = deps.service || new CommunicationTrackingService(deps);
  }

  async addComment(req, res, next) {
    try {
      const result = await this.service.addComment(req.user, req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async addChat(req, res, next) {
    try {
      const result = await this.service.addChat(req.user, req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async logEmail(req, res, next) {
    try {
      const result = await this.service.logEmail(req.user, req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async logCall(req, res, next) {
    try {
      const result = await this.service.logCall(req.user, req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async addInternalNote(req, res, next) {
    try {
      const result = await this.service.addInternalNote(req.user, req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getTicketCommunications(req, res, next) {
    try {
      const result = await this.service.getTicketCommunications(req.user, req.params.ticketId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getTicketTimeline(req, res, next) {
    try {
      const result = await this.service.getTicketTimeline(req.user, req.params.ticketId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getAnalytics(req, res, next) {
    try {
      const result = await this.service.getAnalytics(req.user, req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getDashboardSummary(req, res, next) {
    try {
      const result = await this.service.getDashboardSummary(req.user);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CommunicationTrackingController();
