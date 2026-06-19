# Phase 8.0.1 — Repository Inventory

**Date:** 2026-06-19  
**Mode:** Audit only — no changes made  
**Repository:** `/Users/maninaidu/Documents/GitHub/Ticketing_Tool`

---

## Executive Summary

The repository is a **monorepo** containing a Vite/React frontend and Node/Express backend deployed via **Netlify + Render + Supabase**. It currently hosts **two product domains**:

1. **ETMS** — Enterprise Ticketing (Phase 7.1–7.8, feature-flagged)
2. **Legacy EMS** — HR, payroll, attendance, leaves, projects, updates, meetups

Shared platform services (auth, RBAC, employees, departments, chat, notifications) underpin both domains.

---

## Top-Level Structure

| Path | Purpose | Module Owner | ETMS? | EMS? | Status |
|------|---------|--------------|-------|------|--------|
| `frontend/` | React SPA (Vite, TypeScript) | Platform | ✓ | ✓ | **SHARED** |
| `backend/` | Express API, Supabase admin | Platform | ✓ | ✓ | **SHARED** |
| `backend/database/` | SQL migrations (56 files) | Platform | ✓ | ✓ | **SHARED** |
| `docs/` | Phase docs, audits, architecture | Platform | ✓ | ✓ | **ACTIVE** |
| `docs/phase-7.*` | ETMS phase implementation docs | ETMS | ✓ | — | **ACTIVE** |
| `docs/deployment-remediation/` | Production readiness plans | Platform | ✓ | ✓ | **ACTIVE** |
| `render.yaml` | Backend deploy blueprint | Platform | ✓ | ✓ | **ACTIVE** |
| `frontend/netlify.toml` | Frontend deploy config | Platform | ✓ | ✓ | **ACTIVE** |
| `backend/docker-compose.yml` | Local Redis for Socket.IO | Platform | ✓ | ✓ | **ACTIVE** |
| `security-hardening-backups/` | Dated code snapshots | Platform | — | — | **LEGACY** |
| `scratch_*.js`, `test_*.js` (root) | Ad-hoc DB/API debug scripts | Dev | — | — | **LEGACY** |
| `.kiro/` | Landing page redesign specs | Marketing | — | — | **UNKNOWN** |
| `.github/workflows/` | CI/CD | — | — | — | **MISSING** |

---

## Frontend Inventory

### Core Application Shell

| Path | Purpose | Owner | ETMS | EMS | Status |
|------|---------|-------|------|-----|--------|
| `frontend/src/App.tsx` | Router, all route mounts | Platform | ✓ | ✓ | **SHARED** |
| `frontend/src/config/features.ts` | ETMS feature flags (7.1–7.8) | ETMS | ✓ | — | **ACTIVE** |
| `frontend/src/components/layout/AppLayout.tsx` | Sidebar, nav, header | Platform | ✓ | ✓ | **SHARED** |
| `frontend/src/contexts/AuthContext.tsx` | Auth state | Platform | ✓ | ✓ | **SHARED** |
| `frontend/src/components/common/NotificationBell.tsx` | Legacy notification bell | Platform | ✓ | ✓ | **SHARED** |
| `frontend/src/services/api.ts` | HTTP client | Platform | ✓ | ✓ | **SHARED** |
| `frontend/src/services/notificationService.ts` | Socket.io client | Platform | ✓ | ✓ | **SHARED** |

### Pages (`frontend/src/pages/`)

| File | Purpose | ETMS | EMS | Status |
|------|---------|------|-----|--------|
| `Dashboard.tsx` | Command dashboard | ✓ | ✓ | **SHARED** |
| `Landing.tsx`, marketing pages | Public marketing | ✓ | ✓ | **ACTIVE** |
| `Login.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx` | Auth | ✓ | ✓ | **SHARED** |
| `Employees.tsx`, `Departments.tsx` | Org directory | ✓ | ✓ | **SHARED** |
| `Attendance.tsx` | Presence logs | — | ✓ | **LEGACY EMS** |
| `Leaves.tsx` | Leave management | — | ✓ | **LEGACY EMS** |
| `Payroll.tsx`, `MyPayslips.tsx` | Payroll hub / payslips | — | ✓ | **LEGACY EMS** |
| `Documents.tsx`, `Reports.tsx` | Document vault / HR reports | — | ✓ | **LEGACY EMS** |
| `Calendar.tsx`, `Meetups.tsx` | Calendar / meetups | — | ✓ | **LEGACY EMS** |
| `Projects.tsx`, `MyProjects.tsx`, `ProjectDetail.tsx` | Project management | — | ✓ | **LEGACY EMS** |
| `AdminUsers.tsx` | User admin | ✓ | ✓ | **SHARED** |
| `Profile.tsx` | User profile | ✓ | ✓ | **SHARED** |

