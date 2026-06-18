# Deployment Audit Validation Report

**Project:** Enterprise Ticketing Management System  
**Mode:** Safe Remediation — Phase 1 Verification Only  
**Date:** 2026-06-18  
**Status:** No code or SQL executed

---

## Purpose

Validate each finding from the initial deployment readiness audit against current repository evidence.  
Each item includes verification status, evidence, and confirmed risk level.

**Legend**

| Status | Meaning |
|--------|---------|
| VERIFIED | Confirmed in codebase with direct evidence |
| PARTIALLY VERIFIED | Condition exists but scope/severity differs from audit |
| NOT VERIFIED | Audit claim not supported or overstated |

---

## Critical Findings Validation

### C-01 — Core ticketing modules disabled by default

| Field | Value |
|-------|-------|
| **Status** | VERIFIED |
| **Risk** | Critical |
| **Evidence** | `backend/.env.example:24` (`ENABLE_TICKETING=false`); `frontend/.env.example:18` (`VITE_ENABLE_TICKETING=false`); `backend/src/app.js:178-182` (conditional mount); `frontend/src/config/features.ts:1-2` |
| **Notes** | Same pattern for feedback, assignments, communication tracking flags |

---

### C-02 — Legacy open/public RLS policies in schema SQL

| Field | Value |
|-------|-------|
| **Status** | VERIFIED (in repo SQL file) |
| **Risk** | Critical *if applied to production* |
| **Evidence** | `backend/database/schema.sql:148-235` — policies `TO public` with `USING (true)` on `auth_users`, `roles`, `permissions`, `role_permissions`, `user_roles`, `audit_logs`, `database_connections` |
| **Notes** | Cannot verify live Supabase state from repo alone. Treat as **conditional critical** until production policy audit is run |

---

### C-03 — Phase 7.4 communication tables lack RLS migration

| Field | Value |
|-------|-------|
| **Status** | VERIFIED |
| **Risk** | Critical |
| **Evidence** | `backend/database/ticket_communication_phase7_4.sql` — creates `ticket_communications`, `ticket_call_logs`, `ticket_email_logs`, `ticket_activity_timeline` with indexes only; no `ENABLE ROW LEVEL SECURITY` or policies. Compare with `backend/database/enable_ticketing_rls.sql` for Phase 1 pattern |
| **Notes** | Backend uses service role (bypasses RLS), but direct Supabase client access would be unprotected |

---

### C-04 — Backend uses Supabase service role for all privileged DB access

| Field | Value |
|-------|-------|
| **Status** | VERIFIED |
| **Risk** | Critical (architectural) |
| **Evidence** | `backend/src/lib/supabase.js:14-16,24` — throws if service role missing; `backend/src/middlewares/auth.middleware.js:26-30` — employee lookup via `supabaseAdmin` |
| **Notes** | Acceptable pattern only if API-layer authorization is complete and consistent |

---

### C-05 — Dual/conflicting RBAC authority models

| Field | Value |
|-------|-------|
| **Status** | VERIFIED |
| **Risk** | Critical |
| **Evidence** | Runtime: `backend/src/services/role-resolution.service.js:11-23` (`user_roles` → `roles`); Legacy writes: `backend/src/controllers/auth.controller.js:192-198,248` (`users.role`, `employees.role`); Static maps: `backend/src/modules/ticketing/ticketing.types.js:50-64`; Payroll: `backend/src/modules/payroll/config/rbac.config.ts:13-30`; RLS: `backend/database/enable_ticketing_rls.sql:22-60` (`employees.role` / `users.role` fallback); **createUser does not insert `user_roles`** (grep: no match in `auth.controller.js`) |
| **Notes** | `docs/auth-rbac/ROLE_AUTHORITY_REPORT.md` documents historical mismatch; middleware now reads `user_roles` at login |

---

### C-06 — Auth tokens stored in localStorage

| Field | Value |
|-------|-------|
| **Status** | VERIFIED |
| **Risk** | Critical (XSS exposure) |
| **Evidence** | `frontend/src/services/authSession.ts:4-17`; widespread `localStorage.getItem('token')` in `frontend/src/services/api.ts`, `AuthContext.tsx`, `Profile.tsx`, `payrollService.ts`, etc. |

