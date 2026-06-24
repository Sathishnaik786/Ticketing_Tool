import { z } from 'zod';

export const salaryComponentSchema = z.object({
  code: z.string().min(2).max(20).regex(/^[A-Z0-9_]+$/, 'Code must be uppercase alphanumeric and underscores'),
  name: z.string().min(3).max(100),
  component_category: z.enum(['EARNING', 'DEDUCTION', 'CONTRIBUTION']),
  calculation_type: z.enum(['FIXED', 'FORMULA', 'PERCENTAGE']),
  formula: z.string().optional().nullable(),
  taxable: z.boolean().default(false),
  affects_gross: z.boolean().default(true),
  affects_net: z.boolean().default(true),
  display_order: z.number().int().default(0),
  is_active: z.boolean().default(true)
});

export const salaryStructureSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
  components: z.array(z.object({
    component_id: z.string().uuid(),
    sequence_order: z.number().int().default(0),
    formula_override: z.string().optional().nullable(),
    is_mandatory: z.boolean().default(false)
  })).optional()
});

export const salaryAssignmentSchema = z.object({
  employee_id: z.string().uuid(),
  salary_structure_id: z.string().uuid(),
  annual_ctc: z.number().positive(),
  monthly_ctc: z.number().positive(),
  effective_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  effective_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional().nullable()
});

export const payrollSettingSchema = z.object({
  key: z.string(),
  value: z.any()
});

export const payrollCycleSchema = z.object({
  cycle_name: z.string().min(3).max(100),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

export const processPayrollSchema = z.object({
  cycleId: z.string().uuid(),
  employeeIds: z.array(z.string().uuid()).optional()
});

export const payrollWorkflowSchema = z.object({
  workflow_code: z.string().min(3).max(50),
  workflow_name: z.string().min(3).max(100),
  steps: z.array(z.object({
    step_name: z.string(),
    approver_role: z.string(),
    sla_hours: z.number().int().positive()
  }))
});

export const approvalActionSchema = z.object({
  comments: z.string().optional()
});

export const reopenRequestSchema = z.object({
  cycleId: z.string().uuid(),
  reason: z.string().min(10)
});
