# Phase 8.0.2 — Legacy EMS Detection Audit

**Date:** 2026-06-19  
**Mode:** Audit only — no deletions or changes

---

## Search Scope

Keywords scanned across `.ts`, `.tsx`, `.js`, `.sql`, `.md`, `.yaml`:

`EMS`, `Employee Management`, `Payroll`, `Attendance`, `Leave`, `Shift`, `Recruitment`, `Performance`, `Appraisal`, `Timesheet`, `Biometric`, `Payroll Reports`, `Employee Salary`, `Legacy Dashboard`, `yviems`, `workforce`

---

## Classification Legend

| Class | Meaning |
|-------|---------|
| **SAFE TO REMOVE** | ETMS does not depend on it; isolated EMS domain |
| **SHARED DEPENDENCY** | ETMS uses this indirectly (auth, employees, departments) |
| **NEEDS MIGRATION** | Data/logic must move or be replaced before removal |
| **DO NOT TOUCH** | Active ETMS dependency or production-critical |

---

## High-Confidence Legacy EMS Artifacts

### Payroll Domain (Entire Subsystem)

| Artifact | Location | Classification | Notes |
|----------|----------|----------------|-------|
| Payroll frontend modules (6) | `frontend/src/modules/payroll*` | **SAFE TO REMOVE** (post-decision) | 30+ routes in App.tsx; no ETMS ticket dependency |
| Payroll backend modules (5) | `backend/src/modules/payroll*` | **SAFE TO REMOVE** | Mounted unconditionally at `/api/payroll` |
| Payroll SQL (15+ files) | `backend/database/payroll_*.sql` | **NEEDS MIGRATION** | ~80+ tables; data retention policy required |
| Payroll nav (40+ items) | `AppLayout.tsx` lines 96–143 | **SAFE TO REMOVE** | Dominates sidebar; ETMS nav is additive spread |
| `Payroll.tsx`, `MyPayslips.tsx` | `frontend/src/pages/` | **SAFE TO REMOVE** | EMS landing/hub pages |

### HR / Workforce Domain

| Artifact | Location | Classification | Notes |
|----------|----------|----------------|-------|
| `Attendance.tsx` + routes | FE + `/api/attendance` | **SAFE TO REMOVE** | Pure EMS |
| `Leaves.tsx` + routes | FE + `/api/leaves` | **SAFE TO REMOVE** | Pure EMS |
| `attendance` table + RLS | `schema.sql`, `enable_attendance_rls.sql` | **NEEDS MIGRATION** | Historical HR data |
| `leaves`, `leave_types` tables | `schema.sql` | **NEEDS MIGRATION** | Historical leave records |
| `LeaveForm.tsx`, `EmployeeForm.tsx` | `frontend/src/components/forms/` | **SHARED DEPENDENCY** | Employee form used for org data ETMS references |

### Projects & Collaboration

| Artifact | Location | Classification | Notes |
|----------|----------|----------------|-------|
| Projects pages + API | `Projects.tsx`, `/api/projects` | **SAFE TO REMOVE** | No ticket integration |
| `create_projects_schema.sql` | 8 project tables | **NEEDS MIGRATION** | Orphan if projects retired |
| Meetups / Calendar | `Meetups.tsx`, `/api/meetups`, `/api/calendar-events` | **SAFE TO REMOVE** | Social/collaboration EMS feature |
| Employee Updates module | `modules/updates/` | **SAFE TO REMOVE** | Standups/weekly updates — EMS culture tool |

### Legacy Analytics

| Artifact | Location | Classification | Notes |
|----------|----------|----------------|-------|
| `backend/analytics/` | `@analytics/analytics.routes` | **SAFE TO REMOVE** | HR/workforce analytics; **conflicts with 7.7** |
| Legacy `/api/analytics` mount | `app.js:153` (always on) | **NEEDS MIGRATION** | Phase 7.7 mounts same prefix when flagged — route collision risk |
| `Reports.tsx` + `/api/reports` | HR insight reports | **SAFE TO REMOVE** | Distinct from ETMS executive analytics |

### Marketing / EMS Branding

| Artifact | Location | Classification | Notes |
|----------|----------|----------------|-------|
| `yviems.netlify.app` CORS origin | `app.js:48` | **SAFE TO REMOVE** | Legacy EMS deployment URL |
| Landing workforce/payroll pages | `/workforce`, `/payroll` public routes | **NEEDS MIGRATION** | Rebrand to ETMS-only marketing |
| `frontend/src/data/mockData.ts` | Mock HR/payroll data | **SAFE TO REMOVE** | Dev artifact |

