import { apiCall } from '@/services/api';
import { 
  SalaryComponent, 
  SalaryStructure, 
  EmployeeSalaryAssignment, 
  PayrollSetting,
  PayrollCycle,
  ProcessingLog,
  PayrollRecord,
  ComplianceRule,
  TaxSlab,
  Payslip,
  PayrollWorkflow,
  PayrollApproval,
  PayrollVariance,
  PayrollNotification,
  PayrollLedger,
  PayrollJournal,
  PayrollDisbursement
} from '../types/payroll';

export const payrollApi = {
  // Salary Components
  getComponents: async (): Promise<SalaryComponent[]> => {
    return apiCall('/payroll/salary-components', 'GET');
  },
  getComponentById: async (id: string): Promise<SalaryComponent> => {
    return apiCall(`/payroll/salary-components/${id}`, 'GET');
  },
  createComponent: async (data: Partial<SalaryComponent>): Promise<SalaryComponent> => {
    return apiCall('/payroll/salary-components', 'POST', data);
  },
  updateComponent: async (id: string, data: Partial<SalaryComponent>): Promise<SalaryComponent> => {
    return apiCall(`/payroll/salary-components/${id}`, 'PUT', data);
  },
  deleteComponent: async (id: string): Promise<void> => {
    return apiCall(`/payroll/salary-components/${id}`, 'DELETE');
  },

  // Salary Structures
  getStructures: async (): Promise<SalaryStructure[]> => {
    return apiCall('/payroll/salary-structures', 'GET');
  },
  getStructureById: async (id: string): Promise<SalaryStructure> => {
    return apiCall(`/payroll/salary-structures/${id}`, 'GET');
  },
  createStructure: async (data: any): Promise<SalaryStructure> => {
    return apiCall('/payroll/salary-structures', 'POST', data);
  },
  updateStructure: async (id: string, data: any): Promise<SalaryStructure> => {
    return apiCall(`/payroll/salary-structures/${id}`, 'PUT', data);
  },
  deleteStructure: async (id: string): Promise<void> => {
    return apiCall(`/payroll/salary-structures/${id}`, 'DELETE');
  },

  // Salary Assignments
  getAssignments: async (): Promise<EmployeeSalaryAssignment[]> => {
    return apiCall('/payroll/salary-assignments', 'GET');
  },
  getAssignmentsByEmployee: async (employeeId: string): Promise<EmployeeSalaryAssignment[]> => {
    return apiCall(`/payroll/salary-assignments/employee/${employeeId}`, 'GET');
  },
  createAssignment: async (data: Partial<EmployeeSalaryAssignment>): Promise<EmployeeSalaryAssignment> => {
    return apiCall('/payroll/salary-assignments', 'POST', data);
  },
  previewSalary: async (data: { employeeId: string; annualCtc: number; structureId: string }): Promise<any> => {
    return apiCall('/payroll/salary-assignments/preview', 'POST', data);
  },

  // Settings
  getSettings: async (): Promise<PayrollSetting[]> => {
    return apiCall('/payroll/settings', 'GET');
  },
  updateSetting: async (key: string, value: any): Promise<PayrollSetting> => {
    return apiCall('/payroll/settings', 'PUT', { key, value });
  },

  // Payroll Cycles
  getCycles: async (): Promise<PayrollCycle[]> => {
    return apiCall('/payroll/cycles', 'GET');
  },
  getCycleById: async (id: string): Promise<PayrollCycle> => {
    return apiCall(`/payroll/cycles/${id}`, 'GET');
  },
  createCycle: async (data: Partial<PayrollCycle>): Promise<PayrollCycle> => {
    return apiCall('/payroll/cycles', 'POST', data);
  },
  lockCycle: async (id: string): Promise<void> => {
    return apiCall(`/payroll/cycles/${id}/lock`, 'POST');
  },
  getLogs: async (cycleId: string): Promise<ProcessingLog[]> => {
    return apiCall(`/payroll/cycles/${cycleId}/logs`, 'GET');
  },

  // Processing
  processPayroll: async (data: { cycleId: string; employeeIds?: string[] }): Promise<any> => {
    return apiCall('/payroll/process', 'POST', data);
  },

  // Records
  getRecords: async (): Promise<PayrollRecord[]> => {
    return apiCall('/payroll/records', 'GET');
  },
  getRecordById: async (id: string): Promise<PayrollRecord> => {
    return apiCall(`/payroll/records/${id}`, 'GET');
  },
  getRecordsByEmployee: async (employeeId: string): Promise<PayrollRecord[]> => {
    return apiCall(`/payroll/records/employee/${employeeId}`, 'GET');
  },
  previewPayroll: async (data: any): Promise<any> => {
    return apiCall('/payroll/preview', 'POST', data);
  },

  // Compliance
  getComplianceRules: async (): Promise<ComplianceRule[]> => {
    return apiCall('/payroll/compliance-rules', 'GET');
  },
  createComplianceRule: async (data: Partial<ComplianceRule>): Promise<ComplianceRule> => {
    return apiCall('/payroll/compliance-rules', 'POST', data);
  },

  // Tax
  getTaxSlabs: async (): Promise<TaxSlab[]> => {
    return apiCall('/payroll/tax-slabs', 'GET');
  },
  getEmployeeTaxProfile: async (employeeId: string): Promise<any> => {
    return apiCall(`/payroll/employee-tax-profiles/${employeeId}`, 'GET');
  },
  updateEmployeeTaxProfile: async (employeeId: string, data: any): Promise<any> => {
    return apiCall(`/payroll/employee-tax-profiles/${employeeId}`, 'PUT', data);
  },

  // Payslips
  generatePayslip: async (payrollRecordId: string): Promise<Payslip> => {
    return apiCall(`/payroll/payslips/generate/${payrollRecordId}`, 'POST');
  },
  getPayslips: async (employeeId: string): Promise<Payslip[]> => {
    return apiCall(`/payroll/employees/${employeeId}/payslips`, 'GET');
  },
  getPayslipById: async (id: string): Promise<Payslip> => {
    return apiCall(`/payroll/payslips/${id}`, 'GET');
  },

  // Workflows
  getWorkflows: async (): Promise<PayrollWorkflow[]> => {
    return apiCall('/payroll/workflows', 'GET');
  },

  // Approvals
  getPendingApprovals: async (): Promise<PayrollApproval[]> => {
    return apiCall('/payroll/approvals/pending', 'GET');
  },
  approveStep: async (id: string, comments?: string): Promise<void> => {
    return apiCall(`/payroll/approvals/${id}/approve`, 'POST', { comments });
  },

  // Governance
  getVariances: async (): Promise<PayrollVariance[]> => {
    return apiCall('/payroll/variances', 'GET');
  },
  getNotifications: async (): Promise<PayrollNotification[]> => {
    return apiCall('/payroll/notifications', 'GET');
  },
  markNotificationRead: async (id: string): Promise<void> => {
    return apiCall(`/payroll/notifications/${id}/read`, 'PUT');
  },
  getReopenRequests: async (): Promise<any[]> => {
    return apiCall('/payroll/reopen-requests', 'GET');
  },
  requestReopen: async (data: any): Promise<any> => {
    return apiCall('/payroll/reopen-requests', 'POST', data);
  },

  // Finance
  getLedgers: async (): Promise<PayrollLedger[]> => {
    return apiCall('/payroll/ledgers', 'GET');
  },
  createLedger: async (data: Partial<PayrollLedger>): Promise<PayrollLedger> => {
    return apiCall('/payroll/ledgers', 'POST', data);
  },
  getJournals: async (): Promise<PayrollJournal[]> => {
    return apiCall('/payroll/journals', 'GET');
  },
  postJournal: async (cycleId: string): Promise<PayrollJournal> => {
    return apiCall(`/payroll/journals/post/${cycleId}`, 'POST');
  },
  runReconciliation: async (cycleId: string): Promise<any> => {
    return apiCall(`/payroll/reconciliations/run/${cycleId}`, 'POST');
  },
  exportToCsv: async (cycleId: string): Promise<void> => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3003/api';
    const response = await fetch(`${baseUrl}/payroll/exports/csv/${cycleId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Payroll_Export_${cycleId}.csv`;
    a.click();
  },

  // Disbursements
  getDisbursements: async (): Promise<PayrollDisbursement[]> => {
    return apiCall('/payroll/disbursements', 'GET');
  },
  initiateDisbursements: async (cycleId: string): Promise<void> => {
    return apiCall(`/payroll/disbursements/initiate/${cycleId}`, 'POST');
  },
  processDisbursementBatch: async (ids: string[]): Promise<void> => {
    return apiCall('/payroll/disbursements/process-batch', 'POST', { ids });
  }
};
