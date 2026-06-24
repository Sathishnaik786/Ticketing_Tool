const { z } = require('zod');

const assignmentTypeSchema = z.enum(['MANUAL', 'AUTO', 'ESCALATED', 'REASSIGNED', 'ROUND_ROBIN', 'QUEUE', 'SKILL_BASED']);

const AssignTicketSchema = z.object({
  ticket_id: z.string().uuid(),
  assigned_to: z.string().uuid(),
  assignment_type: assignmentTypeSchema.optional().default('MANUAL'),
  reason: z.string().trim().max(1000).optional().nullable(),
});

const ReassignTicketSchema = z.object({
  assigned_to: z.string().uuid(),
  assignment_type: assignmentTypeSchema.optional().default('REASSIGNED'),
  reason: z.string().trim().max(1000).optional().nullable(),
});

const QueueQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.string().trim().optional(),
  priority: z.string().trim().optional(),
});

function parseSchema(schema, data, label = 'Request') {
  const result = schema.safeParse(data);
  if (!result.success) {
    const AppError = require('../../utils/app-error');
    const details = result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    throw AppError.badRequest(`${label} validation failed`, details);
  }
  return result.data;
}

module.exports = {
  AssignTicketSchema,
  ReassignTicketSchema,
  QueueQuerySchema,
  parseSchema,
};
