# Phase 8.0.4 — Database Audit

**Date:** 2026-06-19  
**Mode:** Audit only — no DROP/ALTER executed

---

## Classification Legend

| Class | Description |
|-------|-------------|
| **ETMS CORE** | Ticketing foundation tables |
| **ETMS MODULE** | Phase 7.x additive tables |
| **SHARED** | Platform tables used by both EMS and ETMS |
| **LEGACY EMS** | HR/payroll/collaboration only |

---

## Table Inventory by Domain

### SHARED Platform (~10 tables)

| Table | Source SQL | Indexes | RLS Script | Status |
|-------|-----------|---------|------------|--------|
| `users` | `schema.sql`, `rbac_schema.sql` | `indexes.sql` | partial | **SHARED** |
| `employees` | `schema.sql` | yes | profile RLS | **SHARED** |
| `departments` | `schema.sql` | yes | `enable_departments_rls.sql` | **SHARED** |
| `documents` | `schema.sql` | — | — | **SHARED** |
| `chat_conversations` | `create_chat_notifications_schema.sql` | — | — | **SHARED** |
| `chat_messages` | same | — | — | **SHARED** |
| `notifications` | same | — | — | **SHARED** |

### ETMS CORE (~12 tables)

| Table | Source | Class |
|-------|--------|-------|
| `ticket_categories`, `ticket_subcategories` | `ticketing_phase1.sql` | ETMS CORE |
| `tickets` | same (+ SLA columns) | ETMS CORE |
| `ticket_comments`, `ticket_attachments` | same | ETMS CORE |
| `ticket_activities`, `ticket_assignments`, `ticket_watchers` | same | ETMS CORE |
| `ticket_sla_rules`, `ticket_escalations` | same | ETMS CORE |
| `ticket_assignment_history` | `ticket_assignment_phase7_2.sql` | ETMS MODULE |

### ETMS MODULE Tables (Phase 7.x)

| Phase | Tables | Rollback SQL |
|-------|--------|--------------|
| 7.1 | `ticket_feedback` | yes |
| 7.4 | `ticket_communications`, `ticket_call_logs`, `ticket_email_logs`, `ticket_activity_timeline` | yes |
| 7.5 | `service_catalogs`, `service_catalog_items`, `approval_workflows`, `approval_workflow_steps`, `ticket_approvals`, `approval_history` | yes |
| 7.6 | `knowledge_categories`, `knowledge_articles`, versions, tags, ratings, views, feedback | yes |
| 7.7 | `analytics_snapshots`, `analytics_reports`, `analytics_saved_filters`, `analytics_dashboard_configs` | yes |
| 7.8 | `notification_templates`, `notification_preferences`, `notification_center_events`, `notification_delivery_log` | yes |

### LEGACY EMS — HR (~6 tables)

| Table | Class | ETMS Dependency |
|-------|-------|-----------------|
| `attendance` | LEGACY EMS | None |
| `leave_types`, `leaves` | LEGACY EMS | None |
| `work_items`, `work_comments` | LEGACY EMS | None (legacy task system) |

### LEGACY EMS — Payroll (~80+ tables across files)

Representative groups from `payroll_phase1.sql` through `payroll_phase5.sql`, bulk, treasury, compliance:

- `salary_components`, `salary_structures`, `employee_salary_assignments`
- `payroll_cycles`, `payroll_records`, `payslips`
- `payroll_bulk_uploads`, `payroll_bulk_commitments`
- `payroll_journal_entries`, `payroll_disbursements`, `payroll_erp_exports`
- `employee_tax_profiles`, `investment_declarations`, `employee_pf_profiles`
- `payslip_templates`, `treasury_audit_logs`

**All classified LEGACY EMS** unless Aparna requires payroll in ETMS scope.

### LEGACY EMS — Projects & Collaboration

