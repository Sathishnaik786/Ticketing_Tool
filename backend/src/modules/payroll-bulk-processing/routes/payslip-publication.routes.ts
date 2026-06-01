import { Router } from 'express';
const requireAuth = require('@middlewares/auth.middleware');
const requireRole = require('@middlewares/role.middleware');
import { PayslipPublicationController } from '../controllers/payslip-publication.controller';

const router = Router();

// --- ADMIN / HR ROUTES ---
// Mount under an admin/hr context, e.g., /api/payroll/publication
router.post(
  '/record/:recordId/publish',
  requireAuth,
  requireRole(['ADMIN', 'HR']),
  PayslipPublicationController.publishDocument
);

router.post(
  '/batch/:commitmentId/publish',
  requireAuth,
  requireRole(['ADMIN', 'HR']),
  PayslipPublicationController.publishBatch
);


// --- EMPLOYEE ROUTES ---
// Mount under an employee context, e.g., /api/payroll/employee/payslips
router.get(
  '/my-payslips',
  requireAuth,
  PayslipPublicationController.getMyPayslips
);

router.post(
  '/my-payslips/:documentId/view',
  requireAuth,
  PayslipPublicationController.viewPayslip
);

router.post(
  '/my-payslips/:documentId/download',
  requireAuth,
  PayslipPublicationController.downloadPayslip
);

export default router;
