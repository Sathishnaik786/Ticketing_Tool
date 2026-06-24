const { z } = require('zod');
const AppError = require('../../../utils/app-error');
const { REPORT_TYPES, EXPORT_FORMATS } = require('../executive-analytics.constants');

const DashboardFilterSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  department_id: z.string().uuid().optional(),
  business_unit: z.string().max(150).optional(),
});

const CreateReportSchema = z.object({
  name: z.string().min(1).max(200),
  report_type: z.enum(REPORT_TYPES),
  format: z.enum(EXPORT_FORMATS).optional().default('JSON'),
  filters: z.record(z.unknown()).optional().default({}),
});

function parseSchema(schema, body, label) {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw AppError.badRequest(`${label} validation failed`, result.error.flatten());
  }
  return result.data;
}

module.exports = {
  DashboardFilterSchema,
  CreateReportSchema,
  parseSchema,
};
