import { z } from 'zod';

export const ticketPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

export const ticketCategoryEnum = z.enum([
  'GENERAL',
  'IT',
  'FACILITIES',
  'HR',
  'PAYROLL',
  'OTHER',
]);

export const createTicketSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(255, 'Title must be at most 255 characters'),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters'),
  priority: ticketPriorityEnum,
  category_id: z.string().uuid('Category is required'),
  department_id: z.string().uuid('Department is required'),
});

export type CreateTicketFormValues = z.infer<typeof createTicketSchema>;

export const commentSchema = z.object({
  content: z.string().trim().min(1, 'Comment cannot be empty'),
  is_internal: z.boolean().default(false),
});

export type CommentFormValues = z.infer<typeof commentSchema>;