---

### C-07 — Default password returned in create-user API response

| Field | Value |
|-------|-------|
| **Status** | VERIFIED |
| **Risk** | Critical |
| **Evidence** | `backend/src/controllers/auth.controller.js:178` (`TempPassword123!`); `:282` (password in response message) |

---

### C-08 — No CI/CD pipeline

| Field | Value |
|-------|-------|
| **Status** | VERIFIED |
| **Risk** | Critical (process) |
| **Evidence** | No `.github/workflows/`, no `.gitlab-ci.yml`, no `netlify.toml` build hooks in repo |

---

### C-09 — No deployment IaC (netlify.toml / render.yaml)

| Field | Value |
|-------|-------|
| **Status** | VERIFIED |
| **Risk** | High (audit rated Critical for enterprise go-live — confirmed High for infra gap) |
| **Evidence** | Glob search returned 0 files; only `frontend/public/_redirects` exists for Netlify SPA |

---

### C-10 — No observability integrations

| Field | Value |
|-------|-------|
| **Status** | VERIFIED |
| **Risk** | Critical (operational) |
| **Evidence** | Grep for Sentry/Datadog/OpenTelemetry/Logtail — no matches in source; logging limited to `backend/src/lib/logger.js` (Winston file + console) |

---

### C-11 — No email notification service

| Field | Value |
|-------|-------|
| **Status** | VERIFIED |
| **Risk** | High (audit Critical — product gap, not security blocker) |
| **Evidence** | Grep for nodemailer/sendgrid/resend/smtp — no matches in `backend/src` |

---

### C-12 — RLS disabled/workaround on core employees/users

| Field | Value |
|-------|-------|
| **Status** | PARTIALLY VERIFIED |
| **Risk** | High |
| **Evidence** | `backend/fix_rls_policies.js` — script to disable/fix RLS due to recursion; `backend/database/fix_infinite_recursion.sql`; `enable_departments_rls.sql`, `enable_attendance_rls.sql` exist separately |
| **Notes** | Live production RLS state unknown from repo |

---

### C-13 — SUPER_ADMIN excluded from frontend Role type and ProtectedRoute

| Field | Value |
|-------|-------|
| **Status** | VERIFIED |
| **Risk** | High |
| **Evidence** | `frontend/src/types/index.ts:2` — Role union excludes SUPER_ADMIN; `frontend/src/App.tsx:97` — ProtectedRoute allows ADMIN/HR/MANAGER/EMPLOYEE only; backend uses SUPER_ADMIN in `backend/src/app.js:210`, payroll controllers, `ownership.middleware.js:3` |

---

### C-14 — No graceful HTTP server shutdown

| Field | Value |
|-------|-------|
| **Status** | VERIFIED |
| **Risk** | High |
| **Evidence** | `backend/src/server.js` — no `server.close()` on SIGTERM; `backend/src/lib/redis.js:140-141` — SIGTERM handler for Redis only |

---

### C-15 — Runtime ts-node compilation in production bootstrap

| Field | Value |
|-------|-------|
| **Status** | VERIFIED |
| **Risk** | High |
| **Evidence** | `backend/src/server.js:24-33` — `ts-node.register()` at boot; `backend/package.json:48-49` — ts-node/typescript in dependencies |

---

### C-16 — Puppeteer dependency (Render memory risk)

| Field | Value |
|-------|-------|
| **Status** | VERIFIED |
| **Risk** | High |
| **Evidence** | `backend/package.json:42` — puppeteer ^22.6.0; used by payroll bulk payslip generation module |

---

### C-17 — Email enumeration via check-email endpoint

| Field | Value |
|-------|-------|
| **Status** | VERIFIED |
| **Risk** | High |
| **Evidence** | `backend/src/controllers/auth.controller.js:4-38` — returns `exists: true/false`; demo emails hardcoded `:13-14` |

---

### C-18 — README claims Production Ready / future phases complete

