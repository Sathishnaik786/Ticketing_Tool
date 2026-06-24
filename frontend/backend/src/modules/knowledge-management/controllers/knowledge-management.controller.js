const KnowledgeManagementService = require('../services/knowledge-management.service');

class KnowledgeManagementController {
  constructor(deps = {}) {
    this.service = deps.service || new KnowledgeManagementService(deps);
  }

  async getCategories(req, res, next) {
    try {
      const result = await this.service.getCategories();
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async listArticles(req, res, next) {
    try {
      const result = await this.service.listArticles(req.user, req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getArticle(req, res, next) {
    try {
      const result = await this.service.getArticle(req.user, req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async createArticle(req, res, next) {
    try {
      const result = await this.service.createArticle(req.user, req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async updateArticle(req, res, next) {
    try {
      const result = await this.service.updateArticle(req.user, req.params.id, req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async publishArticle(req, res, next) {
    try {
      const result = await this.service.publishArticle(req.user, req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async archiveArticle(req, res, next) {
    try {
      const result = await this.service.archiveArticle(req.user, req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async rateArticle(req, res, next) {
    try {
      const result = await this.service.rateArticle(req.user, req.params.id, req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async submitFeedback(req, res, next) {
    try {
      const result = await this.service.submitFeedback(req.user, req.params.id, req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async searchArticles(req, res, next) {
    try {
      const result = await this.service.searchArticles(req.user, req.query);
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

  async getRelatedArticles(req, res, next) {
    try {
      const result = await this.service.getRelatedArticles(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new KnowledgeManagementController();
