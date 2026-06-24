# 17 — Testing Strategy
# Phase 5.0: Enterprise Service Management Platform

---

## 1. Testing Pyramid

```
         ┌──────────────┐
         │   E2E Tests  │  (5%)  — Playwright — Full user journeys
         ├──────────────┤
         │  Integration │  (25%) — Supertest — API contracts + DB
         ├──────────────┤
         │  Unit Tests  │  (70%) — Vitest + Jest — Services + Logic
         └──────────────┘
```

---

## 2. Unit Tests

### Framework: Vitest (frontend) + Jest (backend)

### Backend Unit Test Matrix

| Module | Test File | Coverage Areas |
|---|---|---|
| Workflow Engine | `workflow.service.test.js` | Step evaluation, condition branching, approver resolution, escalation logic |
| SLA Engine | `sla-enforcement.service.test.js` | Due date calculation, business hours, pause/resume, breach detection |
| Service Catalog | `catalog-form.service.test.js` | Field validation, conditional logic, file type checks |
| Automation Engine | `rule-evaluator.service.test.js` | All condition operators, AND/OR groups, field path resolution |
| AI Copilot | `llm-provider.service.test.js` | Provider selection, fallback, PII scrubbing, cache hit/miss |
| RAG | `rag.service.test.js` | Text chunking, embedding storage, similarity query |
| Audit | `audit.service.test.js` | Log insertion, immutability check (no delete), field capture |
| KPI Service | `kpi.service.test.js` | MTTR/MTTA calculations, compliance %, trend formatting |

### Frontend Unit Test Matrix

| Component | Test File | Coverage Areas |
|---|---|---|
| WorkflowBuilderPage | `workflow-builder.test.tsx` | Node add/remove, edge connect, publish validation |
| DynamicFormRenderer | `dynamic-form.test.tsx` | All field types render, conditional show/hide, validation |
| ConditionBuilder | `condition-builder.test.tsx` | All operators render, value input adapts to field type |
| SlaPolicyBuilderPage | `sla-policy-builder.test.tsx` | Target rows CRUD, business hours toggle |
| useAiCopilot hooks | `ai-copilot.test.tsx` | Loading states, error states, feedback mutation |
| KpiScorecard | `kpi-scorecard.test.tsx` | Renders correct value, trend indicator direction |
| RuleBuilderPage | `rule-builder.test.tsx` | Add/remove condition rows, action config forms |

### Critical Business Logic Unit Tests

```typescript
// sla-enforcement.service.test.js
describe('SLA Due Date Calculation', () => {
  it('P1 response SLA: 30 minutes from creation', () => {
    const created = new Date('2026-07-01T09:00:00Z');
    const due = calculateSlaDeadline(created, 30, { enabled: false });
    expect(due).toEqual(new Date('2026-07-01T09:30:00Z'));
  });

  it('Business hours SLA: skips weekend', () => {
    const created = new Date('2026-07-04T17:30:00+05:30'); // Friday 5:30PM IST
    const due = calculateSlaDeadline(created, 60, {
      enabled: true, timezone: 'Asia/Kolkata',
      days: [1,2,3,4,5], start: '09:00', end: '18:00'
    });
    // Should land on Monday 09:30AM IST
    expect(due.toISOString()).toContain('2026-07-07T04:00'); // Monday 09:30 IST = 04:00 UTC
  });

  it('Paused SLA extends deadline by pause duration', () => {
    // ...
  });
});
```

```typescript
// rule-evaluator.service.test.js
describe('Condition Evaluation', () => {
  it('eq operator matches exact value', () => {
    const entity = { ticket: { priority: 'CRITICAL' } };
    const condition = { field_path: 'ticket.priority', operator: 'eq', value: 'CRITICAL' };
    expect(evaluateCondition(condition, entity)).toBe(true);
  });

  it('older_than_N_hours detects aged ticket', () => {
    const entity = { ticket: { created_at: new Date(Date.now() - 5 * 3600_000).toISOString() } };
    const condition = { field_path: 'ticket.age_hours', operator: 'gt', value: 4 };
    expect(evaluateCondition(condition, entity)).toBe(true);
  });

  it('AND group requires all conditions to match', () => { ... });
  it('OR group requires at least one condition to match', () => { ... });
  it('stop_processing prevents further rule evaluation', () => { ... });
});
```