| Field | Value |
|-------|-------|
| **Status** | VERIFIED |
| **Risk** | Medium (documentation accuracy) |
| **Evidence** | `README.md:538-552` (Phase 3–4 marked complete with AI/Knowledge Base); `README.md:574` (`Status: Production Ready`) |

---

### C-19 — No API versioning

| Field | Value |
|-------|-------|
| **Status** | VERIFIED |
| **Risk** | Medium |
| **Evidence** | All routes under `/api/*` in `backend/src/app.js`; no `/api/v1` pattern |

---

### C-20 — No multi-tenant isolation

| Field | Value |
|-------|-------|
| **Status** | VERIFIED |
| **Risk** | High (enterprise requirement) |
| **Evidence** | Schema uses single-org `departments`, `employees`; no `tenant_id` / `organization_id` in ticketing or core tables |

---

## High Priority Findings Validation

### H-01 — Hardcoded CORS origin yviems.netlify.app

| Status | VERIFIED | `backend/src/app.js:22`, `backend/src/server.js:81` | High |

### H-02 — Console logging on every API request (frontend)

| Status | VERIFIED | `frontend/src/services/api.ts:74,93` | Medium |

### H-03 — Verbose auth middleware logging (backend)

| Status | VERIFIED | `backend/src/middlewares/auth.middleware.js:7,10,15,21,38,55` | Medium |

### H-04 — Winston logs to ephemeral Render filesystem

| Status | VERIFIED | `backend/src/lib/logger.js:6-54` — writes to local `logs/` | High |

### H-05 — Redis/Socket.IO in-memory fallback

| Status | VERIFIED | `backend/src/server.js:58-61,127-157` — falls back when Redis unavailable | High |

### H-06 — No Netlify security headers

| Status | VERIFIED | No `netlify.toml` or `_headers` file | High |

### H-07 — No soft-delete pattern

| Status | VERIFIED | Grep `deleted_at`/`is_deleted` in SQL — no matches | Medium |

### H-08 — Inconsistent API response envelopes

| Status | VERIFIED | Compare `frontend/src/services/api.ts` employee vs project pagination handling | Medium |

### H-09 — No OpenAPI/Swagger

| Status | VERIFIED | No swagger/openapi references in backend | Medium |

### H-10 — JWT_SECRET required but Supabase JWT is primary auth

| Status | VERIFIED | `backend/src/server.js:19` requires JWT_SECRET; auth uses Supabase session token (`auth.controller.js:346`); grep shows JWT_SECRET only in config/server bootstrap | Medium |

### H-11 — Real Supabase URL in backend .env.example

| Status | VERIFIED | `backend/.env.example:9-10` | Medium |

### H-12 — Feature flag build-time vs runtime mismatch risk

| Status | VERIFIED | Frontend flags are Vite build-time (`import.meta.env`); backend runtime env | High |

### H-13 — Admin route not in global ProtectedRoute role list

| Status | PARTIALLY VERIFIED | `/app/admin/users` accessible to all authenticated roles at router level; page-level guard in `AdminUsers.tsx:194-195` | Medium |

### H-14 — Command palette without RBAC filtering

| Status | VERIFIED | `frontend/src/components/common/CommandPalette.tsx:35-43` — static commands | Medium |

### H-15 — No connection pooling configuration documented

| Status | VERIFIED | Supabase JS client only; no pg pool config in app | Medium |

### H-16 — No automated migration runner

| Status | VERIFIED | Manual SQL files in `backend/database/`; no Supabase migrations folder | High |

### H-17 — FINANCE role in nav but not in Role type

| Status | VERIFIED | `AppLayout.tsx:119-121` vs `types/index.ts:2` | Medium |

### H-18 — createUser does not populate user_roles

| Status | VERIFIED | No `user_roles` reference in `auth.controller.js`; login uses `getUserRole()` | Critical (subset of C-05) |

### H-19 — user_roles table DDL not in repository migrations

| Status | VERIFIED | `user_roles` referenced in `schema.sql` policies and `role-resolution.service.js`; no `CREATE TABLE user_roles` in `backend/database/*.sql` | High |

### H-20 — No documented Supabase backup/restore runbook in repo

