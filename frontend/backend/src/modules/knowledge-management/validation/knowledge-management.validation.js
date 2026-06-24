const { z } = require('zod');
const AppError = require('../../../utils/app-error');
const { ARTICLE_STATUSES, FEEDBACK_TYPES } = require('../knowledge-management.constants');

const CreateArticleSchema = z.object({
  category_id: z.string().uuid(),
  title: z.string().min(1).max(300),
  summary: z.string().max(2000).optional().nullable(),
  content: z.string().min(1).max(50000),
  tags: z.array(z.string().min(1).max(100)).optional().default([]),
  attachments: z.array(z.record(z.unknown())).optional().default([]),
  status: z.enum(['DRAFT', 'REVIEW']).optional().default('DRAFT'),
});

const UpdateArticleSchema = z.object({
  category_id: z.string().uuid().optional(),
  title: z.string().min(1).max(300).optional(),
  summary: z.string().max(2000).optional().nullable(),
  content: z.string().min(1).max(50000).optional(),
  tags: z.array(z.string().min(1).max(100)).optional(),
  attachments: z.array(z.record(z.unknown())).optional(),
  status: z.enum(ARTICLE_STATUSES).optional(),
});

const RateArticleSchema = z.object({
  rating: z.number().int().min(1).max(5),
});

const ArticleFeedbackSchema = z.object({
  feedback_type: z.enum(FEEDBACK_TYPES).optional().default('GENERAL'),
  message: z.string().min(1).max(2000),
});

const SearchSchema = z.object({
  q: z.string().min(1).max(500),
  category_id: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

function parseSchema(schema, body, label) {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw AppError.badRequest(`${label} validation failed`, result.error.flatten());
  }
  return result.data;
}

module.exports = {
  CreateArticleSchema,
  UpdateArticleSchema,
  RateArticleSchema,
  ArticleFeedbackSchema,
  SearchSchema,
  parseSchema,
};
