export type ComponentCategory = 'EARNING' | 'DEDUCTION' | 'CONTRIBUTION';
export type CalculationType = 'FIXED' | 'FORMULA' | 'PERCENTAGE';
export type AssignmentStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

export interface SalaryComponent {
  id: string;
  code: string;
  name: string;
  component_category: ComponentCategory;
  calculation_type: CalculationType;
  formula?: string | null;
  taxable: boolean;
  affects_gross: boolean;
  affects_net: boolean;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SalaryStructure {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  components?: SalaryStructureComponent[];
}

export interface SalaryStructureComponent {
  id: string;
  salary_structure_id: string;
  component_id: string;
  sequence_order: number;
  formula_override?: string;
  is_mandatory: boolean;
  component?: SalaryComponent;
}

export interface EmployeeSalaryAssignment {
  id: string;
  employee_id: string;
  salary_structure_id: string;
  annual_ctc: number;
  monthly_ctc: number;
  effective_from: string;
  effective_to?: string;
  status: AssignmentStatus;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    employee_id: string;
  };
  structure?: {
    id: string;
    name: string;
  };
  created_at?: string;
}

export interface PayrollSetting {
  id: string;
  setting_key: string;
  setting_value: any;
}

export type CycleStatus = 'DRAFT' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'LOCKED';
export type RecordStatus = 'PENDING' | 'PROCESSED' | 'FAILED' | 'LOCKED';

export interface PayrollCycle {
  id: string;
  cycle_name: string;
  month: number;
  year: number;
  start_date: string;
  end_date: string;
  status: CycleStatus;
  is_locked: boolean;
  processed_at?: string;
  created_at: string;
  records?: PayrollRecord[];
}

export interface PayrollRecord {
  id: string;
  payroll_cycle_id: string;
  employee_id: string;
  salary_assignment_id: string;
  gross_salary: number;
  total_earnings: number;
  total_deductions: number;
  net_salary: number;
  payable_days: number;
  lop_days: number;
  working_days: number;
  status: RecordStatus;
  processing_error?: string;
  is_locked: boolean;
  processed_at?: string;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    employee_id: string;
  };
  cycle?: {
    id: string;
    cycle_name: string;
  };
  components?: PayrollComponentValue[];
  snapshot?: any;
}

export interface PayrollComponentValue {
  id: string;
  payroll_record_id: string;
  component_id?: string;
  component_name: string;
  component_code: string;
  component_category: string;
  formula_snapshot: string;
  calculated_amount: number;
  sequence_order: number;
}

export interface ProcessingLog {
  id: string;
  payroll_cycle_id: string;
  employee_id?: string;
  log_level: 'INFO' | 'ERROR' | 'WARN';
  message: string;
  metadata?: any;
  created_at: string;
}

export interface ComplianceRule {
  id: string;
  rule_code: string;
  rule_name: string;
  rule_type: 'PF' | 'ESI' | 'PT' | 'TDS' | 'GRATUITY' | 'BONUS';
  calculation_type: 'FIXED' | 'PERCENTAGE' | 'FORMULA' | 'SLAB';
  formula?: string;
  minimum_limit: number;
  maximum_limit: number;
  percentage_value?: number;
  fixed_amount?: number;
  effective_from: string;
  effective_to?: string;
  is_active: boolean;
}

export interface TaxSlab {
  id: string;
  regime_name: string;
  minimum_income: number;
  maximum_income?: number;
  tax_percentage: number;
  cess_percentage: number;
  surcharge_percentage: number;
  effective_from: string;
}

export interface Payslip {
  id: string;
  payroll_record_id: string;
  payslip_number: string;
  file_url: string;
  file_name: string;
  generated_at: string;
  is_signed: boolean;
  document_hash: string;
  verification_token: string;
  record?: PayrollRecord;
}

export interface PayrollWorkflow {
  id: string;
  workflow_code: string;
  workflow_name: string;
  description?: string;
  is_active: boolean;
  steps: PayrollWorkflowStep[];
}

export interface PayrollWorkflowStep {
  id: string;
  workflow_id: string;
  step_name: string;
  step_order: number;
  approver_role: string;
  is_mandatory: boolean;
  sla_hours: number;
}

export interface PayrollApproval {
  id: string;
  payroll_cycle_id: string;
  workflow_step_id: string;
  approver_id?: string;
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED' | 'SKIPPED';
  comments?: string;
  approved_at?: string;
  created_at?: string;
  cycle?: PayrollCycle;
  step?: PayrollWorkflowStep;
}

export interface PayrollVariance {
  id: string;
  payroll_record_id: string;
  variance_type: string;
  previous_amount: number;
  current_amount: number;
  variance_percentage: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  remarks: string;
  record?: PayrollRecord;
}

export interface PayrollNotification {
  id: string;
  recipient_id: string;
  notification_type: string;
  title: string;
  message: string;
  reference_type?: string;
  reference_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface PayrollLedger {
  id: string;
  account_code: string;
  account_name: string;
  account_type: 'ASSET' | 'LIABILITY' | 'EXPENSE' | 'INCOME' | 'PAYABLE';
  is_active: boolean;
}

export interface PayrollJournal {
  id: string;
  payroll_cycle_id: string;
  journal_number: string;
  posting_date: string;
  journal_status: 'DRAFT' | 'POSTED' | 'REVERSED';
  total_debit: number;
  total_credit: number;
  lines: PayrollJournalLine[];
}

export interface PayrollJournalLine {
  id: string;
  ledger_account_id: string;
  entry_type: 'DEBIT' | 'CREDIT';
  description?: string;
  debit_amount: number;
  credit_amount: number;
  account?: PayrollLedger;
}

export interface PayrollDisbursement {
  id: string;
  payroll_record_id: string;
  bank_reference_no?: string;
  payment_method: string;
  disbursement_status: 'PENDING' | 'SCHEDULED' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'REVERSED';
  amount: number;
  processed_at?: string;
  record?: PayrollRecord;
}
