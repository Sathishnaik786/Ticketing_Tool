# Phase 8.0 — Technical Debt Register

**Date:** 2026-06-19  
**Mode:** Audit only — living document for Phase 8.1+

---

## Debt Scoring

| Priority | Definition |
|----------|------------|
| P0 | Blocks production / security |
| P1 | High regression or ops risk |
| P2 | Maintainability / performance |
| P3 | Nice-to-have cleanup |

---

## Registered Items

| ID | Item | Domain | Priority | Effort | Phase |
|----|------|--------|----------|--------|-------|
| TD-001 | `/api/analytics` dual mount collision | API | **P0** | S | 8.1 |
| TD-002 | No CI/CD pipeline | Ops | **P0** | M | 8.1 |
| TD-003 | Auth tokens in localStorage | Security | **P0** | L | 8.2 |
| TD-004 | RLS gaps (7.4, legacy public policies) | Security | **P0** | M | 8.2 |
| TD-005 | createUser password in API response | Security | **P0** | S | 8.1 |
| TD-006 | createUser missing user_roles insert | Security | **P0** | S | 8.1 |
| TD-007 | EMS modules not feature-flagged | Architecture | **P1** | M | 8.1 |
| TD-008 | Sidebar EMS nav dominates ETMS UX | UI | **P1** | M | 8.2 |
| TD-009 | Frontend bundle 2.7MB main chunk | Performance | **P1** | M | 8.2 |
| TD-010 | backend `npm test` runs 1 file only | Testing | **P1** | S | 8.1 |
| TD-011 | Payroll zero test coverage | Testing | **P1** | XL | 8.3 or N/A if retired |
| TD-012 | Phase 7.3 SLA module docs vs code gap | ETMS | **P1** | M | 8.1 |
| TD-013 | Missing tables in repo (sla_escalation, business_units) | Database | **P1** | S | 8.1 |
| TD-014 | No observability (Sentry, metrics) | Ops | **P1** | M | 8.2 |
| TD-015 | Legacy `@analytics` HR service | EMS | **P2** | M | 8.2 |
| TD-016 | Root scratch/debug scripts | Hygiene | **P2** | S | 8.1 |
| TD-017 | `yviems.netlify.app` CORS legacy origin | Config | **P2** | S | 8.1 |
| TD-018 | `security-hardening-backups/` dated snapshots | Hygiene | **P2** | S | 8.1 |
| TD-019 | Dual notification systems (bell + center) | Architecture | **P2** | L | 8.3 |
| TD-020 | departmentId not on req.user | ETMS RBAC | **P2** | S | 8.1 |
| TD-021 | E2E tests fail in vitest run | Testing | **P2** | S | 8.1 |
| TD-022 | No API versioning | Architecture | **P3** | L | Future |
| TD-023 | mockData.ts legacy mock HR data | Hygiene | **P3** | S | 8.1 |
| TD-024 | Index.tsx dead page | Hygiene | **P3** | S | 8.1 |
| TD-025 | Django migration doc (unactioned) | Docs | **P3** | — | Review |

---

## Debt by Domain

| Domain | Items | Est. Weight |
|--------|-------|-------------|
| Security | 6 | 30% |
| Architecture / EMS mixing | 5 | 25% |
| Testing / CI | 4 | 15% |
| Performance | 2 | 10% |
| UI/UX | 2 | 10% |
| Hygiene | 6 | 10% |

---

## Overall Technical Debt Estimate

**~38% of repository effort is non-feature debt** (security, ops, EMS/ETMS cohabitation, test infra).

ETMS modules 7.1–7.8 contribute **low debt** (~5% of total) — well-structured additive pattern.

Payroll/EMS contributes **~20% debt** (untested, unflagged, nav weight).

Platform/shared contributes **~13% debt** (auth, RLS, CI).

---

## Debt Trend Target (Post Phase 8)

| Milestone | Target Debt % |
|-----------|---------------|
| After 8.1 (quick wins) | 30% |
| After 8.2 (security + UX) | 22% |
| After 8.3 (EMS isolation/retirement) | 12% |
| Pure ETMS steady state | <10% |

**No debt items resolved in Phase 8.0.**
