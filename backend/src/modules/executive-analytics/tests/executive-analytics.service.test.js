const test = require('node:test');
const assert = require('node:assert/strict');
const ExecutiveAnalyticsService = require('../services/executive-analytics.service');
const AppError = require('../../../utils/app-error');
const { BUSINESS_UNITS, CLOSED_STATUSES, OPEN_STATUSES } = require('../executive-analytics.constants');

const DEPT_ID = '550e8400-e29b-41d4-a716-446655440001';
const EMP_ID = '550e8400-e29b-41d4-a716-446655440010';
const MGR_ID = '550e8400-e29b-41d4-a716-446655440011';

const sampleTickets = [
  { id: 't1', status: 'OPEN', department_id: DEPT_ID, created_at: '2026-01-15T10:00:00.000Z', sla_resolution_breached: false, sla_resolution_due_at: '2026-01-16T10:00:00.000Z', priority: 'HIGH' },
  { id: 't2', status: 'CLOSED', department_id: DEPT_ID, created_at: '2026-02-01T10:00:00.000Z', closed_at: '2026-02-02T10:00:00.000Z', sla_resolution_breached: false, sla_resolution_due_at: '2026-02-03T10:00:00.000Z', priority: 'MEDIUM' },
  { id: 't3', status: 'ESCALATED', department_id: DEPT_ID, created_at: '2026-03-01T10:00:00.000Z', sla_resolution_breached: true, sla_resolution_due_at: '2026-03-02T10:00:00.000Z', priority: 'CRITICAL' },
];

const sampleFeedback = [
  { ticket_id: 't2', rating: 5, resolution_quality: 5, communication_quality: 4, response_time: 5 },
  { ticket_id: 't1', rating: 3, resolution_quality: 3, communication_quality: 3, response_time: 3 },
];

function mockRepo(overrides = {}) {
  return {
    fetchTickets: async () => overrides.tickets ?? sampleTickets,
    fetchDepartments: async () => overrides.departments ?? [{ id: DEPT_ID, name: 'IT' }],
    fetchFeedback: async () => overrides.feedback ?? sampleFeedback,
    fetchApprovals: async () => overrides.approvals ?? [
      { status: 'APPROVED', started_at: '2026-01-01T10:00:00.000Z', completed_at: '2026-01-02T10:00:00.000Z' },
      { status: 'PENDING', started_at: '2026-02-01T10:00:00.000Z' },
    ],
    fetchEscalations: async () => overrides.escalations ?? [],
    fetchKnowledgeViews: async () => overrides.views ?? [
      { article_id: 'a1', search_query: 'vpn' },
      { article_id: null, search_query: 'unknown' },
    ],
    fetchKnowledgeArticles: async () => [{ id: 'a1', status: 'PUBLISHED' }],
    fetchBusinessUnits: async () => [],
    fetchBuDepartmentMap: async () => [],
    createReport: async (row) => ({ id: 'r1', ...row }),
    listReports: async () => [],
    createSnapshot: async (row) => ({ id: 's1', ...row }),
    getDashboardConfig: async () => null,
    ...overrides.methods,
  };
}

function svc(repo) {
  return new ExecutiveAnalyticsService({ repository: repo });
}

test('constants include business units', () => {
  assert.ok(BUSINESS_UNITS.includes('Aparna Realty'));
  assert.ok(BUSINESS_UNITS.includes('Corporate Services'));
});

test('OPEN and CLOSED statuses defined', () => {
  assert.ok(OPEN_STATUSES.includes('OPEN'));
  assert.ok(CLOSED_STATUSES.includes('CLOSED'));
});

test('employee denied executive dashboard', async () => {
  await assert.rejects(
    () => svc(mockRepo()).getExecutiveDashboard({ role: 'EMPLOYEE', employeeId: EMP_ID }),
    (e) => e instanceof AppError && e.statusCode === 403
  );
});

test('admin gets executive dashboard', async () => {
  const result = await svc(mockRepo()).getExecutiveDashboard({ role: 'ADMIN', employeeId: EMP_ID });
  assert.equal(result.success, true);
  assert.ok(result.data.kpis.openTickets >= 0);
});