| Status | VERIFIED | Phase rollback plans exist (`docs/phase-7.3/ROLLBACK_PLAN.md`) but no org-wide DR doc | Medium |

---

## Medium Priority Findings Validation

### M-01 — Eager page imports in App.tsx

| Status | VERIFIED | `frontend/src/App.tsx:19-58` — 30+ static imports | Medium |

### M-02 — Module routes use lazy loading

| Status | VERIFIED | `frontend/src/modules/ticketing/ticketing.routes.tsx:7-9` | Positive finding |

### M-03 — No Node version pinning

| Status | VERIFIED | No `.nvmrc`; no `engines` in root package.json | Medium |

### M-04 — Mixed JS/TS backend

| Status | VERIFIED | `.js` controllers + `.ts` payroll modules | Medium |

### M-05 — Duplicate CORS config

| Status | VERIFIED | `app.js` and `server.js` both define corsOrigins | Low |

### M-06 — Health check queries users table

| Status | VERIFIED | `backend/src/routes/health.routes.js:42-45` | Low |

### M-07 — Zod version mismatch

| Status | VERIFIED | `frontend/package.json` zod ^3.25; `backend/package.json` zod ^4.x | Low |

### M-08 — Phase 7.3 SLA module documented but not in codebase

| Status | VERIFIED | `docs/phase-7.3/` exists; no `backend/database/ticket_sla_phase7_3.sql`; no `sla-management` module; basic SLA in `ticketing/services/sla.service.js` only | Medium |

### M-09 — Ticketing RLS comprehensive for Phase 1

| Status | VERIFIED | `backend/database/enable_ticketing_rls.sql` — positive control | N/A |

### M-10 — SPA redirect configured

| Status | VERIFIED | `frontend/public/_redirects` | Positive finding |

### M-11 — Rate limiting on auth endpoint

| Status | VERIFIED | `backend/src/app.js:87-93,119` — 10 req/15min | Positive finding |

### M-12 — Helmet enabled

| Status | VERIFIED | `backend/src/app.js:96` | Positive finding |

### M-13 — File upload MIME whitelist

| Status | VERIFIED | `backend/src/modules/ticketing/middleware/upload.middleware.js:5-24` | Positive finding |

### M-14 — Security hardening tests exist

| Status | VERIFIED | `backend/security-hardening.test.js`, `backend/src/tests/auth-rbac-hardening.test.js` | Positive finding |

### M-15 — Extensive ticketing test coverage

| Status | VERIFIED | 66+ test files across frontend/backend | Positive finding |

---

## False Positives / Corrections to Original Audit

| Original Claim | Corrected Status | Explanation |
|----------------|------------------|-------------|
| JWT-based authentication as primary | PARTIALLY VERIFIED | Supabase Auth issues tokens; `JWT_SECRET` appears legacy/bootstrap-only |
| Dynamic Enterprise RBAC fully implemented | NOT VERIFIED | Static role arrays dominate; `user_roles` read at login but not written on user creation |
| Phase 7.3 SLA Engine in codebase | NOT VERIFIED | Documentation and rollback SQL referenced but module/SQL not present in repo |
| README Phase 3 AI/Knowledge Base complete | NOT VERIFIED | Marketing/docs only; no corresponding modules found |
| CSRF vulnerability (high) | PARTIALLY VERIFIED | Bearer token SPA pattern reduces CSRF; becomes relevant if cookie auth adopted |
| employees.role is live DB authority | NOT VERIFIED (post-fix) | `role-resolution.service.js` explicitly avoids `employees.role`; column may or may not exist per environment |

---

## Validation Summary

| Category | Count |
|----------|-------|
| Critical findings VERIFIED | 15 |
| Critical PARTIALLY VERIFIED | 2 |
| High findings VERIFIED | 18 |
| False positives / corrections | 6 |
| Positive controls confirmed | 8 |

---

## Recommended Next Step

Proceed to **Phase 2 — Security Remediation Plan** using verified findings only.  
**Do not execute fixes** until wave approval per `SAFE_IMPLEMENTATION_ROADMAP.md`.

---

*Generated in Safe Enterprise Remediation Mode — no code or SQL modified.*