### Debug / Scratch Artifacts

| Artifact | Location | Classification |
|----------|----------|----------------|
| `scratch_*.js` (root) | 5 files | **SAFE TO REMOVE** |
| `test_employees_api.js` | root | **SAFE TO REMOVE** |
| `security-hardening-backups/` | Dated snapshots | **SAFE TO REMOVE** (after review) |
| `backend/test-status.js`, `verify_admin_login.js` | backend root | **SAFE TO REMOVE** |

---

## Shared Dependencies (DO NOT REMOVE Without ETMS Plan)

| Artifact | Why Shared | ETMS Usage |
|----------|------------|------------|
| `users`, `employees`, `departments` tables | Org structure | Ticket assignee, dept analytics, RBAC |
| `auth.routes.js`, `AuthContext` | Authentication | All ETMS modules |
| `notification.routes.js`, `ChatService` | Realtime bell | Ticketing notifications (parallel to 7.8 center) |
| `socketHandlers.js` | WebSocket | Ticket/notification realtime |
| `AppLayout.tsx` shell | Navigation shell | ETMS routes mounted inside |
| `Dashboard.tsx` | Landing after login | May show mixed EMS/ETMS widgets |
| `documents` table/API | Document vault | Potentially shared file storage |
| `createUser` / admin user management | User provisioning | Ticket creators, approvers |

---

## Phase 7.3 SLA — Documentation vs Code Gap

| Finding | Classification |
|---------|----------------|
| Phase 7.3 SLA Engine documented in `docs/phase-7.3/` | **UNKNOWN / DO NOT TOUCH** |
| No dedicated `sla-management` module in codebase | Gap — SLA logic lives inside `ticketing` module |
| `ticket_sla_rules`, SLA fields on `tickets` table | **DO NOT TOUCH** — ETMS core |
| `ticket_sla_escalation_events` referenced in 7.7 repo | **UNKNOWN** — SQL migration may not be deployed |

**Recommendation:** Treat SLA as **embedded in ticketing**, not a separate removable EMS artifact.

---

## EMS Keyword Hit Summary (Representative)

| Domain | Approx. File Hits | Primary Locations |
|--------|-------------------|-------------------|
| Payroll | 500+ | `modules/payroll*`, `database/payroll_*`, AppLayout nav |
| Attendance/Leave | 200+ | `pages/Attendance`, `pages/Leaves`, controllers |
| Analytics (legacy) | 111+ | `backend/analytics/analytics.service.js` |
| Employee/Workforce | 150+ | `Employees.tsx`, employee routes, forms |
| Recruitment/Performance/Appraisal/Biometric | 0–5 | **Not implemented** — docs/marketing only |
| Timesheet/Shift | Minimal | No dedicated module found |

---

## Removal Readiness Matrix

| Domain | Files (est.) | DB Tables (est.) | ETMS Dependency | Removal Risk |
|--------|-------------|------------------|-----------------|--------------|
| Payroll (all phases) | ~200 | ~80 | None direct | Medium (data) |
| Attendance | ~15 | 2 | None | Low |
| Leaves | ~20 | 2 | None | Low |
| Projects | ~25 | 8 | None | Low |
| Meetups/Calendar | ~15 | 3 | None | Low |
| Employee Updates | ~30 | 3 | None | Low |
| Legacy Analytics | ~10 | 0–4 | **Collision with 7.7** | **High** |
| Employees/Departments | ~40 | 3 | **Critical** | **Do Not Touch** |
| Auth/Chat/Notifications | ~25 | 4 | **Critical** | **Do Not Touch** |

---

## Recommended Isolation Strategy (Phase 8.1+)

1. **Feature-flag payroll/EMS modules** (mirror ETMS pattern) before any removal
2. **Resolve `/api/analytics` dual-mount** — highest technical risk
3. **Extract shared platform** (auth, employees, departments) into explicit `platform/` namespace
4. **Archive payroll SQL** with data export runbook before drop
5. **Rebrand navigation** — ETMS-first sidebar; EMS sections behind `ENABLE_EMS_LEGACY` flag

**No action taken in Phase 8.0.**
