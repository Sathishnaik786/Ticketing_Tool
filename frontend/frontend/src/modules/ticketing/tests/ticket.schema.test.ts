import { describe, it, expect } from 'vitest';
import { createTicketSchema } from '../schemas/ticket.schema';

describe('createTicketSchema', () => {
  const validPayload = {
    title: 'VPN not working',
    description: 'Unable to connect to corporate VPN from home network.',
    priority: 'MEDIUM' as const,
    category_id: 'a1000001-0000-4000-8000-000000000001',
    department_id: '550e8400-e29b-41d4-a716-446655440020',
  };

  it('accepts valid ticket input', () => {
    const result = createTicketSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('rejects title shorter than 3 characters', () => {
    const result = createTicketSchema.safeParse({
      ...validPayload,
      title: 'ab',
    });
    expect(result.success).toBe(false);
  });

  it('rejects title longer than 255 characters', () => {
    const result = createTicketSchema.safeParse({
      ...validPayload,
      title: 'a'.repeat(256),
    });
    expect(result.success).toBe(false);
  });

  it('rejects description shorter than 10 characters', () => {
    const result = createTicketSchema.safeParse({
      ...validPayload,
      description: 'too short',
    });
    expect(result.success).toBe(false);
  });

  it('requires category and department', () => {
    const missingCategory = createTicketSchema.safeParse({
      title: validPayload.title,
      description: validPayload.description,
      priority: validPayload.priority,
      department_id: validPayload.department_id,
    });

    const missingDepartment = createTicketSchema.safeParse({
      title: validPayload.title,
      description: validPayload.description,
      priority: validPayload.priority,
      category_id: validPayload.category_id,
    });

    expect(missingCategory.success).toBe(false);
    expect(missingDepartment.success).toBe(false);
  });
});
