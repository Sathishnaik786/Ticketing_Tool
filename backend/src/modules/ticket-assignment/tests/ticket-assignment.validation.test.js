const test = require('node:test');
const assert = require('node:assert/strict');
const {
  AssignTicketSchema,
  ReassignTicketSchema,
  QueueQuerySchema,
  parseSchema,
} = require('../ticket-assignment.validation');
const AppError = require('../../../utils/app-error');
const { mapAssignmentTypeToDb } = require('../ticket-assignment.repository');

const TICKET_ID = '550e8400-e29b-41d4-a716-446655440001';
const ASSIGNEE_ID = '550e8400-e29b-41d4-a716-446655440014';

test('AssignTicketSchema accepts valid payload', () => {
  const result = parseSchema(AssignTicketSchema, {
    ticket_id: TICKET_ID,
    assigned_to: ASSIGNEE_ID,
    assignment_type: 'MANUAL',
    reason: 'Queue assign',
  });
  assert.equal(result.assignment_type, 'MANUAL');
});

test('AssignTicketSchema defaults assignment_type to MANUAL', () => {
  const result = parseSchema(AssignTicketSchema, {
    ticket_id: TICKET_ID,
    assigned_to: ASSIGNEE_ID,
  });
  assert.equal(result.assignment_type, 'MANUAL');
});

test('AssignTicketSchema rejects missing ticket_id', () => {
  assert.throws(
    () => parseSchema(AssignTicketSchema, { assigned_to: ASSIGNEE_ID }),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});

test('AssignTicketSchema rejects invalid assignment_type', () => {
  assert.throws(
    () => parseSchema(AssignTicketSchema, {
      ticket_id: TICKET_ID,
      assigned_to: ASSIGNEE_ID,
      assignment_type: 'INVALID',
    }),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});

test('ReassignTicketSchema accepts REASSIGNED type', () => {
  const result = parseSchema(ReassignTicketSchema, {
    assigned_to: ASSIGNEE_ID,
    assignment_type: 'REASSIGNED',
  });
  assert.equal(result.assignment_type, 'REASSIGNED');
});

test('ReassignTicketSchema rejects invalid assigned_to', () => {
  assert.throws(
    () => parseSchema(ReassignTicketSchema, { assigned_to: 'x' }),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});

test('QueueQuerySchema defaults pagination', () => {
  const result = parseSchema(QueueQuerySchema, {});
  assert.equal(result.page, 1);
  assert.equal(result.limit, 20);
});

test('QueueQuerySchema rejects limit above 100', () => {
  assert.throws(
    () => parseSchema(QueueQuerySchema, { limit: 200 }),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});

test('mapAssignmentTypeToDb maps AUTO to QUEUE', () => {
  assert.equal(mapAssignmentTypeToDb('AUTO'), 'QUEUE');
});

test('mapAssignmentTypeToDb maps ESCALATED to MANUAL', () => {
  assert.equal(mapAssignmentTypeToDb('ESCALATED'), 'MANUAL');
});

test('mapAssignmentTypeToDb preserves MANUAL', () => {
  assert.equal(mapAssignmentTypeToDb('MANUAL'), 'MANUAL');
});

test('mapAssignmentTypeToDb preserves ROUND_ROBIN', () => {
  assert.equal(mapAssignmentTypeToDb('ROUND_ROBIN'), 'ROUND_ROBIN');
});
