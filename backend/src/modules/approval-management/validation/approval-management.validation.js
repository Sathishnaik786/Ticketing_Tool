const { z } = require('zod');
const AppError = require('../../../utils/app-error');
const {
  APPROVAL_TYPES,
  APPROVER_ROLES,
  CATALOG_CATEGORIES,
} = require('../approval-management.constants');

const WorkflowStepSchema = z.object({
  step_order: z.number().int().min(1),
  step_name: z.string().min(1).max(200),
  approver_role: z.enum(APPROVER_ROLES),
  approver_employee_id: z.string().uuid().optional().nullable(),
  escalation_hours: z.number().int().positive().optional().nullable(),
  is_required: z.boolean().optional().default(true),
});

const CreateWorkflowSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  service_item_id: z.string().uuid().optional().nullable(),
  approval_type: z.enum(APPROVAL_TYPES).default('MULTI'),
  is_active: z.boolean().optional().default(true),
  department_id: z.string().uuid().optional().nullable(),
  steps: z.array(WorkflowStepSchema).min(1),
});

const UpdateWorkflowSchema = CreateWorkflowSchema.partial().extend({
  steps: z.array(WorkflowStepSchema).min(1).optional(),
});

const StartApprovalSchema = z.object({
  workflow_id: z.string().uuid(),
  comments: z.string().max(2000).optional().nullable(),
});

const DecisionSchema = z.object({
  comments: z.string().max(2000).optional().nullable(),
});

function parseSchema(schema, body, label) {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw AppError.badRequest(`${label} validation failed`, result.error.flatten());
  }
  return result.data;
}

module.exports = {
  WorkflowStepSchema,
  CreateWorkflowSchema,
  UpdateWorkflowSchema,
  StartApprovalSchema,
  DecisionSchema,
  parseSchema,
  CATALOG_CATEGORIES,
};
