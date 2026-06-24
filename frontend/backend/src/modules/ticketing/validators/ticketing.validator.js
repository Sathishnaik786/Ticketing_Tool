const { z } = require('zod');
const { TICKET_PRIORITIES } = require('../ticketing.types');

const uuidSchema = z.string().uuid();
const prioritySchema = z.enum(TICKET_PRIORITIES);

const CreateTicketSchema = z.object({
  title: z.string().trim().min(3).max(255),
  description: z.string().trim().min(10).max(5000),
  department_id: uuidSchema.optional().nullable(),
  category_id: uuidSchema.optional().nullable(),
  subcategory_id: uuidSchema.optional().nullable(),
  priority: prioritySchema.optional().default('MEDIUM'),
});

const UpdateTicketSchema = z.object({
  title: z.string().trim().min(3).max(255).optional(),
  description: z.string().trim().min(10).max(5000).optional(),
  department_id: uuidSchema.optional().nullable(),
  category_id: uuidSchema.optional().nullable(),
  subcategory_id: uuidSchema.optional().nullable(),
  priority: prioritySchema.optional(),
  resolution_notes: z.string().trim().max(5000).optional().nullable(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field is required to update a ticket' }
);

const AssignTicketSchema = z.object({
  assignee_id: uuidSchema,
  assignment_type: z.enum(['MANUAL', 'ROUND_ROBIN', 'QUEUE', 'SKILL_BASED']).optional().default('MANUAL'),
  notes: z.string().trim().max(1000).optional().nullable(),
});

const CreateCommentSchema = z.object({
  content: z.string().trim().min(1).max(2000),
  is_internal: z.boolean().optional().default(false),
});

const UploadAttachmentSchema = z.object({
  file_name: z.string().trim().min(1).max(255),
  mime_type: z.string().trim().min(1).max(100),
  file_size: z.number().int().positive().max(4 * 1024 * 1024),
});

const AddWatcherSchema = z.object({
  employee_id: uuidSchema.optional(),
});

const TicketListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.string().trim().optional(),
  priority: prioritySchema.optional(),
  department_id: uuidSchema.optional(),
  assignee_id: uuidSchema.optional(),
  requester_id: uuidSchema.optional(),
  search: z.string().trim().max(255).optional(),
  sort_by: z.enum(['created_at', 'updated_at', 'priority', 'status']).optional().default('created_at'),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
});

const ChangeStatusSchema = z.object({
  status: z.string().trim().min(1),
  resolution_notes: z.string().trim().max(5000).optional().nullable(),
});

function parseSchema(schema, data, label = 'Request') {
  const result = schema.safeParse(data);
  if (!result.success) {
    const AppError = require('../../../utils/app-error');
    const details = result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    throw AppError.badRequest(`${label} validation failed`, details);
  }
  return result.data;
}

module.exports = {
  CreateTicketSchema,
  UpdateTicketSchema,
  AssignTicketSchema,
  CreateCommentSchema,
  UploadAttachmentSchema,
  AddWatcherSchema,
  TicketListQuerySchema,
  ChangeStatusSchema,
  parseSchema,
};
