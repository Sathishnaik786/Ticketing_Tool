import { Router } from 'express';
import { EmployeePayslipController } from '../controllers/employee-payslip.controller';
const requireAuth = require('@middlewares/auth.middleware');

const router = Router();

/**
 * @route   GET /api/payroll-bulk/my/payslips
 * @desc    Get all payslips for the authenticated employee
 * @access  Private (EMPLOYEE)
 */
router.get(
  '/my/payslips',
  requireAuth,
  EmployeePayslipController.listMyPayslips
);

/**
 * @route   GET /api/payroll-bulk/my/payslips/download/:id
 * @desc    Get secure download link for a payslip
 * @access  Private (EMPLOYEE)
 */
router.get(
  '/my/payslips/download/:id',
  requireAuth,
  EmployeePayslipController.getDownloadLink
);

export default router;