test('HR gets executive dashboard', async () => {
  const result = await svc(mockRepo()).getExecutiveDashboard({ role: 'HR', employeeId: EMP_ID });
  assert.equal(result.success, true);
});

test('executive kpis calculate resolution pct', async () => {
  const result = await svc(mockRepo()).getExecutiveDashboard({ role: 'ADMIN', employeeId: EMP_ID });
  assert.equal(typeof result.data.kpis.resolutionPct, 'number');
});

test('executive kpis include csat score', async () => {
  const result = await svc(mockRepo()).getExecutiveDashboard({ role: 'ADMIN', employeeId: EMP_ID });
  assert.ok(result.data.kpis.csatScore > 0);
});

test('executive kpis include sla compliance', async () => {
  const result = await svc(mockRepo()).getExecutiveDashboard({ role: 'ADMIN', employeeId: EMP_ID });
  assert.equal(typeof result.data.kpis.slaCompliancePct, 'number');
});

test('executive kpis include knowledge deflection', async () => {
  const result = await svc(mockRepo()).getExecutiveDashboard({ role: 'ADMIN', employeeId: EMP_ID });
  assert.equal(result.data.kpis.knowledgeDeflectionPct, 50);
});

test('manager gets department dashboard', async () => {
  const result = await svc(mockRepo()).getDepartmentDashboard({ role: 'MANAGER', employeeId: MGR_ID, departmentId: DEPT_ID });
  assert.equal(result.success, true);
  assert.equal(result.data.scorecards.length, 1);
});

test('employee denied department dashboard', async () => {
  await assert.rejects(
    () => svc(mockRepo()).getDepartmentDashboard({ role: 'EMPLOYEE', employeeId: EMP_ID }),
    (e) => e instanceof AppError && e.statusCode === 403
  );
});

test('admin gets all department scorecards', async () => {
  const result = await svc(mockRepo()).getDepartmentDashboard({ role: 'ADMIN', employeeId: EMP_ID });
  assert.ok(result.data.scorecards.length >= 1);
});

test('business unit dashboard for admin', async () => {
  const result = await svc(mockRepo()).getBusinessUnitDashboard({ role: 'ADMIN', employeeId: EMP_ID });
  assert.equal(result.data.scorecards.length, BUSINESS_UNITS.length);
});

test('manager denied business unit dashboard', async () => {
  await assert.rejects(
    () => svc(mockRepo()).getBusinessUnitDashboard({ role: 'MANAGER', employeeId: MGR_ID }),
    (e) => e instanceof AppError && e.statusCode === 403
  );
});

test('sla analytics for manager', async () => {
  const result = await svc(mockRepo()).getSlaAnalytics({ role: 'MANAGER', employeeId: MGR_ID });
  assert.equal(result.success, true);
  assert.ok(result.data.byPriority.length === 4);
});

test('csat analytics for manager', async () => {
  const result = await svc(mockRepo()).getCsatAnalytics({ role: 'MANAGER', employeeId: MGR_ID });
  assert.equal(result.data.totalResponses, 2);
});

test('approval analytics for admin', async () => {
  const result = await svc(mockRepo()).getApprovalAnalytics({ role: 'ADMIN', employeeId: EMP_ID });
  assert.equal(result.data.total, 2);
  assert.equal(result.data.pending, 1);
});

test('knowledge analytics for HR', async () => {
  const result = await svc(mockRepo()).getKnowledgeAnalytics({ role: 'HR', employeeId: EMP_ID });
  assert.equal(result.data.publishedArticles, 1);
});

test('trend analytics returns monthly data', async () => {
  const result = await svc(mockRepo()).getTrendAnalytics({ role: 'MANAGER', employeeId: MGR_ID });
  assert.ok(Array.isArray(result.data.monthly));
});

test('create report stores report', async () => {
  const repo = mockRepo();
  const result = await svc(repo).createReport(
    { role: 'MANAGER', employeeId: MGR_ID },
    { name: 'Trend Report', report_type: 'TREND', format: 'CSV' }
  );
  assert.equal(result.success, true);
  assert.ok(result.data.export.base64);
});

