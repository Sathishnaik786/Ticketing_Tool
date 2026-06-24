# 16 — Migration Strategy
# Phase 5.0: Enterprise Service Management Platform

---

## 1. Principles

1. **Zero breaking changes** — All existing routes, APIs, feature flags, and data remain functional
2. **Additive-only migrations** — No existing table is modified; only new tables added
3. **Feature-flagged rollout** — Every Phase 5 module is off by default until validated
4. **Reversible** — Each migration can be rolled back by disabling the feature flag
5. **Incremental** — Four phased sub-releases (5.0 → 5.3) with production verification gates

---

## 2. Database Migration Plan

### Migration Files (Supabase SQL Migrations)

```
supabase/migrations/
├── 20240101000001_phase0_foundation.sql          ← Existing
├── 20240201000001_phase1_etms_nav.sql            ← Existing
├── 20240301000001_phase2_dashboard.sql           ← Existing
├── 20240401000001_phase3_tickets.sql             ← Existing
├── 20240501000001_phase4_realtime.sql            ← Existing
│
├── 20260701000001_phase5_workflow_engine.sql     ← NEW (Phase 5.0)
├── 20260701000002_phase5_sla_engine.sql          ← NEW (Phase 5.0)
├── 20260701000003_phase5_audit_log.sql           ← NEW (Phase 5.0)
├── 20260801000001_phase5_service_catalog.sql     ← NEW (Phase 5.1)
├── 20260801000002_phase5_automation_engine.sql   ← NEW (Phase 5.1)
├── 20260901000001_phase5_executive_intel.sql     ← NEW (Phase 5.2)
├── 20261001000001_phase5_ai_copilot.sql          ← NEW (Phase 5.3)
└── 20261001000002_phase5_pgvector.sql            ← NEW (Phase 5.3)
```

### Pre-Migration Validation Checklist

```bash
# Before running any Phase 5 migration:
□ Take full Supabase database backup (snapshot)
□ Verify migration is additive only (no ALTER TABLE on existing tables)
□ Run migration on staging environment first
□ Verify all existing tests pass on staging post-migration
□ Get DBA sign-off
□ Schedule maintenance window (low-traffic period)
```

---

## 3. Phase 5.0 — Foundation (Weeks 1–8)

### Scope
- Workflow Engine (builder + execution)
- SLA Enforcement Engine (policies + cron)
- Audit & Compliance Framework
- BullMQ + Redis infrastructure

### Deliverables
- `05_workflow_engine.sql` migration
- `06_sla_engine.sql` migration
- `07_audit_log.sql` migration
- Backend modules: `workflow-engine`, `sla-engine`, `audit-compliance`
- Frontend modules: `WorkflowListPage`, `WorkflowBuilderPage`, `SlaPolicyListPage`
- Redis infrastructure provisioned
- BullMQ workers running

### Verification Gate (End of Phase 5.0)
```
□ Workflow builder can create and publish a 3-step approval workflow
□ Creating a P1 ticket auto-applies SLA policy
□ SLA monitor cron detects breach within 2 minutes
□ Workflow approval email notification delivered
□ Audit log records all workflow + SLA events
□ All Phase 0–4 tests pass
□ No performance regression on existing ticket list (< 10% slowdown)
```

---

## 4. Phase 5.1 — Self-Service & Automation (Weeks 9–16)

### Scope
- Service Catalog (categories, items, forms, requests)
- Automation Rules Engine (builder + BullMQ processor)

### Deliverables
- `08_service_catalog.sql` migration
- `09_automation_engine.sql` migration
- Backend modules: `service-catalog`, `automation-engine`
- Frontend modules: `CatalogHomePage`, `ServiceRequestPage`, `RuleBuilderPage`
- 10 sample catalog items (pre-seeded)
- 5 starter automation rules (pre-seeded)

### Verification Gate (End of Phase 5.1)
```
□ Employee can browse catalog and submit a laptop request
□ Laptop request auto-starts configured workflow
□ Critical ticket auto-assigns to network team via automation rule
□ Automation rule test mode works against sample tickets
□ Service request triggers correct SLA assignment
□ No circular automation loops in test scenarios
```

---

## 5. Phase 5.2 — Intelligence (Weeks 17–22)

### Scope
- Executive Intelligence Platform (4 dashboards)
- Intelligence snapshot aggregation (daily cron)
- Report generation service

