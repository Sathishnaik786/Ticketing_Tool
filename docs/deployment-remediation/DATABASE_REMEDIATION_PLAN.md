# Database Remediation Plan

**Project:** Enterprise Ticketing Management System  
**Mode:** Plan Only — No SQL Executed  
**Date:** 2026-06-18

---

## Migration Inventory

| File | Phase | Tables | RLS Script | Rollback |
|------|-------|--------|------------|----------|
| `ticketing_phase1.sql` | Core ticketing | tickets, comments, attachments, activities, assignments, watchers, SLA, escalations | `enable_ticketing_rls.sql` | `ticketing_phase1_rollback.sql` |
| `ticket_feedback_phase7_1.sql` | 7.1 CSAT | ticket_feedback | Unknown in repo | `ticket_feedback_phase7_1_rollback.sql` |
| `ticket_assignment_phase7_2.sql` | 7.2 Queues | assignment/queue tables | Unknown in repo | `ticket_assignment_phase7_2_rollback.sql` |
| `ticket_communication_phase7_4.sql` | 7.4 Comms | communications, call_logs, email_logs, activity_timeline | **MISSING** | `ticket_communication_phase7_4_rollback.sql` |
| Phase 7.3 SLA | Documented | Referenced in docs | **NOT IN REPO** | Referenced in `docs/phase-7.3/ROLLBACK_PLAN.md` |
| `schema.sql` | Legacy EMS | Core + **dangerous public policies** | Inline | No dedicated rollback |
| `fixed_schema.sql` | Alternative EMS | users.role, employees | No | No |
| `indexes.sql` | Performance | Core EMS indexes | N/A | Drop index statements |
| `enable_ticketing_rls.sql` | Ticketing RLS | Phase 1 tables | Yes | In phase1 rollback |

---

## Schema Quality Assessment

### Ticketing Phase 1 — STRONG

**Evidence:** `backend/database/ticketing_phase1.sql`

- UUID PKs, FK constraints with appropriate ON DELETE behavior
- CHECK constraints on status, priority, activity_type
- Comprehensive indexes (status, priority, department, requester, assignee, SLA due dates)
- Audit columns (`created_at`, `updated_at`) with triggers
- Unique constraints on ticket_number, watcher pairs, SLA scope

**Gaps:**
- No soft delete (`deleted_at`)
- No `tenant_id` for multi-org

### Phase 7.1 / 7.2 — PARTIAL DOCUMENTATION

Rollback SQL exists; RLS enable scripts **not found** in `backend/database/` for feedback or assignment phases. Verify live Supabase state before assuming RLS applied.

### Phase 7.4 — INDEXES ONLY, NO RLS

**Evidence:** `ticket_communication_phase7_4.sql`

Tables created:
- `ticket_communications`
- `ticket_call_logs`
- `ticket_email_logs`
- `ticket_activity_timeline`

Indexes present and appropriate for ticket-scoped queries.

**Critical gap:** No `ENABLE ROW LEVEL SECURITY`, no policies, no GRANT statements.

### Phase 7.3 — DOCUMENTATION ONLY

**Evidence:** `docs/phase-7.3/ROLLBACK_PLAN.md` references `ticket_sla_phase7_3_rollback.sql` but file **not present** in `backend/database/`. No `sla-management` module in codebase. Basic SLA logic exists in `backend/src/modules/ticketing/services/sla.service.js` (Phase 1 level).

---

## Open Policies Review

### CRITICAL — Legacy schema.sql Public Policies

**File:** `backend/database/schema.sql:148-235`

| Table | Policy | Risk |
|-------|--------|------|
| auth_users | public SELECT/INSERT/UPDATE | Critical |
| roles | public SELECT | High |
| permissions | public SELECT | High |
| role_permissions | public SELECT | High |
| user_roles | public SELECT/INSERT | **Critical** |
| audit_logs | public SELECT/INSERT | Critical |
| database_connections | public CRUD | Critical |

**Action:** Run read-only audit on production:

