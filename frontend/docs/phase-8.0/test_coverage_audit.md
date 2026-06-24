# Phase 8.0.9 — Test Coverage Audit

**Date:** 2026-06-19  
**Mode:** Audit only

---

## Summary

| Suite | Files | Tests (approx) | Pass Status |
|-------|-------|----------------|-------------|
| Backend ETMS modules | 40 files | ~420 | 504 total regression pass |
| Backend EMS (payroll) | 1 file | ~5 | Minimal |
| Backend security/RBAC | 2 files | ~20 | Pass |
| Frontend ETMS modules | 73 files | ~250+ | Pass (module suites) |
| Frontend EMS modules | 0 | 0 | **GAP** |
| E2E Playwright | 3 specs | ticketing only | Not in CI |
| **Total test files** | ~125 | | |

---

## Backend Coverage by Module

| Module | Test Files | Est. Tests | Target Met? |
|--------|-----------|------------|-------------|
| ticketing | 7 | ~40 | Partial |
| ticket-feedback | 3 | ~25 | ✓ (7.1) |
| ticket-assignment | 4 | ~30 | ✓ (7.2) |
| communication-tracking | 5 | ~35 | ✓ (7.4) |
| approval-management | 5 | ~77 | ✓ (7.5) |
| knowledge-management | 5 | ~84 | ✓ (7.6) |
| executive-analytics | 5 | ~80 | ✓ (7.7) |
| notification-center | 5 | ~62 | ✓ (7.8) |
| updates | 0 | 0 | **MISSING** |
| payroll (all) | 1 | ~5 | **CRITICAL GAP** |
| Legacy routes/controllers | 0 | 0 | **MISSING** |

### Backend Test Execution Gap

```json
// backend/package.json
"test": "node --test security-hardening.test.js"
```

Full module regression requires manual command spanning all `src/modules/*/tests/*.test.js`. **Not wired to npm test.**

---

## Frontend Coverage by Module

| Module | Test Files | Est. Tests | Status |
|--------|-----------|------------|--------|
| ticketing | 5 | ~25 | Partial |
| ticket-feedback | 7 | ~30 | Good |
| ticket-assignment | 8 | ~35 | Good |
| communication-tracking | 14 | ~45 | Good |
| approval-management | 10 | ~42 | Good |
| knowledge-management | 9 | ~38 | Good |
| executive-analytics | 11 | ~41 | Good |
| notification-center | 9 | ~36 | Good |
| payroll (all 6) | 0 | 0 | **MISSING** |
| updates | 0 | 0 | **MISSING** |
| Shared pages | 1 | ~2 | **WEAK** |

---

## Regression Test Scope (Verified)

Command spanning 7.1–7.8 + ticketing + auth:

```
504 tests pass (as of Phase 7.8 completion)
```

**ETMS regression suite is strong.** EMS/payroll not in regression path.

---

## Critical Paths — Test Status

| Path | Backend | Frontend | E2E |
|------|---------|----------|-----|
| Login / auth | Partial (RBAC hardening) | Minimal | ✗ |
| Create ticket | ✓ | Partial | ✓ (spec exists) |
| Assign ticket | ✓ | ✓ | Partial |
| SLA breach | Partial (in ticketing) | ✗ | ✗ |
| Submit feedback | ✓ | ✓ | ✗ |
| Approval workflow | ✓ | ✓ | ✗ |
| Knowledge deflection | ✓ | ✓ | ✗ |
| Executive dashboard | ✓ | ✓ | ✗ |
| Notification center | ✓ | ✓ | ✗ |
| Payroll cycle | ~1 test | ✗ | ✗ |
| Employee CRUD | ✗ | ✗ | ✗ |

---

## Weak Areas

1. **No CI** — tests not enforced on PR/merge
2. **Payroll** — virtually untested despite complexity
3. **Auth E2E** — login flows not automated
4. **Legacy EMS routes** — attendance, leaves, projects untested
5. **Integration tests** — no API-level supertest suite for cross-module flows
6. **Phase 7.3 SLA** — no dedicated test module (embedded in ticketing)
7. **E2E specs fail in full `npm test`** — transform issues with Playwright in Vitest run

---

## Coverage Estimates (Qualitative)

| Domain | Est. Coverage |
|--------|---------------|
| ETMS Phase 7.x modules | **75–85%** (unit/service/RBAC) |
| Ticketing core | **60–70%** |
| Platform auth/RBAC | **50–60%** |
| Legacy EMS / payroll | **<10%** |
| Overall repository | **~45–55%** |

---

## Recommendations (Phase 8.1+)

1. Wire `npm test` to full backend regression script
2. Add GitHub Actions: backend 504 + frontend vitest + build
3. Exclude E2E from Vitest or fix transform config
4. Add smoke tests for auth login/logout
5. Decide: if EMS retired, tests irrelevant; if kept, payroll needs suite

**No tests added or modified in Phase 8.0.**
