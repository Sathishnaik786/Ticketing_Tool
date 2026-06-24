'use strict';

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { cacheMiddleware } = require('../../middlewares/cache.middleware');

// Define rate limiters exactly matching app.js
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const employeeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: 'Too many admin requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth & Dashboard
router.use('/auth', authLimiter, require('../auth.routes'));
router.use('/dashboard', generalLimiter, require('../dashboard.routes'));

// Employees
router.use('/employees/profile', employeeLimiter);
router.use('/employees', employeeLimiter, cacheMiddleware(), require('../employee.routes'));

// Core departments, attendance, leaves, documents, reports, projects
router.use('/departments', generalLimiter, require('../department.routes'));
router.use('/attendance', generalLimiter, require('../attendance.routes'));
router.use('/leaves', generalLimiter, require('../leave.routes'));
router.use('/documents', generalLimiter, require('../document.routes'));
router.use('/reports', generalLimiter, require('../report.routes'));
router.use('/projects', generalLimiter, require('../project.routes'));

// HR analytics, chat, notifications, meetups, calendar events
router.use('/hr-analytics', generalLimiter, require('@analytics/analytics.routes'));
router.use('/chat', generalLimiter, require('../chat.routes'));
router.use('/notifications', generalLimiter, require('../notification.routes'));
router.use('/meetups', generalLimiter, require('../meetup.routes'));
router.use('/calendar-events', generalLimiter, require('../calendar.routes'));

// Employee Updates Module (Phase-0)
router.use('/updates', generalLimiter, require('../../modules/updates/updates.routes'));

// Payroll Module
const payrollRoutes = require('../../modules/payroll/routes/payroll.routes');
router.use('/payroll', adminLimiter, payrollRoutes.default || payrollRoutes);

// Phase-1: Payroll Bulk Processing Module
try {
  const bulkUploadRoutes = require('../../modules/payroll-bulk-processing/routes/bulk-upload.routes');
  const employeePayslipRoutes = require('../../modules/payroll-bulk-processing/routes/employee-payslip.routes');
  const payslipPublicationRoutes = require('../../modules/payroll-bulk-processing/routes/payslip-publication.routes').default;

  router.use('/payroll-bulk', adminLimiter, bulkUploadRoutes.default || bulkUploadRoutes);
  router.use('/payroll/payslips', generalLimiter, employeePayslipRoutes.default || employeePayslipRoutes);
  router.use('/payroll/publication', adminLimiter, payslipPublicationRoutes);
  router.use('/my-payslips', generalLimiter, employeePayslipRoutes.default || employeePayslipRoutes);
} catch (error) {
  console.error('❌ Failed to mount Payroll Bulk Module in v1 router index:', error.message);
}

// ETMS Ticketing Module (Feature Flag: ENABLE_TICKETING)
if (process.env.ENABLE_TICKETING === 'true') {
  router.use('/ticket-categories', generalLimiter, require('../../modules/ticketing/ticket-categories.routes'));
  router.use('/tickets', generalLimiter, require('../../modules/ticketing/ticketing.routes'));
}

// Phase 7.1: CSAT Ticket Feedback Module (Feature Flag: ENABLE_TICKET_FEEDBACK)
if (process.env.ENABLE_TICKET_FEEDBACK === 'true') {
  router.use('/ticket-feedback', generalLimiter, require('../../modules/ticket-feedback/routes/ticket-feedback.routes'));
}

// Phase 7.2: Ticket Assignment & Work Queue (Feature Flag: ENABLE_TICKET_ASSIGNMENTS)
if (process.env.ENABLE_TICKET_ASSIGNMENTS === 'true') {
  router.use('/ticket-assignments', generalLimiter, require('../../modules/ticket-assignment/ticket-assignment.routes'));
}

// Phase 7.4: Communication & Activity Tracking (Feature Flag: ENABLE_COMMUNICATION_TRACKING)
if (process.env.ENABLE_COMMUNICATION_TRACKING === 'true') {
  router.use('/communications', generalLimiter, require('../../modules/communication-tracking/routes/communication-tracking.routes'));
}

// Phase 7.5: Approval Workflow & Service Catalog (Feature Flag: ENABLE_APPROVAL_ENGINE)
if (process.env.ENABLE_APPROVAL_ENGINE === 'true') {
  router.use('/approvals', generalLimiter, require('../../modules/approval-management/routes/approval-management.routes'));
}

// Phase 7.6: Knowledge Base & Self-Service Portal (Feature Flag: ENABLE_KNOWLEDGE_BASE)
if (process.env.ENABLE_KNOWLEDGE_BASE === 'true') {
  router.use('/knowledge', generalLimiter, require('../../modules/knowledge-management/routes/knowledge-management.routes'));
}

// Phase 7.7: Executive Analytics & BI (Feature Flag: ENABLE_EXECUTIVE_ANALYTICS)
if (process.env.ENABLE_EXECUTIVE_ANALYTICS === 'true') {
  router.use('/analytics', generalLimiter, require('../../modules/executive-analytics/routes/executive-analytics.routes'));
}

// Phase 7.8: Enterprise Notification & Alert Center (Feature Flag: ENABLE_NOTIFICATION_CENTER)
if (process.env.ENABLE_NOTIFICATION_CENTER === 'true') {
  router.use('/notification-center', generalLimiter, require('../../modules/notification-center/routes/notification-center.routes'));
}

// Phase 9.2: Audit Logs
const { auditRouter } = require('./audit.routes');
router.use('/audit', auditRouter);

// Phase 5.1: Enterprise Service Management (ESM) Core Platform
const checkFeatureFlag = require('../../middlewares/featureFlag.middleware');

router.use('/esm/catalog', generalLimiter, checkFeatureFlag('esm.catalog'), require('../../modules/catalog-engine/catalog.routes'));
router.use('/esm/workflows', generalLimiter, checkFeatureFlag('esm.workflow'), require('../../modules/workflow-engine/workflow.routes'));
router.use('/esm/approvals', generalLimiter, checkFeatureFlag('esm.approvals'), require('../../modules/approval-engine/approval.routes'));
router.use('/esm/notifications', generalLimiter, require('../../modules/notification-engine/notification.routes'));
router.use('/esm/sla', generalLimiter, checkFeatureFlag('esm.sla'), require('../../modules/sla-engine/sla.routes'));
router.use('/esm/settings', generalLimiter, require('../../modules/settings-engine/settings.routes'));
router.use('/esm/events', adminLimiter, require('../../modules/event-store/eventStore.routes'));

module.exports = router;