---

## 3. Integration Tests

### Framework: Supertest (backend API) + Vitest (frontend hooks)

### API Integration Tests

```javascript
// workflow-engine.integration.test.js
describe('POST /api/v2/workflows', () => {
  it('creates a workflow draft', async () => {
    const res = await request(app)
      .post('/api/v2/workflows')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test Workflow', trigger_type: 'ticket.created' });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('DRAFT');
  });

  it('returns 403 for non-admin', async () => {
    const res = await request(app)
      .post('/api/v2/workflows')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ name: 'Hacked Workflow' });
    expect(res.status).toBe(403);
  });
});

// sla-enforcement.integration.test.js
describe('SLA Assignment on Ticket Create', () => {
  it('assigns default SLA policy to new P1 ticket', async () => {
    const ticket = await createTestTicket({ priority: 'CRITICAL' });
    const sla = await db.sla_assignments.findOne({ ticket_id: ticket.id });
    expect(sla).not.toBeNull();
    expect(sla.response_due_at).toBeDefined();
    const expectedResponse = addMinutes(ticket.created_at, 30);
    expect(Math.abs(sla.response_due_at - expectedResponse)).toBeLessThan(5000);
  });
});

// service-catalog.integration.test.js
describe('POST /api/v2/service-requests', () => {
  it('creates a service request + linked ticket', async () => {
    const res = await request(app)
      .post('/api/v2/service-requests')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ catalog_id: catalogId, form_data: { device_type: 'laptop', justification: 'Remote work' } });
    expect(res.status).toBe(201);
    expect(res.body.data.request_number).toMatch(/^SR-/);
    expect(res.body.data.ticket_id).toBeDefined();
  });

  it('rejects submission with missing required fields', async () => {
    const res = await request(app)
      .post('/api/v2/service-requests')
      .send({ catalog_id: catalogId, form_data: {} }); // Missing required fields
    expect(res.status).toBe(422);
    expect(res.body.errors).toContainEqual(expect.objectContaining({ field: 'device_type' }));
  });
});
```

---

## 4. End-to-End Tests

### Framework: Playwright

### Critical E2E Journeys

```typescript
// e2e/workflow.spec.ts
test('Admin creates and publishes a 3-step workflow', async ({ page }) => {
  await page.goto('/app/admin/workflows');
  await page.click('text=New Workflow');
  await page.fill('[data-testid=workflow-name]', 'Access Request');
  // Drag steps onto canvas
  await page.dragAndDrop('[data-testid=step-approval]', '[data-testid=canvas]');
  // ... configure steps
  await page.click('text=Publish');
  await expect(page.locator('[data-testid=workflow-status]')).toHaveText('Active');
});

// e2e/service-catalog.spec.ts
test('Employee submits laptop request and receives confirmation', async ({ page }) => {
  await page.goto('/app/service-catalog');
  await page.click('text=Laptop Request');
  await page.selectOption('[data-testid=device-type]', 'MacBook Pro');
  await page.fill('[data-testid=justification]', 'Remote work setup');
  await page.click('text=Submit Request');
  await expect(page).toHaveURL(/\/service-requests\/my/);
  await expect(page.locator('[data-testid=request-number]')).toMatch(/SR-/);
});

// e2e/sla.spec.ts
test('P1 ticket shows SLA timer on detail page', async ({ page }) => {
  const ticket = await createTestTicketViaAPI({ priority: 'CRITICAL' });
  await page.goto(`/app/tickets/${ticket.id}`);
  await expect(page.locator('[data-testid=sla-response-countdown]')).toBeVisible();
  await expect(page.locator('[data-testid=sla-resolution-countdown]')).toBeVisible();
});

// e2e/automation.spec.ts
test('Automation rule auto-assigns critical ticket', async ({ page }) => {
  // Create critical ticket via API
  const ticket = await createTestTicketViaAPI({ priority: 'CRITICAL', category: 'IT' });
  // Wait for automation to process (2s delay)
  await page.waitForTimeout(2000);
  // Verify assignee changed
  const updatedTicket = await getTicketViaAPI(ticket.id);
  expect(updatedTicket.assignee_group).toBe('network-team');
});
```