test('create executive report requires enterprise access', async () => {
  await assert.rejects(
    () => svc(mockRepo()).createReport(
      { role: 'MANAGER', employeeId: MGR_ID },
      { name: 'Exec', report_type: 'EXECUTIVE' }
    ),
    (e) => e instanceof AppError && e.statusCode === 403
  );
});

test('list reports requires employee profile', async () => {
  await assert.rejects(
    () => svc(mockRepo()).listReports({ role: 'MANAGER' }),
    (e) => e instanceof AppError && e.statusCode === 403
  );
});

test('workload distribution computed', async () => {
  const result = await svc(mockRepo()).getExecutiveDashboard({ role: 'ADMIN', employeeId: EMP_ID });
  assert.ok(Array.isArray(result.data.kpis.workloadDistribution));
});

test('escalation count includes escalated tickets', async () => {
  const result = await svc(mockRepo()).getExecutiveDashboard({ role: 'ADMIN', employeeId: EMP_ID });
  assert.ok(result.data.kpis.escalationCount >= 1);
});

test('empty tickets returns zero kpis', async () => {
  const result = await svc(mockRepo({ tickets: [], feedback: [] })).getExecutiveDashboard({ role: 'ADMIN', employeeId: EMP_ID });
  assert.equal(result.data.kpis.totalTickets, 0);
});

test('super admin full access', async () => {
  const result = await svc(mockRepo()).getExecutiveDashboard({ role: 'SUPER_ADMIN', employeeId: EMP_ID });
  assert.equal(result.success, true);
});

test('finance role denied enterprise', async () => {
  await assert.rejects(
    () => svc(mockRepo()).getExecutiveDashboard({ role: 'FINANCE', employeeId: EMP_ID }),
    (e) => e instanceof AppError && e.statusCode === 403
  );
});

test('capture snapshot creates record', async () => {
  const result = await svc(mockRepo()).captureSnapshot(
    { role: 'ADMIN', employeeId: EMP_ID },
    'EXECUTIVE',
    'global',
    { kpis: {} }
  );
  assert.equal(result.data.snapshot_type, 'EXECUTIVE');
});

test('department scorecard includes metrics', async () => {
  const result = await svc(mockRepo()).getDepartmentDashboard({ role: 'ADMIN', employeeId: EMP_ID });
  assert.ok(result.data.scorecards[0].metrics.slaCompliancePct >= 0);
});

test('approval turnaround calculated', async () => {
  const result = await svc(mockRepo()).getExecutiveDashboard({ role: 'ADMIN', employeeId: EMP_ID });
  assert.ok(result.data.kpis.approvalTurnaroundHours > 0);
});

test('create PDF report', async () => {
  const result = await svc(mockRepo()).createReport(
    { role: 'MANAGER', employeeId: MGR_ID },
    { name: 'PDF', report_type: 'TREND', format: 'PDF' }
  );
  assert.equal(result.data.export.extension, 'pdf');
});

test('create XLSX report', async () => {
  const result = await svc(mockRepo()).createReport(
    { role: 'MANAGER', employeeId: MGR_ID },
    { name: 'XLSX', report_type: 'TREND', format: 'XLSX' }
  );
  assert.equal(result.data.export.extension, 'xlsx');
});

test('employee denied csat', async () => {
  await assert.rejects(
    () => svc(mockRepo()).getCsatAnalytics({ role: 'EMPLOYEE', employeeId: EMP_ID }),
    (e) => e instanceof AppError && e.statusCode === 403
  );
});

test('employee denied approval analytics', async () => {
  await assert.rejects(
    () => svc(mockRepo()).getApprovalAnalytics({ role: 'EMPLOYEE', employeeId: EMP_ID }),
    (e) => e instanceof AppError && e.statusCode === 403
  );
});

test('knowledge deflection zero when no searches', async () => {
  const result = await svc(mockRepo({ views: [] })).getExecutiveDashboard({ role: 'ADMIN', employeeId: EMP_ID });
  assert.equal(result.data.kpis.knowledgeDeflectionPct, 0);
});

test('average resolution hours calculated', async () => {
  const result = await svc(mockRepo()).getExecutiveDashboard({ role: 'ADMIN', employeeId: EMP_ID });
  assert.ok(result.data.kpis.averageResolutionHours >= 0);
});
