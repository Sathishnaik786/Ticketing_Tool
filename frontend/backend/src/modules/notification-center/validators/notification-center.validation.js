const { z } = require('zod');
const AppError = require('../../../utils/app-error');
const { EVENT_TYPES, PRIORITIES, DELIVERY_CHANNELS } = require('../notification-center.constants');

const NotificationFilterSchema = z.object({
  status: z.enum(['read', 'unread', 'all']).optional().default('all'),
  priority: z.enum(PRIORITIES).optional(),
  source_module: z.string().max(50).optional(),
  search: z.string().max(200).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

const PreferencesSchema = z.object({
  email_enabled: z.boolean().optional(),
  in_app_enabled: z.boolean().optional(),
  sms_enabled: z.boolean().optional(),
  push_enabled: z.boolean().optional(),
});

const TemplateSchema = z.object({
  code: z.string().min(1).max(80),
  name: z.string().min(1).max(150),
  type: z.string().min(1).max(50),
  subject: z.string().min(1).max(255),
  message_template: z.string().min(1),
  is_active: z.boolean().optional().default(true),
});

const TemplateUpdateSchema = TemplateSchema.partial().omit({ code: true });

const AnalyticsFilterSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  department_id: z.string().uuid().optional(),
});

function parseSchema(schema, body, label) {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw AppError.badRequest(`${label} validation failed`, result.error.flatten());
  }
  return result.data;
}

module.exports = {
  NotificationFilterSchema,
  PreferencesSchema,
  TemplateSchema,
  TemplateUpdateSchema,
  AnalyticsFilterSchema,
  parseSchema,
  EVENT_TYPES,
};