| Table | Source | Class |
|-------|--------|-------|
| `clients`, `projects`, `project_*` (8 tables) | `create_projects_schema.sql` | LEGACY EMS |
| `meetups`, `calendar_events`, `meetup_audit_logs` | `create_meetups_table.sql` | LEGACY EMS |
| `employee_updates`, `employee_update_feedback`, `employee_update_visibility` | `updates_schema.sql` | LEGACY EMS |

---

## Documented but Missing / Unverified Tables

| Table | Referenced In | Deployed? |
|-------|---------------|-----------|
| `ticket_sla_escalation_events` | 7.7 repository, docs/phase-7.3 | **UNKNOWN** — no SQL in repo |
| `business_units`, `department_business_unit_map` | 7.7 constants fallback | **UNKNOWN** |
| `user_roles` | auth-rbac docs, role-resolution | **UNKNOWN** — may be in Supabase only |

**Action for Phase 8.1:** Run schema inventory against live Supabase before any cleanup.

---

## Index Audit

| Finding | Severity | Details |
|---------|----------|---------|
| Duplicate/overlapping indexes | Medium | Multiple `indexes.sql` + per-migration indexes; needs live `pg_indexes` compare |
| Missing indexes on FK columns | Medium | `ticket_activity_timeline.ticket_id`, high-volume tables — verify in prod |
| Payroll bulk indexes | Low | Defined in bulk phase SQL |
| ETMS 7.x indexes | Good | Each phase migration includes targeted indexes |

**Recommendation:** Export `pg_indexes` and `pg_stat_user_indexes` from Supabase — not available in repo audit.

---

## Constraints & Triggers

| Type | Count (repo) | Notes |
|------|--------------|-------|
| CHECK constraints | Extensive in 7.x migrations | Event types, statuses, formats |
| FK to `employees` | Widespread | **Do not drop employees** |
| Triggers | Not prominently defined in repo SQL | May exist in Supabase dashboard only |
| UNIQUE dedup (7.8) | `notification_center_events` | Good pattern |

---

## Views

| View | Source | Class |
|------|--------|-------|
| Department views | `create_department_view.sql`, `create_department_details_view.sql` | SHARED |

---

## Seeds

| Seed | File | Class |
|------|------|-------|
| Ticket categories | `ticketing_category_seed_and_backfill.sql` | ETMS |
| Dashboard configs | `executive_analytics_phase7_7.sql` | ETMS |
| Notification templates | `notification_center_phase7_8.sql` | ETMS |
| Knowledge categories | `knowledge_base_phase7_6.sql` | ETMS |

---

## Orphan / Unused Table Candidates

*Requires live DB usage stats — repo-only inference:*

| Table | Orphan Risk | Reason |
|-------|-------------|--------|
| `work_items`, `work_comments` | High | Superseded by ticketing? No FE routes found |
| `meetup_audit_logs` | Medium | Low-traffic feature |
| Duplicate payroll tables across phase files | Medium | `employee_salary_config_logs` in 2 SQL files |
| `payroll_notifications` | Medium | Overlaps with platform notifications |

**DO NOT DROP** without production query analysis.

---

## RLS Audit Summary

| Script | Tables | ETMS | EMS |
|--------|--------|------|-----|
| `enable_ticketing_rls.sql` | ticketing | ✓ | — |
| `enable_attendance_rls.sql` | attendance | — | ✓ |
| `enable_departments_rls.sql` | departments | ✓ | ✓ |
| `enable_profile_rls.sql` | profiles | ✓ | ✓ |
| Phase 7.4 tables | communications | **No dedicated RLS script** | Critical gap (per deployment-remediation docs) |
| Backend service role | all | Bypasses RLS | Architectural |

---

## Database Statistics (Estimated)

| Class | Table Count (est.) | % of Total |
|-------|-------------------|------------|
| LEGACY EMS (payroll) | ~80 | ~55% |
| ETMS CORE + MODULE | ~35 | ~24% |
| SHARED | ~10 | ~7% |
| LEGACY EMS (other) | ~20 | ~14% |

**No DROP statements executed. No schema changes made.**
