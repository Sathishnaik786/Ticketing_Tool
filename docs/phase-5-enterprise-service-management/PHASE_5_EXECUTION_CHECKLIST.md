# PHASE 5 EXECUTION CHECKLIST
# Phase 5 Enterprise Service Management Verification & Launch Checklist

This document provides a checklists registry to guide the testing, security validation, and deployment steps of Phase 5.

---

## 1. Database Checklist

* [ ] **Immutable Audit Log Check:** Verify that attempts to update or delete rows in the `system_audit_logs` table trigger PostgreSQL exceptions.
* [ ] **Foreign Key Validation:** Verify all index schemas on foreign keys (`workflow_id`, `version_id`, `ticket_id`, `policy_id`, `level_id`) are created.
* [ ] **Additives-Only Migration Audit:** Verify no existing fields in the tables `employees`, `attendance`, or `payroll` are modified, renamed, or deleted during migrations.
* [ ] **Row-Level Security (RLS) Check:** Verify that RLS is active on all new database tables, and confirm read/write rights match user roles.
* [ ] **Rollback Validation:** Test the database rollback script in the development sandbox, ensuring all tables and views are removed cleanly.

---

## 2. Backend Checklist

* [ ] **Redis Connection Resilience:** Verify that the backend start sequence retry loops can handle Redis drops without crashing the server thread.
* [ ] **Zod Schema Payload Sanitization:** Verify that input validators reject invalid configurations for workflows, approvals, and dynamic catalog forms.
* [ ] **Zuo Loop Execution Breaker:** Verify that ticket workflow steps are suspended if execution exceeds a depth of 10 loops.
* [ ] **Decoupled Approval Assignments:** Verify that approving a step triggers the next level in sequence, and that rejections activate the proper rollback routes.
* [ ] **Outbound Webhook Destination Filter:** Verify that target URLs resolved by automation rules are checked, blocking private subnets.

---

## 3. Frontend Checklist

* [ ] **Feature Flags Isolation:** Verify that disabling flags in `src/config/features.ts` hides menu paths, blocks route registration, and hides UI buttons.
* [ ] **Dynamic Catalog Renderer Validation:** Verify dynamic form fields (inputs, select widgets, file attachments) render and validate against schemas.
* [ ] **Dashboard Recharts Optimization:** Verify Recharts data arrays are memoized via `useMemo` to prevent layout re-renders.
* [ ] **Sidebar Target Alignments:** Verify that sidebar elements scale down correctly on mobile screens, and match the ETMS dark mode token styling.
* [ ] **Optimistic UI Triggers:** Verify that approval decisions and status changes update instantly on the UI before the API confirms.

---

## 4. Security Verification Checklist

* [ ] **Approval Forgery Check:** Verify that submitting approval updates with another user's credentials throws a 403 authorization error.
* [ ] **SSRF DNS Validation:** Test automation endpoints with private network domains to confirm requests are blocked.
* [ ] **IDOR Prevention:** Verify that accessing other users' notification settings or approval history via direct URL parameter changes is blocked.
* [ ] **HMAC HMAC Signatures:** Verify that outbound automation webhooks send signed payloads, and that receivers validate the signature.

---

## 5. Performance Checklist

* [ ] **SLA Monitor Load Limits:** Verify that the 1-minute repeat cron job completes in less than 5 seconds when querying 1,000 active tickets.
* [ ] **Executive Analytics Caching:** Verify that KPI counters cache in Redis (5-minute TTL) and read values from the cache.
* [ ] **Report Compilation Worker:** Verify that heavy PDF compilation jobs execute on background worker threads without causing API request timeouts.

---

## 6. Testing Checklist

* [ ] **Unit Tests Execution:** Run `npm run test` to verify Vitest tests for workflows, conditions parser, and SLA calculators pass.
* [ ] **Integration Tests Validation:** Verify that transactional logic (e.g. ticket updates writing audit logs) operates correctly.
* [ ] **Playwright E2E Tests:** Run Playwright user flow scripts (e.g., catalog request -> workflow step trigger -> approval action).
* [ ] **Accessibility Compliance:** Run Axe accessibility scans to verify dark mode contrast and keyboard focus settings pass rules.

---

## 7. Deployment Checklist

* [ ] **Render Blueprint Config:** Verify that `render.yaml` updates are validated.
* [ ] **Staging Redis Instance:** Verify Redis cluster connectivity in the Render dashboard.
* [ ] **Worker Scaling Setup:** Verify that background workers run on isolated Render process threads in the staging environment.
* [ ] **Secrets Integration:** Verify that `REDIS_URL`, `JWT_SECRET`, and feature flag variables are saved in the environment secrets.