---

## 5. Performance Tests

### Framework: k6

```javascript
// k6/sla-monitor.test.js
import { check } from 'k6';
export const options = {
  scenarios: {
    sla_cron: { executor: 'constant-vus', vus: 1, duration: '5m' },
  },
  thresholds: { http_req_duration: ['p(95)<30000'] }, // 30s max
};

export default function () {
  // Simulate SLA cron with 10k active tickets
  const res = http.post(`${BASE_URL}/api/v2/internal/sla/run-monitor`);
  check(res, { 'status is 200': (r) => r.status === 200 });
}
```

```javascript
// k6/executive-dashboard.test.js
export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up
    { duration: '2m', target: 50 },   // Hold at 50 concurrent
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],  // 2s P95
    http_req_failed: ['rate<0.01'],     // < 1% error rate
  },
};
```

---

## 6. Security Tests

| Test | Tool | Frequency |
|---|---|---|
| SSRF on webhook action | Burp Suite / custom test | Pre-launch |
| SQL injection on all new inputs | SQLMap | Pre-launch |
| Prompt injection on AI endpoints | Custom test harness | Pre-launch + quarterly |
| IDOR on service requests | Custom auth test | Pre-launch |
| RBAC bypass attempts | Role-switching tests | Every release |
| Dependency vulnerability scan | `npm audit` + Snyk | Weekly CI |
| Penetration test | External firm | Pre-GA |

---

## 7. Accessibility Tests

```typescript
// a11y/workflow-builder.test.tsx
it('Workflow builder is keyboard navigable', async () => {
  render(<WorkflowBuilderPage />);
  // Tab through step palette
  // Enter to select step
  // Arrow keys to position on canvas
  // Escape to deselect
});

it('Form renderer has correct ARIA labels', async () => {
  const { getAllByRole } = render(<DynamicFormRenderer fields={testFields} />);
  const inputs = getAllByRole('textbox');
  inputs.forEach(input => {
    expect(input).toHaveAccessibleName();
  });
});
```

**Requirement:** All Phase 5 pages must pass `axe-core` automated scan with 0 critical violations.

---

## 8. UAT Testing

See `20_UAT_CHECKLIST.md` for detailed user acceptance test cases.

---

## 9. Test Coverage Targets

| Module | Unit Coverage | Integration Coverage |
|---|---|---|
| Workflow Engine | ≥ 85% | ≥ 70% |
| SLA Engine | ≥ 90% | ≥ 80% |
| Service Catalog | ≥ 80% | ≥ 70% |
| Automation Engine | ≥ 85% | ≥ 75% |
| AI Copilot | ≥ 75% | ≥ 60% |
| Executive Intelligence | ≥ 80% | ≥ 65% |
| Audit Compliance | ≥ 95% | ≥ 90% |

---

## 10. CI/CD Test Gates

```yaml
# .github/workflows/ci.yml (or equivalent)
test-phase5:
  steps:
    - run: npm test --coverage          # Unit tests (must all pass)
    - run: npm run test:integration      # Integration tests (must all pass)
    - run: npm audit --audit-level=high  # Security (no high+ vulnerabilities)
    - run: npx axe-cli http://localhost:5173/app/service-catalog  # A11y
    # E2E runs separately in staging environment
    # Performance tests run weekly, not on every PR
```