```sql
-- REVIEW ONLY — do not execute without approval
SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Remediation:** New additive script `security/rls_production_hardening.sql` — DROP public policies, CREATE authenticated/service-role policies.

**Rollback:** Export current policies before change (`pg_policies` dump).

---

## Missing Policies

| Object | Status | Remediation |
|--------|--------|-------------|
| ticket_communications | Missing | Create `enable_communication_tracking_rls.sql` |
| ticket_call_logs | Missing | Same script |
| ticket_email_logs | Missing | Same script |
| ticket_activity_timeline | Missing | Same script |
| ticket_feedback tables | Unknown | Audit live DB; add script if missing |
| ticket_assignment tables | Unknown | Audit live DB; add script if missing |

---

## Conflicting Policies

| Conflict | Details |
|----------|---------|
| RLS role source vs API role source | `ticketing_get_employee_role()` reads `employees.role`; API reads `user_roles` — users may see different data via direct Supabase vs API |
| schema.sql vs enable_ticketing_rls.sql | Different policy models — **never apply both blindly** |
| Public policies vs ticketing RLS | If public policies exist on shared tables, ticketing RLS may be insufficient for RBAC tables |

---

## Recursion Risks

**Evidence:**
- `backend/fix_rls_policies.js` — addresses infinite recursion on employees
- `backend/database/fix_infinite_recursion.sql`
- `employees.manager_id` self-reference
- `enable_ticketing_rls.sql` uses SECURITY DEFINER functions specifically to avoid recursion — **good pattern**

**Remediation for user_roles-based RLS:**
- Follow same SECURITY DEFINER helper pattern
- Never policy-query `employees` recursively from `employees` policy

---

## Performance Risks

| Risk | Table | Mitigation |
|------|-------|------------|
| Timeline unbounded growth | ticket_activities, ticket_activity_timeline | Partition by month; archival job (future) |
| Ticket list full scan | tickets | Existing indexes adequate to ~100K rows |
| Missing composite index | tickets (department_id, status, created_at) | Add if list query uses all three — verify EXPLAIN first |
| N+1 in list endpoints | tickets + joins | Repository batch queries; review in performance wave |
| user_roles JOIN on every auth | user_roles | Index on `user_id` — verify exists in live DB |

**indexes.sql** covers core EMS; ticketing indexes in phase1 SQL — adequate for initial scale.

---

## Data Integrity Risks

| Risk | Severity | Notes |
|------|----------|-------|
| createUser without user_roles | Critical | Users default to EMPLOYEE at login |
| No soft delete | Medium | Hard deletes lose audit trail |
| ticket_number_seq global | Low | Acceptable for single org |
| FK ON DELETE RESTRICT on requester | Low | Correct for audit |

---

## Recommended SQL Artifacts (To Create — Not Yet)

1. `backend/database/security/audit_live_policies.sql` — read-only diagnostic queries
2. `backend/database/enable_communication_tracking_rls.sql` — Phase 7.4 RLS
3. `backend/database/security/rls_production_hardening.sql` — revoke public policies
4. `backend/database/rbac/backfill_user_roles.sql` — data sync
5. `backend/database/rbac/create_roles_permissions_ddl.sql` — if DDL missing from repo
6. `backend/database/security/rls_production_hardening_rollback.sql`

---

## Apply Order (Staging Only — Future)

1. Audit live policies (read-only)
2. Apply missing DDL for roles/user_roles if absent
3. Backfill user_roles data
4. Apply Phase 7.4 RLS (before enabling communication feature flag)
5. Apply production hardening (revoke public policies)
6. Update RLS helper functions for user_roles authority
7. Enable feature flags

**Never in production without:** staging verification, rollback scripts tested, backup confirmed.

---

## Rollback Strategy

| Level | Action |
|-------|--------|
| L1 | Disable feature flags (no DB change) — see phase rollback plans |
| L2 | Run phase-specific rollback SQL (drops tables — staging only) |
| L3 | Restore policy snapshot from pre-migration export |
| L4 | Supabase point-in-time recovery (platform level) |

Existing rollback files:
- `ticketing_phase1_rollback.sql`
- `ticket_feedback_phase7_1_rollback.sql`
- `ticket_assignment_phase7_2_rollback.sql`
- `ticket_communication_phase7_4_rollback.sql`

---

## Database Health Score (Post-Remediation Target)

| Area | Current | Target |
|------|---------|--------|
| Schema design | 85/100 | 90 |
| RLS coverage | 45/100 | 90 |
| Index coverage | 80/100 | 85 |
| Migration discipline | 40/100 | 80 |
| Data integrity | 60/100 | 90 |

---

*No SQL executed. All scripts require review and staging validation before apply.*
