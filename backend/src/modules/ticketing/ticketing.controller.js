const TicketService = require('./services/ticket.service');
const CommentService = require('./services/comment.service');
const AttachmentService = require('./services/attachment.service');
const AssignmentService = require('./services/assignment.service');
const WatcherService = require('./services/watcher.service');
const ActivityService = require('./services/activity.service');
const SlaService = require('./services/sla.service');
const AppError = require('../../utils/app-error');

class TicketingController {
  constructor(deps = {}) {
    this.ticketService = deps.ticketService || new TicketService();
    this.commentService = deps.commentService || new CommentService();
    this.attachmentService = deps.attachmentService || new AttachmentService();
    this.assignmentService = deps.assignmentService || new AssignmentService();
    this.watcherService = deps.watcherService || new WatcherService();
    this.activityService = deps.activityService || new ActivityService();
    this.slaService = deps.slaService || new SlaService();
  }

  async createTicket(req, res, next) {
    try {
      const result = await this.ticketService.createTicket(req.user, req.body);
      return res.status(201).json(result);
    } catch (err) {
      return next(err);
    }
  }

  async updateTicket(req, res, next) {
    try {
      const result = await this.ticketService.updateTicket(
        req.user,
        req.params.ticketId,
        req.body
      );
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  }

  async getTicketById(req, res, next) {
    try {
      const result = await this.ticketService.getTicketById(req.user, req.params.ticketId);
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  }

  async listTickets(req, res, next) {
    try {
      const result = await this.ticketService.listTickets(req.user, req.query);
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  }

  async changeStatus(req, res, next) {
    try {
      const result = await this.ticketService.changeStatus(
        req.user,
        req.params.ticketId,
        req.body
      );
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  }

  async closeTicket(req, res, next) {
    try {
      const result = await this.ticketService.closeTicket(
        req.user,
        req.params.ticketId,
        req.body
      );
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  }

  async reopenTicket(req, res, next) {
    try {
      const result = await this.ticketService.reopenTicket(req.user, req.params.ticketId);
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  }

  async createComment(req, res, next) {
    try {
      const result = await this.commentService.createComment(
        req.user,
        req.params.ticketId,
        req.body
      );
      return res.status(201).json(result);
    } catch (err) {
      return next(err);
    }
  }

  async listComments(req, res, next) {
    try {
      const includeInternal = req.query.includeInternal === 'true';
      const result = await this.commentService.listComments(
        req.user,
        req.params.ticketId,
        { includeInternal }
      );
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  }

  async createAttachment(req, res, next) {
    try {
      if (!req.file) {
        throw AppError.badRequest('File is required');
      }

      const result = await this.attachmentService.createAttachment(
        req.user,
        req.params.ticketId,
        req.file,
        {
          file_name: req.body.file_name || req.file.originalname,
          mime_type: req.file.mimetype,
          file_size: req.file.size,
        }
      );
      return res.status(201).json(result);
    } catch (err) {
      return next(err);
    }
  }

  async listAttachments(req, res, next) {
    try {
      const result = await this.attachmentService.listAttachments(
        req.user,
        req.params.ticketId
      );
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  }

  async getSignedUrl(req, res, next) {
    try {
      const expiresIn = req.query.expiresIn
        ? parseInt(req.query.expiresIn, 10)
        : 3600;

      const result = await this.attachmentService.getSignedUrl(
        req.user,
        req.params.ticketId,
        req.params.attachmentId,
        expiresIn
      );
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  }

  async assignTicket(req, res, next) {
    try {
      const result = await this.assignmentService.assignTicket(
        req.user,
        req.params.ticketId,
        req.body
      );
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  }

  async reassignTicket(req, res, next) {
    try {
      const result = await this.assignmentService.reassignTicket(
        req.user,
        req.params.ticketId,
        req.body
      );
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  }

  async getAssignmentHistory(req, res, next) {
    try {
      const result = await this.assignmentService.getAssignmentHistory(
        req.user,
        req.params.ticketId
      );
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  }

  async addWatcher(req, res, next) {
    try {
      const result = await this.watcherService.addWatcher(
        req.user,
        req.params.ticketId,
        req.body
      );
      return res.status(201).json(result);
    } catch (err) {
      return next(err);
    }
  }

  async removeWatcher(req, res, next) {
    try {
      const result = await this.watcherService.removeWatcher(
        req.user,
        req.params.ticketId,
        req.params.employeeId
      );
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  }

  async listWatchers(req, res, next) {
    try {
      const result = await this.watcherService.listWatchers(
        req.user,
        req.params.ticketId
      );
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  }

  async getTimeline(req, res, next) {
    try {
      await this.ticketService.getTicketById(req.user, req.params.ticketId);

      const page = req.query.page ? parseInt(req.query.page, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;

      const result = await this.activityService.getTimeline(req.params.ticketId, {
        page,
        limit,
      });
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  }

  async getSlaDetails(req, res, next) {
    try {
      const ticketResult = await this.ticketService.getTicketById(
        req.user,
        req.params.ticketId
      );
      const ticket = ticketResult.data;

      const result = await this.slaService.resolveDueDates({
        department_id: ticket.department_id,
        category_id: ticket.category_id,
        priority: ticket.priority,
      });

      return res.status(200).json({
        success: true,
        data: {
          ticket_id: ticket.id,
          priority: ticket.priority,
          sla_response_due_at: ticket.sla_response_due_at,
          sla_resolution_due_at: ticket.sla_resolution_due_at,
          sla_response_breached: ticket.sla_response_breached,
          sla_resolution_breached: ticket.sla_resolution_breached,
          applicable_rule: result.data.rule,
          calculated_due_dates: result.data.dueDates,
        },
      });
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = TicketingController;