### Deliverables
- `10_executive_intel.sql` migration
- Backend module: `executive-intelligence`
- Frontend: `ExecutiveCommandPage`, `ServiceHealthPage`, `CapacityPlanningPage`
- Daily snapshot cron running
- PDF report generation working

### Verification Gate (End of Phase 5.2)
```
□ Executive Command page loads KPI scorecard in < 2s
□ SLA analytics shows correct breach count for test period
□ Department performance table ranks departments correctly
□ Weekly email report generated and delivered
□ Forecast shows correct 7-day projection based on test data
```

---

## 6. Phase 5.3 — AI Copilot (Weeks 23–31)

### Scope
- AI Copilot (production LLM integration)
- RAG knowledge base indexing (pgvector)
- AI feedback loop

### Pre-Requisites
- LLM provider contract signed (Vertex AI / OpenAI)
- API keys provisioned and secured
- Budget limits configured
- pgvector extension enabled on Supabase

### Deliverables
- `11_ai_copilot.sql` migration
- `12_pgvector.sql` migration (adds `vector` extension)
- Backend module: `ai-copilot`
- Knowledge base embedding pipeline (one-time batch index run)
- Frontend: `AiAssistPanel` (real API, not mock)
- AI feedback buttons wired to backend

### Verification Gate (End of Phase 5.3)
```
□ Ticket summary generated in < 3s via real LLM
□ Knowledge base suggestions return relevant articles
□ Duplicate detection identifies similar tickets with > 0.85 similarity
□ AI feedback (accept/reject) is persisted
□ PII scrubbing removes email addresses from prompts
□ AI cost per day stays under configured budget limit
□ Fallback to secondary provider works when primary is unavailable
```

---

## 7. Rollback Strategy

### Feature Flag Rollback
If a Phase 5 module causes issues in production:
1. Set `VITE_ENABLE_<MODULE>=false` and `ENABLE_<MODULE>=false`
2. Redeploy frontend + backend (no DB change needed)
3. Module is invisible to users within 1 deployment cycle
4. No data loss — all records preserved for future re-enable

### Database Rollback
All Phase 5 migrations are additive. If rollback is needed:
```sql
-- Safe rollback: drop new tables only (existing tables unaffected)
DROP TABLE IF EXISTS workflow_step_executions CASCADE;
DROP TABLE IF EXISTS workflow_executions CASCADE;
DROP TABLE IF EXISTS workflow_conditions CASCADE;
DROP TABLE IF EXISTS workflow_steps CASCADE;
DROP TABLE IF EXISTS workflow_versions CASCADE;
DROP TABLE IF EXISTS workflows CASCADE;
-- etc. per phase
```

> **Note:** Rollback only if feature flag rollback is insufficient. Data will be lost.

---

## 8. Dependency Graph

```
Phase 5.0 (Workflow + SLA + Audit)
  │
  └─ No dependencies on Phase 5.1–5.3

Phase 5.1 (Catalog + Automation)
  │
  ├─ Depends on Phase 5.0: workflow_executions (catalog uses workflows)
  └─ Depends on Phase 5.0: sla_assignments (catalog uses SLA)

Phase 5.2 (Intelligence)
  │
  └─ Depends on Phase 5.0 SLA + Phase 5.1 Catalog (snapshots aggregate all)

Phase 5.3 (AI Copilot)
  │
  └─ Depends on Phase 5.1 Knowledge Base (RAG indexing)
```

---

## 9. Data Seeding Plan

### Phase 5.0 Seeds
```sql
-- Default SLA policy (P1–P4 targets)
INSERT INTO sla_policies (tenant_id, name, is_default, ...) VALUES (...);
INSERT INTO sla_targets (policy_id, priority, response_minutes, resolution_minutes) VALUES
  (policy_id, 'P1', 30, 240),
  (policy_id, 'P2', 60, 480),
  (policy_id, 'P3', 240, 1440),
  (policy_id, 'P4', 480, 4320);
```

### Phase 5.1 Seeds
```sql
-- Sample catalog categories
INSERT INTO catalog_categories (name, icon) VALUES
  ('IT Access', 'Key'),
  ('IT Hardware', 'Monitor'),
  ('IT Software', 'Code'),
  ('HR Services', 'Users'),
  ('Facilities', 'Building');

-- 5 starter automation rules (inactive by default)
-- Rule: Auto-assign critical tickets
-- Rule: Auto-close password resets
-- Rule: Escalate aged tickets
-- Rule: Notify on P1 creation
-- Rule: Auto-tag security tickets
```
