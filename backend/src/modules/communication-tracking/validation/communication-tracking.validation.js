const { z } = require('zod');

const CommentSchema = z.object({
  ticket_id: z.string().uuid(),
  message: z.string().trim().min(1).max(5000),
  visibility: z.enum(['PUBLIC', 'INTERNAL']).optional().default('PUBLIC'),
  subject: z.string().trim().max(500).optional().nullable(),
});

const ChatSchema = z.object({
  ticket_id: z.string().uuid(),
  message: z.string().trim().min(1).max(5000),
  direction: z.enum(['INBOUND', 'OUTBOUND', 'INTERNAL']).optional().default('OUTBOUND'),
});

const EmailSchema = z.object({
  ticket_id: z.string().uuid(),
  sender: z.string().trim().min(1).max(255),
  recipient: z.string().trim().min(1).max(255),
  cc: z.string().trim().max(500).optional().nullable(),
  subject: z.string().trim().min(1).max(500),
  body: z.string().trim().min(1).max(20000),
  status: z.enum(['SENT', 'FAILED', 'RECEIVED']).optional().default('SENT'),
});

const CallLogSchema = z.object({
  ticket_id: z.string().uuid(),
  customer_name: z.string().trim().max(200).optional().nullable(),
  phone_number: z.string().trim().max(50).optional().nullable(),
  call_start_at: z.string().datetime(),
  call_end_at: z.string().datetime().optional().nullable(),
  duration_seconds: z.number().int().min(0).optional().nullable(),
  call_summary: z.string().trim().max(5000).optional().nullable(),
  outcome: z.enum(['NO_ANSWER', 'CONNECTED', 'RESOLVED', 'FOLLOWUP_REQUIRED']).optional().default('CONNECTED'),
});

const InternalNoteSchema = z.object({
  ticket_id: z.string().uuid(),
  message: z.string().trim().min(1).max(5000),
  subject: z.string().trim().max(500).optional().nullable(),
});

function parseSchema(schema, data, label = 'Request') {
  const result = schema.safeParse(data);
  if (!result.success) {
    const AppError = require('../../../utils/app-error');
    throw AppError.badRequest(`${label} validation failed`, result.error.issues.map((i) => ({
      path: i.path.join('.'),
      message: i.message,
    })));
  }
  return result.data;
}

module.exports = {
  CommentSchema,
  ChatSchema,
  EmailSchema,
  CallLogSchema,
  InternalNoteSchema,
  parseSchema,
};
