const ExecutiveAnalyticsService = require('../services/executive-analytics.service');

class ExecutiveAnalyticsController {
  constructor(deps = {}) {
    this.service = deps.service || new ExecutiveAnalyticsService(deps);
  }

  async getExecutiveDashboard(req, res, next) {
    try {
      const result = await this.service.getExecutiveDashboard(req.user, req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getDepartmentDashboard(req, res, next) {
    try {
      const result = await this.service.getDepartmentDashboard(req.user, req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getBusinessUnitDashboard(req, res, next) {
    try {
      const result = await this.service.getBusinessUnitDashboard(req.user, req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getSlaAnalytics(req, res, next) {
    try {
      const result = await this.service.getSlaAnalytics(req.user, req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getCsatAnalytics(req, res, next) {
    try {
      const result = await this.service.getCsatAnalytics(req.user);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getApprovalAnalytics(req, res, next) {
    try {
      const result = await this.service.getApprovalAnalytics(req.user);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getKnowledgeAnalytics(req, res, next) {
    try {
      const result = await this.service.getKnowledgeAnalytics(req.user);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getTrendAnalytics(req, res, next) {
    try {
      const result = await this.service.getTrendAnalytics(req.user, req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async listReports(req, res, next) {
    try {
      const result = await this.service.listReports(req.user);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async createReport(req, res, next) {
    try {
      const result = await this.service.createReport(req.user, req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ExecutiveAnalyticsController();
