import { Router } from 'express';
import { BulkUploadController } from '../controllers/bulk-upload.controller';
import { bulkUploadMiddleware } from '../middleware/upload.middleware';
const requireAuth = require('@middlewares/auth.middleware');
const requireRole = require('@middlewares/role.middleware');

const router = Router();

/**
 * @route   POST /api/payroll-bulk/upload
 * @desc    Upload and validate payroll excel file
 * @access  Private (ADMIN, HR)
 */
router.post(
  '/upload',
  requireAuth,
  requireRole(['ADMIN', 'HR']),
  bulkUploadMiddleware.single('file'),
  BulkUploadController.upload
);

/**
 * @route   GET /api/payroll-bulk/uploads
 * @desc    Get list of all bulk uploads
 * @access  Private (ADMIN, HR)
 */
router.get(
  '/uploads',
  requireAuth,
  requireRole(['ADMIN', 'HR']),
  BulkUploadController.list
);

/**
 * @route   GET /api/payroll-bulk/uploads/:id
 * @desc    Get bulk upload details
 * @access  Private (ADMIN, HR)
 */
router.get(
  '/uploads/:id',
  requireAuth,
  requireRole(['ADMIN', 'HR']),
  BulkUploadController.getById
);

/**
 * @route   GET /api/payroll-bulk/uploads/:id/rows
 * @desc    Get parsed rows for a bulk upload
 * @access  Private (ADMIN, HR)
 */
router.get(
  '/uploads/:id/rows',
  requireAuth,
  requireRole(['ADMIN', 'HR']),
  BulkUploadController.getRows
);

/**
 * @route   POST /api/payroll-bulk/:uploadId/map-employees
 * @desc    Trigger employee mapping for an upload batch
 * @access  Private (ADMIN, HR)
 */
router.post(
  '/:uploadId/map-employees',
  requireAuth,
  requireRole(['ADMIN', 'HR']),
  BulkUploadController.mapEmployees
);

/**
 * @route   GET /api/payroll-bulk/:uploadId/mappings
 * @desc    Get employee mappings for an upload batch
 * @access  Private (ADMIN, HR)
 */
router.get(
  '/:uploadId/mappings',
  requireAuth,
  requireRole(['ADMIN', 'HR']),
  BulkUploadController.getMappings
);

/**
 * @route   GET /api/payroll-bulk/:uploadId/preview
 * @desc    Get preview summary for an upload batch
 * @access  Private (ADMIN, HR)
 */
router.get(
  '/:uploadId/preview',
  requireAuth,
  requireRole(['ADMIN', 'HR']),
  BulkUploadController.getPreview
);

/**
 * @route   POST /api/payroll-bulk/:uploadId/review/:rowId
 * @desc    Manually update a row mapping
 * @access  Private (ADMIN, HR)
 */
router.post(
  '/:uploadId/review/:rowId',
  requireAuth,
  requireRole(['ADMIN', 'HR']),
  BulkUploadController.updateRowMapping
);

/**
 * @route   POST /api/payroll-bulk/:uploadId/recalculate-preview
 * @desc    Trigger manual preview recalculation
 * @access  Private (ADMIN, HR)
 */
router.post(
  '/:uploadId/recalculate-preview',
  requireAuth,
  requireRole(['ADMIN', 'HR']),
  BulkUploadController.recalculatePreview
);

/**
 * @route   POST /api/payroll-bulk/:uploadId/commit
 * @desc    Officially commit payroll and generate payslips
 * @access  Private (ADMIN, HR)
 */
router.post(
  '/:uploadId/commit',
  requireAuth,
  requireRole(['ADMIN', 'HR']),
  BulkUploadController.commit
);

/**
 * @route   GET /api/payroll-bulk/commitments
 * @desc    Get list of all commitment batches
 * @access  Private (ADMIN, HR)
 */
router.get(
  '/commitments',
  requireAuth,
  requireRole(['ADMIN', 'HR']),
  BulkUploadController.listCommitments
);

/**
 * @route   POST /api/payroll-bulk/commitments/:commitmentId/retry-docs
 * @desc    Retry payslip generation for failed/missing documents in a commitment
 * @access  Private (ADMIN, HR)
 */
router.post(
  '/commitments/:commitmentId/retry-docs',
  requireAuth,
  requireRole(['ADMIN', 'HR']),
  BulkUploadController.retryDocs
);

import { IdentityPreparationController } from '../controllers/identity-preparation.controller';

/**
 * @route   GET /api/payroll-bulk/identity/readiness
 * @desc    Get payroll readiness report for all employees
 * @access  Private (ADMIN, HR)
 */
router.get(
  '/identity/readiness',
  requireAuth,
  requireRole(['ADMIN', 'HR']),
  IdentityPreparationController.getReadinessReport
);

/**
 * @route   POST /api/payroll-bulk/identity/:employeeId/normalize
 * @desc    Normalize employee identity data
 * @access  Private (ADMIN, HR)
 */
router.post(
  '/identity/:employeeId/normalize',
  requireAuth,
  requireRole(['ADMIN', 'HR']),
  IdentityPreparationController.normalizeEmployee
);

router.post(
  '/identity/repair',
  requireAuth,
  requireRole(['ADMIN', 'HR']),
  IdentityPreparationController.repairData
);

router.get(
  '/identity/validate-integrity',
  requireAuth,
  requireRole(['ADMIN', 'HR']),
  IdentityPreparationController.validateIntegrity
);

import { PayrollFinanceController } from '../controllers/payroll-finance.controller';
import { PayrollTemplateService } from '../services/payroll-template.service';

/**
 * @route   GET /api/payroll-bulk/template/download
 * @desc    Download standard payroll upload template
 * @access  Private (ADMIN, HR)
 */
router.get(
  '/template/download',
  requireAuth,
  requireRole(['ADMIN', 'HR']),
  (req, res) => {
    const buffer = PayrollTemplateService.generateTemplate();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Payroll_Template.xlsx');
    res.send(buffer);
  }
);

/**
 * @route   POST /api/payroll-bulk/finance/reconcile
 * @desc    Initialize financial reconciliation
 * @access  Private (ADMIN, HR, FINANCE)
 */
router.post(
  '/finance/reconcile',
  requireAuth,
  requireRole(['ADMIN', 'HR', 'FINANCE']),
  PayrollFinanceController.startReconciliation
);

/**
 * @route   GET /api/payroll-bulk/finance/variances
 * @desc    Get all financial variance alerts
 * @access  Private (ADMIN, HR, FINANCE)
 */
router.get(
  '/finance/variances',
  requireAuth,
  requireRole(['ADMIN', 'HR', 'FINANCE']),
  PayrollFinanceController.getVariances
);

/**
 * @route   POST /api/payroll-bulk/finance/:uploadId/freeze
 * @desc    Freeze a payroll batch (Lock)
 * @access  Private (ADMIN, HR)
 */
router.post(
  '/finance/:uploadId/freeze',
  requireAuth,
  requireRole(['ADMIN', 'HR']),
  PayrollFinanceController.freezeBatch
);

import { PayslipGovernanceController } from '../controllers/payslip-governance.controller';

/**
 * @route   GET /api/payroll-bulk/payslips/:recordId/download
 * @desc    Get secure download link for a specific payslip record
 * @access  Private (ADMIN, HR)
 */
router.get(
  '/payslips/:recordId/download',
  requireAuth,
  requireRole(['ADMIN', 'HR']),
  BulkUploadController.getPayslipDownloadUrl
);

/**
 * @route   GET /api/payroll-bulk/payslips/:recordId/view
 * @desc    Get secure view link for a specific payslip record
 * @access  Private (ADMIN, HR)
 */
router.get(
  '/payslips/:recordId/view',
  requireAuth,
  requireRole(['ADMIN', 'HR']),
  BulkUploadController.getPayslipDownloadUrl // Reuse for signed URL view
);

// ==========================================
// PAYSLIP TEMPLATE GOVERNANCE ROUTES
// ==========================================

router.get(
  '/templates',
  requireAuth,
  requireRole(['ADMIN', 'HR']),
  PayslipGovernanceController.listTemplates
);

router.get(
  '/templates/active',
  requireAuth,
  requireRole(['ADMIN', 'HR']),
  PayslipGovernanceController.getActiveTemplate
);

router.post(
  '/templates',
  requireAuth,
  requireRole(['ADMIN', 'HR']),
  PayslipGovernanceController.createTemplate
);

router.put(
  '/templates/:id',
  requireAuth,
  requireRole(['ADMIN', 'HR']),
  PayslipGovernanceController.updateTemplate
);

router.post(
  '/templates/:id/activate',
  requireAuth,
  requireRole(['ADMIN', 'HR']),
  PayslipGovernanceController.activateTemplate
);

router.get(
  '/payslips/:recordId/versions',
  requireAuth,
  requireRole(['ADMIN', 'HR']),
  PayslipGovernanceController.getPayslipVersions
);

router.post(
  '/payslips/:recordId/regenerate',
  requireAuth,
  requireRole(['ADMIN', 'HR']),
  PayslipGovernanceController.regeneratePayslip
);

export default router;



