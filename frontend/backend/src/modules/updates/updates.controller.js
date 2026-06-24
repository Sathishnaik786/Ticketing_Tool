const updatesService = require('./updates.service');
const NotificationService = require('../../controllers/notification.service');

/**
 * Controller for handling employee updates
 */
class UpdatesController {
    /**
     * POST /api/updates
     */
    async createUpdate(req, res, next) {
        try {
            const {
                update_type,
                title,
                content,
                project_id,
                visible_to_user_ids = []
            } = req.body;

            const updateData = {
                user_id: req.user.id,
                role: req.user.role,
                update_type,
                title,
                content,
                project_id,
                created_by: req.user.id,
                created_at: req.body.created_at // Allow backdating if provided
            };

            const update = await updatesService.createUpdate(updateData, visible_to_user_ids);

            res.status(201).json({
                success: true,
                data: update
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/updates/my
     */
    async getMyUpdates(req, res, next) {
        try {
            const updates = await updatesService.getMyUpdates(req.user.id, req.query);
            res.status(200).json({
                success: true,
                data: updates
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/updates/visible
     */
    async getVisibleUpdates(req, res, next) {
        try {
            const updates = await updatesService.getVisibleUpdates(req.user.id, req.query);
            res.status(200).json({
                success: true,
                data: updates
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/updates/:id/feedback
     */
    async addFeedback(req, res, next) {
        try {
            const { id: update_id } = req.params;
            const { comment } = req.body;

            const feedbackData = {
                update_id,
                from_user_id: req.user.id,
                comment
            };

            const feedback = await updatesService.addFeedback(feedbackData);

            // Handle Mentions Notification
            try {
                if (comment.startsWith('{')) {
                    const data = JSON.parse(comment);
                    if (data.mn && Array.isArray(data.mn)) {
                        for (const mentionedUserId of data.mn) {
                            if (mentionedUserId === req.user.id) continue;
                            await NotificationService.notifySystemAlert(
                                mentionedUserId,
                                'New Mention',
                                `${req.user.first_name || 'Someone'} mentioned you in a discussion`,
                                `/updates` // Generic link
                            );
                        }
                    }
                }
            } catch (e) {
                console.error('Mention notification error:', e);
            }

            res.status(201).json({
                success: true,
                data: feedback
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/updates/analytics/me
     */
    async getAnalyticsMe(req, res, next) {
        try {
            const stats = await updatesService.getAnalyticsMe(req.user.id, req.query);
            res.status(200).json({ success: true, data: stats });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/updates/analytics/team
     */
    async getAnalyticsTeam(req, res, next) {
        try {
            const stats = await updatesService.getAnalyticsTeam(req.user.id, req.query);
            res.status(200).json({ success: true, data: stats });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/updates/analytics/org
     */
    async getAnalyticsOrg(req, res, next) {
        try {
            // Check if user is Admin or HR
            if (req.user.role !== 'ADMIN' && req.user.role !== 'HR') {
                return res.status(403).json({ success: false, message: 'Unauthorized' });
            }
            const stats = await updatesService.getAnalyticsOrg(req.query);

            res.status(200).json({ success: true, data: stats });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/updates/intelligence/summary
     */
    async getIntelligenceSummary(req, res, next) {
        try {
            const intelligenceService = require('./intelligence.service');
            const summary = await intelligenceService.generateSummary(req.user.id, req.query.type || 'MONTHLY', req.query);
            res.status(200).json({ success: true, data: summary });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/updates/automation/reminders
     */
    async runReminders(req, res, next) {
        try {
            // Admin or System only
            if (req.user.role !== 'ADMIN') {
                return res.status(403).json({ success: false, message: 'Forbidden' });
            }
            const intelligenceService = require('./intelligence.service');
            const results = await intelligenceService.detectMissingUpdates();
            res.status(200).json({ success: true, data: results });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/updates/governance/export
     */
    async exportReport(req, res, next) {
        try {
            const updates = await updatesService.getMyUpdates(req.user.id, req.query);

            // Simple CSV-like text export for now
            const exportData = updates.map(u => ({
                date: u.created_at,
                type: u.update_type,
                title: u.title,
                content: JSON.stringify(u.content)
            }));

            res.status(200).json({ success: true, data: exportData });
        } catch (error) {
            next(error);
        }
    }
    /**
     * PUT /api/updates/:id
     */
    async updateUpdate(req, res, next) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const updated = await updatesService.updateUpdate(id, req.user.id, updateData);
            res.status(200).json({
                success: true,
                data: updated
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/updates/:id
     */
    async deleteUpdate(req, res, next) {
        try {
            const { id } = req.params;
            await updatesService.deleteUpdate(id, req.user.id);
            res.status(200).json({
                success: true,
                message: 'Update deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UpdatesController();
