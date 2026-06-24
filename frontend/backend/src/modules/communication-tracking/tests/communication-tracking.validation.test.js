const test = require('node:test');
const assert = require('node:assert/strict');
const {
  CommentSchema,
  ChatSchema,
  EmailSchema,
  CallLogSchema,
  InternalNoteSchema,
  parseSchema,
} = require('../validation/communication-tracking.validation');
const AppError = require('../../../utils/app-error');

const TICKET_ID = '550e8400-e29b-41d4-a716-446655440001';

test('CommentSchema accepts valid payload', () => {
  const result = parseSchema(CommentSchema, { ticket_id: TICKET_ID, message: 'Hello' });
  assert.equal(result.visibility, 'PUBLIC');
});

test('CommentSchema defaults visibility to PUBLIC', () => {
  const result = parseSchema(CommentSchema, { ticket_id: TICKET_ID, message: 'Hi' });
  assert.equal(result.visibility, 'PUBLIC');
});

test('CommentSchema accepts INTERNAL visibility', () => {
  const result = parseSchema(CommentSchema, { ticket_id: TICKET_ID, message: 'Secret', visibility: 'INTERNAL' });
  assert.equal(result.visibility, 'INTERNAL');
});

test('CommentSchema rejects empty message', () => {
  assert.throws(
    () => parseSchema(CommentSchema, { ticket_id: TICKET_ID, message: '   ' }),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});

test('CommentSchema rejects invalid ticket_id', () => {
  assert.throws(
    () => parseSchema(CommentSchema, { ticket_id: 'bad', message: 'x' }),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});

test('CommentSchema accepts optional subject', () => {
  const result = parseSchema(CommentSchema, { ticket_id: TICKET_ID, message: 'x', subject: 'Re: issue' });
  assert.equal(result.subject, 'Re: issue');
});

test('ChatSchema accepts valid payload', () => {
  const result = parseSchema(ChatSchema, { ticket_id: TICKET_ID, message: 'Chat msg' });
  assert.equal(result.direction, 'OUTBOUND');
});

test('ChatSchema accepts INTERNAL direction', () => {
  const result = parseSchema(ChatSchema, { ticket_id: TICKET_ID, message: 'x', direction: 'INTERNAL' });
  assert.equal(result.direction, 'INTERNAL');
});

test('ChatSchema rejects invalid direction', () => {
  assert.throws(
    () => parseSchema(ChatSchema, { ticket_id: TICKET_ID, message: 'x', direction: 'SIDEWAYS' }),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});

test('EmailSchema accepts valid payload', () => {
  const result = parseSchema(EmailSchema, {
    ticket_id: TICKET_ID,
    sender: 'a@x.com',
    recipient: 'b@x.com',
    subject: 'Test',
    body: 'Body text',
  });
  assert.equal(result.status, 'SENT');
});

test('EmailSchema accepts RECEIVED status', () => {
  const result = parseSchema(EmailSchema, {
    ticket_id: TICKET_ID,
    sender: 'a@x.com',
    recipient: 'b@x.com',
    subject: 'Test',
    body: 'Body',
    status: 'RECEIVED',
  });
  assert.equal(result.status, 'RECEIVED');
});

test('EmailSchema rejects missing subject', () => {
  assert.throws(
    () => parseSchema(EmailSchema, {
      ticket_id: TICKET_ID,
      sender: 'a@x.com',
      recipient: 'b@x.com',
      body: 'Body',
    }),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});

test('CallLogSchema accepts valid payload', () => {
  const result = parseSchema(CallLogSchema, {
    ticket_id: TICKET_ID,
    call_start_at: '2026-06-15T10:00:00.000Z',
    outcome: 'CONNECTED',
  });
  assert.equal(result.outcome, 'CONNECTED');
});

test('CallLogSchema rejects invalid outcome', () => {
  assert.throws(
    () => parseSchema(CallLogSchema, {
      ticket_id: TICKET_ID,
      call_start_at: '2026-06-15T10:00:00.000Z',
      outcome: 'WRONG',
    }),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});

test('CallLogSchema accepts optional duration', () => {
  const result = parseSchema(CallLogSchema, {
    ticket_id: TICKET_ID,
    call_start_at: '2026-06-15T10:00:00.000Z',
    duration_seconds: 120,
  });
  assert.equal(result.duration_seconds, 120);
});

test('InternalNoteSchema accepts valid payload', () => {
  const result = parseSchema(InternalNoteSchema, { ticket_id: TICKET_ID, message: 'Internal only' });
  assert.equal(result.message, 'Internal only');
});

test('InternalNoteSchema rejects empty message', () => {
  assert.throws(
    () => parseSchema(InternalNoteSchema, { ticket_id: TICKET_ID, message: '' }),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});

test('CommentSchema rejects message over max length', () => {
  assert.throws(
    () => parseSchema(CommentSchema, { ticket_id: TICKET_ID, message: 'x'.repeat(5001) }),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});

test('EmailSchema rejects body over max length', () => {
  assert.throws(
    () => parseSchema(EmailSchema, {
      ticket_id: TICKET_ID,
      sender: 'a@x.com',
      recipient: 'b@x.com',
      subject: 's',
      body: 'x'.repeat(20001),
    }),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});

test('CallLogSchema rejects negative duration', () => {
  assert.throws(
    () => parseSchema(CallLogSchema, {
      ticket_id: TICKET_ID,
      call_start_at: '2026-06-15T10:00:00.000Z',
      duration_seconds: -1,
    }),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});
