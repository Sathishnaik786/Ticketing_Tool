const ApprovalManagementService = require('../services/approval-management.service');

class ApprovalManagementController {
  constructor(deps = {}) {
    this.service = deps.service || new ApprovalManagementService(deps);
  }

  async getCatalog(req, res, next) {
    try {
      const result = await this.service.getCatalog();
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async createWorkflow(req, res, next) {
    try {
      const result = await this.service.createWorkflow(req.user, req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async updateWorkflow(req, res, next) {
    try {
      const result = await this.service.updateWorkflow(req.user, req.params.id, req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getWorkflow(req, res, next) {
    try {
      const result = await this.service.getWorkflow(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async startTicketApproval(req, res, next) {
    try {
      const result = await this.service.startTicketApproval(req.user, req.params.ticketId, req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async approveTicket(req, res, next) {
    try {
      const result = await this.service.approveTicketStep(req.user, req.params.ticketId, req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async rejectTicket(req, res, next) {
    try {
      const result = await this.service.rejectTicketStep(req.user, req.params.ticketId, req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getMyApprovals(req, res, next) {
    try {
      const result = await this.service.getMyApprovals(req.user);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getPending(req, res, next) {
    try {
      const result = await this.service.getPendingApprovals(req.user);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getTicketApprovalState(req, res, next) {
    try {
      const result = await this.service.getTicketApprovalState(req.user, req.params.ticketId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getAnalytics(req, res, next) {
    try {
      const result = await this.service.getAnalytics(req.user);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ApprovalManagementController();
