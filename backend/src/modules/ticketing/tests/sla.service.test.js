const test = require('node:test');
const assert = require('node:assert/strict');
const SlaService = require('../services/sla.service');
const { createMockSupabase } = require('./helpers/mock-supabase');

const SLA_RULE = {
  id: 'sla-1',
  name: 'Global Medium SLA',
  department_id: null,
  category_id: null,
  priority: 'MEDIUM',
  response_time_minutes: 120,
  resolution_time_minutes: 1440,
  is_active: true,
};

test('SLA calculateDueDates returns null when no rule exists', () => {
  const service = new SlaService({ supabaseAdmin: createMockSupabase() });
  const dueDates = service.calculateDueDates(null, new Date('2026-01-01T00:00:00.000Z'));

  assert.equal(dueDates.sla_response_due_at, null);
  assert.equal(dueDates.sla_resolution_due_at, null);
});

test('SLA calculateDueDates computes response and resolution deadlines', () => {
  const service = new SlaService({ supabaseAdmin: createMockSupabase() });
  const baseDate = new Date('2026-01-01T00:00:00.000Z');
  const dueDates = service.calculateDueDates(SLA_RULE, baseDate);

  assert.equal(dueDates.sla_response_due_at, '2026-01-01T02:00:00.000Z');
  assert.equal(dueDates.sla_resolution_due_at, '2026-01-02T00:00:00.000Z');
});

test('SLA getApplicableRule falls back to global rule', async () => {
  const mockDb = createMockSupabase({
    handlers: {
      ticket_sla_rules: {
        select: ({ filters, maybeSingle }) => {
          const departmentFilter = filters.find((f) => f.column === 'department_id');
          if (departmentFilter?.value === null || departmentFilter?.type === 'is') {
            return { data: SLA_RULE, error: null };
          }
          if (maybeSingle) {
            return { data: null, error: null };
          }
          return { data: SLA_RULE, error: null };
        },
      },
    },
  });

  const service = new SlaService({ supabaseAdmin: mockDb });
  const rule = await service.getApplicableRule({
    departmentId: null,
    categoryId: null,
    priority: 'MEDIUM',
  });

  assert.equal(rule.id, 'sla-1');
});

test('SLA resolveDueDates returns wrapped success response', async () => {
  const mockDb = createMockSupabase({
    handlers: {
      ticket_sla_rules: {
        select: () => ({ data: SLA_RULE, error: null }),
      },
    },
  });

  const service = new SlaService({ supabaseAdmin: mockDb });
  const result = await service.resolveDueDates({ priority: 'MEDIUM' });

  assert.equal(result.success, true);
  assert.equal(result.data.rule.priority, 'MEDIUM');
  assert.ok(result.data.dueDates.sla_response_due_at);
});