### Frontend Modules (`frontend/src/modules/`)

| Module | Purpose | ETMS | EMS | Status |
|--------|---------|------|-----|--------|
| `ticketing/` | Core ticket CRUD, SLA UI, detail | ✓ | — | **ACTIVE** |
| `ticket-feedback/` | CSAT feedback (7.1) | ✓ | — | **ACTIVE** |
| `ticket-assignment/` | Work queues (7.2) | ✓ | — | **ACTIVE** |
| `communication-tracking/` | Comms timeline (7.4) | ✓ | — | **ACTIVE** |
| `approval-management/` | Approval engine (7.5) | ✓ | — | **ACTIVE** |
| `knowledge-management/` | Knowledge base (7.6) | ✓ | — | **ACTIVE** |
| `executive-analytics/` | Executive BI (7.7) | ✓ | — | **ACTIVE** |
| `notification-center/` | Alert center (7.8) | ✓ | — | **ACTIVE** |
| `payroll/` | Payroll cycles, components, settings | — | ✓ | **LEGACY EMS** |
| `payroll-bulk-processing/` | Bulk Excel ingest | — | ✓ | **LEGACY EMS** |
| `payroll-analytics/` | Workforce/payroll analytics | — | ✓ | **LEGACY EMS** |
| `payroll-compliance/` | PF, tax, statutory | — | ✓ | **LEGACY EMS** |
| `payroll-finance/` | Journals, disbursements, ERP | — | ✓ | **LEGACY EMS** |
| `payroll-treasury/` | Treasury governance | — | ✓ | **LEGACY EMS** |
| `updates/` | Employee daily/weekly updates | — | ✓ | **LEGACY EMS** |

### Frontend Tests

| Location | Count (approx) | Status |
|----------|----------------|--------|
| `frontend/src/modules/*/tests/` | 73 files | **ACTIVE** (ETMS-heavy) |
| `frontend/src/pages/__tests__/` | 1 | **WEAK** |
| `frontend/e2e/ticketing/` | 3 specs | **ACTIVE** (ETMS) |
| Payroll/updates modules | 0 | **GAP** |

### Frontend Config / Build

| File | Purpose | Status |
|------|---------|--------|
| `frontend/package.json` | Scripts: dev, build, test, e2e | **ACTIVE** |
| `frontend/vite.config.ts` | Dev :8081, Vitest | **ACTIVE** |
| `frontend/netlify.toml` | SPA deploy, headers | **ACTIVE** |
| `frontend/.env.example` | VITE_ENABLE_* flags | **ACTIVE** |

---

## Backend Inventory

### Legacy Routes (`backend/src/routes/`)

| Route File | Mount | ETMS | EMS | Status |
|------------|-------|------|-----|--------|
| `auth.routes.js` | `/api/auth` | ✓ | ✓ | **SHARED** |
| `employee.routes.js` | `/api/employees` | ✓ | ✓ | **SHARED** |
| `department.routes.js` | `/api/departments` | ✓ | ✓ | **SHARED** |
| `attendance.routes.js` | `/api/attendance` | — | ✓ | **LEGACY EMS** |
| `leave.routes.js` | `/api/leaves` | — | ✓ | **LEGACY EMS** |
| `document.routes.js` | `/api/documents` | — | ✓ | **LEGACY EMS** |
| `report.routes.js` | `/api/reports` | — | ✓ | **LEGACY EMS** |
| `project.routes.js` | `/api/projects` | — | ✓ | **LEGACY EMS** |
| `chat.routes.js` | `/api/chat` | ✓ | ✓ | **SHARED** |
| `notification.routes.js` | `/api/notifications` | ✓ | ✓ | **SHARED** |
| `meetup.routes.js` | `/api/meetups` | — | ✓ | **LEGACY EMS** |
| `calendar.routes.js` | `/api/calendar-events` | — | ✓ | **LEGACY EMS** |
| `health.routes.js` | `/health` | ✓ | ✓ | **ACTIVE** |

### Backend Modules (`backend/src/modules/`)

