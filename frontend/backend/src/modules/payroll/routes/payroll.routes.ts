import { Router } from 'express';
import authMiddleware from '../../../middlewares/auth.middleware';
console.log('🛡️ Loaded Auth Middleware Type:', typeof authMiddleware);
import { SalaryComponentController } from '../controllers/salary-component.controller';
import { SalaryStructureController } from '../controllers/salary-structure.controller';
import { SalaryAssignmentController } from '../controllers/salary-assignment.controller';
import { PayrollSettingsController } from '../controllers/payroll-settings.controller';
import { PayrollProcessingController } from '../controllers/payroll-processing.controller';
import { PayrollRecordController } from '../controllers/payroll-record.controller';
import { ComplianceController } from '../controllers/compliance.controller';
import { TaxController } from '../controllers/tax.controller';
import { PayslipController } from '../controllers/payslip.controller';
import { WorkflowController } from '../controllers/workflow.controller';
import { GovernanceController } from '../controllers/governance.controller';
import { FinanceController } from '../controllers/finance.controller';
import { DisbursementController } from '../controllers/disbursement.controller';
import { checkPayrollPermission } from '../middleware/payroll-rbac.middleware';
import { PAYROLL_PERMISSIONS } from '../config/rbac.config';

const router = Router();

// Global auth protection for all payroll routes
router.use(authMiddleware);

// Salary Components
router.get(
  '/salary-components', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.VIEW), 
  SalaryComponentController.getAll
);
router.get(
  '/salary-components/:id', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.VIEW), 
  SalaryComponentController.getById
);
router.post(
  '/salary-components', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.MANAGE_SALARY), 
  SalaryComponentController.create
);
router.put(
  '/salary-components/:id', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.MANAGE_SALARY), 
  SalaryComponentController.update
);
router.delete(
  '/salary-components/:id', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.MANAGE_SALARY), 
  SalaryComponentController.delete
);

// Salary Structures
router.get(
  '/salary-structures', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.VIEW), 
  SalaryStructureController.getAll
);
router.get(
  '/salary-structures/:id', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.VIEW), 
  SalaryStructureController.getById
);
router.post(
  '/salary-structures', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.MANAGE_SALARY), 
  SalaryStructureController.create
);
router.put(
  '/salary-structures/:id', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.MANAGE_SALARY), 
  SalaryStructureController.update
);
router.delete(
  '/salary-structures/:id', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.MANAGE_SALARY), 
  SalaryStructureController.delete
);

// Salary Assignments
router.get(
  '/salary-assignments', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.VIEW), 
  SalaryAssignmentController.getAll
);
router.get(
  '/salary-assignments/employee/:employeeId', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.VIEW), 
  SalaryAssignmentController.getByEmployeeId
);
router.post(
  '/salary-assignments', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.MANAGE_SALARY), 
  SalaryAssignmentController.create
);
router.post(
  '/salary-assignments/preview', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.VIEW), 
  SalaryAssignmentController.preview
);

// Settings
router.get(
  '/settings', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.FULL_ACCESS), 
  PayrollSettingsController.getAll
);
router.put(
  '/settings', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.FULL_ACCESS), 
  PayrollSettingsController.update
);

// Payroll Cycles
router.get(
  '/cycles', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.VIEW), 
  PayrollProcessingController.getCycles
);
router.get(
  '/cycles/:id', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.VIEW), 
  PayrollProcessingController.getCycleById
);
router.post(
  '/cycles', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.PROCESS), 
  PayrollProcessingController.createCycle
);
router.post(
  '/cycles/:id/lock', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.FULL_ACCESS), 
  PayrollProcessingController.lockCycle
);
router.get(
  '/cycles/:cycleId/logs', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.VIEW), 
  PayrollProcessingController.getLogs
);

// Payroll Processing
router.post(
  '/process', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.PROCESS), 
  PayrollProcessingController.processPayroll
);

// Payroll Records
router.get(
  '/records', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.VIEW), 
  PayrollRecordController.getAll
);
router.get(
  '/records/:id', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.VIEW), 
  PayrollRecordController.getById
);
router.get(
  '/records/employee/:employeeId', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.SELF_VIEW), 
  PayrollRecordController.getByEmployeeId
);
router.post(
  '/preview', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.VIEW), 
  PayrollRecordController.preview
);

// Compliance Rules
router.get(
  '/compliance-rules', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.VIEW), 
  ComplianceController.getRules
);
router.post(
  '/compliance-rules', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.FULL_ACCESS), 
  ComplianceController.createRule
);
router.put(
  '/compliance-rules/:id', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.FULL_ACCESS), 
  ComplianceController.updateRule
);

// Tax Management
router.get(
  '/tax-slabs', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.VIEW), 
  TaxController.getSlabs
);
router.post(
  '/tax-slabs', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.FULL_ACCESS), 
  TaxController.createSlab
);
router.get(
  '/employee-tax-profiles/:employeeId', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.SELF_VIEW), 
  TaxController.getEmployeeProfile
);
router.put(
  '/employee-tax-profiles/:employeeId', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.SELF_VIEW), 
  TaxController.updateEmployeeProfile
);

// Payslips & Documents
router.post(
  '/payslips/generate/:payrollRecordId', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.PROCESS), 
  PayslipController.generate
);
router.get(
  '/payslips/:id', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.SELF_VIEW), 
  PayslipController.getById
);
router.get(
  '/employees/:employeeId/payslips', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.SELF_VIEW), 
  PayslipController.getByEmployee
);

// Workflow Management
router.get(
  '/workflows', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.FULL_ACCESS), 
  WorkflowController.getWorkflows
);
router.post(
  '/workflows', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.FULL_ACCESS), 
  WorkflowController.createWorkflow
);

// Approvals
router.get(
  '/approvals/pending', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.VIEW), 
  WorkflowController.getPendingApprovals
);
router.post(
  '/approvals/:id/approve', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.PROCESS), 
  WorkflowController.approve
);

// Governance (Variances, Reopens, Notifications)
router.get(
  '/variances', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.VIEW), 
  GovernanceController.getVariances
);
router.get(
  '/notifications', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.SELF_VIEW), 
  GovernanceController.getNotifications
);
router.put(
  '/notifications/:id/read', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.SELF_VIEW), 
  GovernanceController.markNotificationRead
);
router.get(
  '/reopen-requests', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.FULL_ACCESS), 
  GovernanceController.getReopenRequests
);
router.post(
  '/reopen-requests', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.PROCESS), 
  GovernanceController.requestReopen
);

// Finance & Accounting
router.get(
  '/ledgers', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.VIEW), 
  FinanceController.getLedgers
);
router.post(
  '/ledgers', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.FULL_ACCESS), 
  FinanceController.createLedger
);
router.get(
  '/journals', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.VIEW), 
  FinanceController.getJournals
);
router.post(
  '/journals/post/:cycleId', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.PROCESS), 
  FinanceController.postJournal
);
router.post(
  '/reconciliations/run/:cycleId', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.PROCESS), 
  FinanceController.reconcile
);
router.get(
  '/exports/csv/:cycleId', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.VIEW), 
  FinanceController.exportToCsv
);

// Disbursements
router.get(
  '/disbursements', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.VIEW), 
  DisbursementController.getDisbursements
);
router.post(
  '/disbursements/initiate/:cycleId', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.PROCESS), 
  DisbursementController.initiate
);
router.post(
  '/disbursements/process-batch', 
  checkPayrollPermission(PAYROLL_PERMISSIONS.PROCESS), 
  DisbursementController.processBatch
);

export default router;
