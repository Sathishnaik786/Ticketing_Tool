const { z } = require('zod');

const scoreSchema = z.number().int().min(1).max(5);

const SubmitFeedbackSchema = z.object({
  ticket_id: z.string().uuid(),
  rating: scoreSchema,
  resolution_quality: scoreSchema,
  communication_quality: scoreSchema,
  response_time: scoreSchema,
  comments: z.string().trim().max(1000).optional().nullable(),
});

const MetricsQuerySchema = z.object({
  department_id: z.string().uuid().optional(),
  category_id: z.string().uuid().optional(),
  from_date: z.string().datetime().optional(),
  to_date: z.string().datetime().optional(),
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
  SubmitFeedbackSchema,
  MetricsQuerySchema,
  parseSchema,
};
