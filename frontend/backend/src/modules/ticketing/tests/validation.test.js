const test = require('node:test');
const assert = require('node:assert/strict');
const {
  CreateTicketSchema,
  AssignTicketSchema,
  CreateCommentSchema,
  TicketListQuerySchema,
  parseSchema,
} = require('../validators/ticketing.validator');
const {
  validateStatusTransition,
  hasPermission,
  PERMISSIONS,
} = require('../ticketing.types');
const AppError = require('../../../utils/app-error');

test('CreateTicketSchema validates title and description bounds', () => {
  const valid = CreateTicketSchema.safeParse({
    title: 'VPN issue',
    description: 'Unable to connect to corporate VPN from home network.',
    priority: 'HIGH',
  });
  assert.equal(valid.success, true);

  const invalidTitle = CreateTicketSchema.safeParse({
    title: 'No',
    description: 'Unable to connect to corporate VPN from home network.',
  });
  assert.equal(invalidTitle.success, false);

  const invalidDescription = CreateTicketSchema.safeParse({
    title: 'Valid title',
    description: 'short',
  });
  assert.equal(invalidDescription.success, false);
});

test('AssignTicketSchema requires UUID assignee', () => {
  const valid = AssignTicketSchema.safeParse({
    assignee_id: '550e8400-e29b-41d4-a716-446655440000',
  });
  assert.equal(valid.success, true);

  const invalid = AssignTicketSchema.safeParse({
    assignee_id: 'not-a-uuid',
  });
  assert.equal(invalid.success, false);
});

test('CreateCommentSchema enforces max length', () => {
  const valid = CreateCommentSchema.safeParse({ content: 'Please review logs.' });
  assert.equal(valid.success, true);

  const invalid = CreateCommentSchema.safeParse({ content: 'x'.repeat(2001) });
  assert.equal(invalid.success, false);
});

test('TicketListQuerySchema applies defaults and max limit', () => {
  const parsed = TicketListQuerySchema.parse({});
  assert.equal(parsed.page, 1);
  assert.equal(parsed.limit, 20);

  const capped = TicketListQuerySchema.safeParse({ limit: 500 });
  assert.equal(capped.success, false);
});

test('parseSchema throws AppError on invalid payload', () => {
  assert.throws(
    () => parseSchema(CreateTicketSchema, { title: 'x', description: 'too short' }, 'Create ticket'),
    (error) => error instanceof AppError && error.statusCode === 400
  );
});

test('validateStatusTransition allows valid lifecycle paths', () => {
  assert.equal(validateStatusTransition('OPEN', 'ASSIGNED'), 'ASSIGNED');
  assert.equal(validateStatusTransition('IN_PROGRESS', 'RESOLVED'), 'RESOLVED');
  assert.equal(validateStatusTransition('RESOLVED', 'CLOSED'), 'CLOSED');
});

test('validateStatusTransition rejects invalid transitions', () => {
  assert.throws(
    () => validateStatusTransition('OPEN', 'CLOSED'),
    (error) => error instanceof AppError && error.statusCode === 400
  );
});

test('RBAC permission map controls assignment capability', () => {
  assert.equal(hasPermission({ role: 'EMPLOYEE' }, 'ASSIGN_TICKET'), false);
  assert.equal(hasPermission({ role: 'MANAGER' }, 'ASSIGN_TICKET'), true);
  assert.equal(hasPermission({ role: 'HR' }, 'VIEW_ALL_TICKETS'), true);
  assert.equal(PERMISSIONS.CREATE_TICKET.includes('EMPLOYEE'), true);
});
