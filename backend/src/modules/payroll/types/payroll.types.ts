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
  created_at?: Date;
  updated_at?: Date;
}

export interface SalaryStructure {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_by?: string;
  created_at?: Date;
  updated_at?: Date;
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
  created_at?: Date;
  updated_at?: Date;
}

export interface PayrollSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  created_at?: Date;
  updated_at?: Date;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_value?: any;
  new_value?: any;
  created_at?: Date;
}