| Module | API Prefix | ETMS | EMS | Status |
|--------|-----------|------|-----|--------|
| `ticketing/` | `/api/tickets`, `/api/ticket-categories` | ✓ | — | **ACTIVE** |
| `ticket-feedback/` | `/api/ticket-feedback` | ✓ | — | **ACTIVE** |
| `ticket-assignment/` | `/api/ticket-assignments` | ✓ | — | **ACTIVE** |
| `communication-tracking/` | `/api/communications` | ✓ | — | **ACTIVE** |
| `approval-management/` | `/api/approvals` | ✓ | — | **ACTIVE** |
| `knowledge-management/` | `/api/knowledge` | ✓ | — | **ACTIVE** |
| `executive-analytics/` | `/api/analytics` (flagged) | ✓ | — | **ACTIVE** |
| `notification-center/` | `/api/notification-center` | ✓ | — | **ACTIVE** |
| `updates/` | `/api/updates` | — | ✓ | **LEGACY EMS** |
| `payroll/` | `/api/payroll` | — | ✓ | **LEGACY EMS** |
| `payroll-bulk-processing/` | `/api/payroll-bulk`, payslips | — | ✓ | **LEGACY EMS** |
| `payroll-analytics/` | (via payroll) | — | ✓ | **LEGACY EMS** |
| `payroll-compliance/` | (via payroll) | — | ✓ | **LEGACY EMS** |
| `payroll-treasury/` | (via payroll) | — | ✓ | **LEGACY EMS** |

### Legacy Non-Module Backend

| Path | Purpose | ETMS | EMS | Status |
|------|---------|------|-----|--------|
| `backend/analytics/` | Legacy HR analytics routes | — | ✓ | **LEGACY EMS** |
| `backend/src/controllers/` | attendance, leave, employee, report, notification | ✓ | ✓ | **SHARED/LEGACY** |
| `backend/src/socketHandlers.js` | Realtime notifications/chat | ✓ | ✓ | **SHARED** |
| `backend/src/middlewares/auth.middleware.js` | JWT/Supabase auth | ✓ | ✓ | **SHARED** |

### Backend Tests

| Location | Count | Status |
|----------|-------|--------|
| `backend/src/modules/*/tests/` | 40 files | **ACTIVE** |
| `backend/src/tests/auth-rbac-hardening.test.js` | 1 | **ACTIVE** |
| `backend/security-hardening.test.js` | 1 | **ACTIVE** |
| Full regression (manual) | 504 pass | **ACTIVE** |
| `npm test` script | Only security-hardening | **GAP** |

---

## Database Inventory (`backend/database/`)

| Category | Files | ETMS | EMS | Status |
|----------|-------|------|-----|--------|
| Core schema | `schema.sql`, `fixed_schema.sql`, `rbac_schema.sql` | ✓ | ✓ | **SHARED** |
| Ticketing | `ticketing_phase1.sql` + 7.x migrations | ✓ | — | **ACTIVE** |
| Payroll | `payroll_phase1–5`, bulk, treasury, compliance | — | ✓ | **LEGACY EMS** |
| Projects | `create_projects_schema.sql` | — | ✓ | **LEGACY EMS** |
| Updates | `updates_schema.sql` | — | ✓ | **LEGACY EMS** |
| Chat/notifications | `create_chat_notifications_schema.sql` | ✓ | ✓ | **SHARED** |
| RLS scripts | `enable_*_rls.sql` | ✓ | ✓ | **SHARED** |

---

## Documentation Inventory

| Path | Purpose | Status |
|------|---------|--------|
| `docs/phase-7.1` – `7.8` | ETMS phase docs | **ACTIVE** |
| `docs/auth-rbac/` | Security hardening audits | **ACTIVE** |
| `docs/deployment-remediation/` | Deploy/perf/security plans | **ACTIVE** |
| `docs/system-architecture/` | Architecture overview | **ACTIVE** |
| `docs/django-migration/` | Future migration plan | **UNKNOWN** |
| `frontend/docs/` | Frontend setup, phase summaries | **MIXED** |

---

## Scripts & Root Artifacts

| File | Purpose | Status |
|------|---------|--------|
| `scratch_check_schema.js` | DB schema debug | **LEGACY** |
| `scratch_test_preview.js` | Payroll preview debug | **LEGACY EMS** |
| `scratch_debug_data.js` | Data debug | **LEGACY** |
| `test_employees_api.js` | Employee API test | **LEGACY** |
| `backend/verify_admin_login.js` | Admin login verify | **LEGACY** |
| `backend/fix_rls_policies.js` | RLS fix utility | **LEGACY** |

---

## Build Pipelines

| Pipeline | Present | Status |
|----------|---------|--------|
| GitHub Actions / CI | No | **MISSING** |
| Render (backend) | Yes (`render.yaml`) | **ACTIVE** |
| Netlify (frontend) | Yes (`netlify.toml`) | **ACTIVE** |
| Docker (production) | No (Redis only locally) | **PARTIAL** |
| Playwright E2E | Configured, not in CI | **PARTIAL** |

---

## Inventory Statistics

| Metric | Count |
|--------|-------|
| Frontend modules | 15 |
| ETMS modules (FE) | 8 |
| EMS modules (FE) | 7 |
| Backend modules | 14 |
| ETMS modules (BE) | 8 |
| EMS modules (BE) | 6 |
| SQL migration files | 56 |
| Legacy route files | 13 |
| Frontend test files | ~74 |
| Backend test files | ~42 |
