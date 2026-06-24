# Safe Implementation Roadmap

**Project:** Enterprise Ticketing Management System  
**Mode:** Plan Only — Await Approval Per Wave  
**Date:** 2026-06-18

---

## Principles

1. **No wave starts without prior wave validation in staging**
2. **Every change has a rollback path**
3. **No destructive SQL** (no DROP column/table) without explicit approval
4. **Feature flags remain** — use them for gradual enablement
5. **Document every file change** before implementation

---

## Wave 1 — Critical Security

**Goal:** Close highest-risk security gaps without architectural rewrites.

### Tasks

| ID | Task | Files | Risk |
|----|------|-------|------|
| W1-01 | Audit live Supabase RLS policies (read-only SQL) | New diagnostic SQL | Low |
| W1-02 | Remove password from createUser response; use invite flow | `auth.controller.js` | Medium |
| W1-03 | Fix check-email enumeration (uniform response) | `auth.controller.js` | Low |
| W1-04 | Sanitize `.env.example` placeholders | `backend/.env.example` | Low |
| W1-05 | Replace hardcoded CORS with env-based allowlist | `app.js`, `server.js`, `config/` | Medium |
| W1-06 | Disable debug routes in production (`ENABLE_DEBUG_ROUTES`) | `app.js` | Low |
| W1-07 | Remove/gate verbose auth logging in production | `auth.middleware.js` | Low |

### Dependencies
- W1-01 must complete before any RLS policy changes
- Supabase dashboard access required

### Risks
- W1-05 misconfigured CORS blocks all frontend traffic

### Rollback
- Git revert per task
- CORS: re-add hardcoded origin temporarily
- Auth: revert controller changes

### Exit Criteria
- [ ] No secrets/passwords in API responses
- [ ] Production policy audit documented
- [ ] CORS works from Netlify staging URL

**Estimated effort:** 2-3 days

---

## Wave 2 — RBAC

**Goal:** Align write path and read path for roles; fix SUPER_ADMIN frontend gap.

### Tasks

| ID | Task | Files | Risk |
|----|------|-------|------|
| W2-01 | Export and document live roles/user_roles state | Scripts/docs | Low |
| W2-02 | Create backfill SQL for user_roles (additive) | New SQL | **High** |
| W2-03 | Insert user_roles in createUser | `auth.controller.js` | **High** |
| W2-04 | Dual-read fallback in getUserRole with logging | `role-resolution.service.js` | Medium |
| W2-05 | Add SUPER_ADMIN to frontend Role + ProtectedRoute | `types/index.ts`, `App.tsx` | Low |
| W2-06 | Add FINANCE to Role type OR map to ADMIN permissions | `types/index.ts`, nav | Low |

### Dependencies
- W1 complete
- W2-01 before W2-02
- DDL for roles/user_roles must exist in Supabase (may need Wave 3 SQL first)

### Risks
- Users gain unintended permissions after backfill
- Admin users locked out if backfill wrong

### Rollback
- `RBAC_LEGACY_MODE=true` env flag
- Restore getUserRole fallback to employees.role
- Reverse backfill via batch timestamp delete

### Exit Criteria
- [ ] createUser creates matching user_roles row
- [ ] Login role matches admin-assigned role in staging UAT
- [ ] SUPER_ADMIN can access /app

**Estimated effort:** 4-5 days

---

## Wave 3 — Database

**Goal:** Close RLS gaps; harden policies; no data loss.

### Tasks

| ID | Task | Files | Risk |
|----|------|-------|------|
| W3-01 | Create roles/user_roles DDL if missing (additive) | New SQL | Medium |
| W3-02 | Create enable_communication_tracking_rls.sql | New SQL | **High** |
| W3-03 | Apply Phase 7.4 RLS in staging | Supabase SQL editor | **High** |
| W3-04 | Create rls_production_hardening.sql (revoke public) | New SQL | **Critical** |
| W3-05 | Apply hardening in staging; full regression test | — | **Critical** |
| W3-06 | Update ticketing RLS helper for user_roles (new function version) | New SQL | High |
| W3-07 | Optional composite index after EXPLAIN | New SQL | Low |

### Dependencies
- W1-01 audit results
- W2-02 backfill before W3-06

### Risks
- W3-04 breaks anon client access (intended)
- W3-04 applied wrong breaks app entirely

### Rollback
- Policy snapshot restore script
- Phase rollback SQL for 7.4 (table drop — staging only)
- Feature flag disable communication module

### Exit Criteria
- [ ] No public policies on RBAC/audit tables in staging
- [ ] Phase 7.4 tables have RLS
- [ ] All existing RBAC tests pass against staging DB

**Estimated effort:** 5-7 days

---

## Wave 4 — Backend

**Goal:** Production-harden backend runtime and auth data path.

### Tasks

| ID | Task | Files | Risk |
|----|------|-------|------|
| W4-01 | Add user_roles insert to createUser (if not in W2) | `auth.controller.js` | High |
| W4-02 | Precompile TypeScript; remove runtime ts-node in prod | `package.json`, build scripts | Medium |
| W4-03 | Add HTTP graceful shutdown | `server.js` | Low |
| W4-04 | Auth middleware Redis cache (optional) | `auth.middleware.js` | Medium |
| W4-05 | Isolate or guard Puppeteer payslip generation | payroll bulk module | Medium |
| W4-06 | Align ENABLE_* flags documentation in .env.example | `.env.example` | Low |
| W4-07 | Separate liveness/readiness health endpoints | `health.routes.js` | Low |

### Dependencies
- W2 RBAC stable
- Redis instance for W4-04

### Risks
- W4-02 breaks payroll TS imports if misconfigured
- W4-05 may disable payslip PDF temporarily

### Rollback
- Revert to ts-node boot
- Disable auth cache via env

### Exit Criteria
- [ ] Cold start < 5s on Render
- [ ] Zero-downtime deploy on Render (graceful shutdown)
- [ ] All backend tests pass

**Estimated effort:** 4-6 days

---

## Wave 5 — Frontend

**Goal:** Production UX, security, and performance.

### Tasks

| ID | Task | Files | Risk |
|----|------|-------|------|
| W5-01 | Lazy load all App.tsx pages | `App.tsx` | Low |
| W5-02 | Remove production API console.log | `api.ts`, vite config | Low |
| W5-03 | Secure token storage (cookie/Supabase SSR) | authSession, api, AuthContext | **High** |
| W5-04 | Permission-based nav (optional, post-RBAC) | AppLayout, AuthContext | Medium |
| W5-05 | Command palette RBAC filter | CommandPalette.tsx | Low |
| W5-06 | Enable ticketing flags in staging build | Netlify env | Low |

### Dependencies
- W2 for role types
- W5-03 requires backend cookie/CORS coordination (Wave 4)

### Risks
- W5-03 is highest-risk frontend change — auth regression

### Rollback
- Revert auth storage pattern
- Revert lazy loading (unlikely needed)

### Exit Criteria
- [ ] Lighthouse performance > 75 on /app/dashboard
- [ ] Ticketing UI visible with flags on
- [ ] Auth flow works end-to-end in staging

**Estimated effort:** 5-8 days (W5-03 adds 3 days)

---

## Wave 6 — Deployment

**Goal:** Repeatable, documented deployments.

### Tasks

| ID | Task | Files | Risk |
|----|------|-------|------|
| W6-01 | Create netlify.toml with headers + build config | `frontend/netlify.toml` | Medium |
| W6-02 | Create render.yaml | `render.yaml` | Medium |
| W6-03 | Pin Node version (.nvmrc + engines) | root/backend/frontend | Low |
| W6-04 | Document env matrix | `docs/deployment-remediation/ENV_MATRIX.md` | Low |
| W6-05 | Configure staging Netlify + Render services | Manual dashboard | Medium |
| W6-06 | Deploy staging with all ENABLE_* true | Env config | Medium |
| W6-07 | Run E2E against staging | Playwright | Low |

### Dependencies
- Waves 1-5 complete for staging deploy

### Risks
- Misconfigured env breaks staging

### Rollback
- Revert Netlify/Render to previous deploy

### Exit Criteria
- [ ] One-click redeploy works
- [ ] Staging URL accessible with full ticketing
- [ ] Health checks green

**Estimated effort:** 3-4 days

---

## Wave 7 — Monitoring

**Goal:** Visibility before production traffic.

### Tasks

| ID | Task | Files | Risk |
|----|------|-------|------|
| W7-01 | Request ID middleware | New middleware | Low |
| W7-02 | Sentry backend integration | server.js, app.js | Low |
| W7-03 | Sentry frontend integration | main.tsx | Low |
| W7-04 | Log drain to Logtail/Datadog | logger.js | Low |
| W7-05 | Uptime monitoring on /health/ping | External service | Low |
| W7-06 | Alert rules for 5xx spike | Sentry/Datadog | Low |

### Dependencies
- W6 staging deployed

### Risks
- PII in Sentry if scrubbing not configured

### Rollback
- Unset DSN env vars

### Exit Criteria
- [ ] Test error appears in Sentry within 1 min
- [ ] Logs searchable by requestId
- [ ] Alert fires on simulated downtime

**Estimated effort:** 2-3 days

---

## Wave 8 — Go Live

**Goal:** Controlled production release.

### Tasks

| ID | Task | Owner |
|----|------|-------|
| W8-01 | UAT sign-off (use phase-7.3 checklist as template) | QA |
| W8-02 | Production Supabase policy verification | DBA |
| W8-03 | Production env vars set (FE + BE flags match) | DevOps |
| W8-04 | Production deploy (Netlify + Render) | DevOps |
| W8-05 | Smoke test: login, create ticket, assign, comment, comms | QA |
| W8-06 | Monitor 24h — error rate, latency, auth failures | Ops |
| W8-07 | Level 1 rollback drill verified | Ops |

### Dependencies
- All waves 1-7 complete
- Business sign-off

### Risks
- Production traffic exposes edge cases

### Rollback
- Netlify/Render instant rollback
- Feature flags OFF (Level 1)
- Supabase PITR (last resort)

### Exit Criteria
- [ ] 24h stable operation
- [ ] Zero critical security findings open
- [ ] Ticket lifecycle works for all roles

**Estimated effort:** 2 days + 24h soak

---

## Timeline Summary

| Wave | Duration | Cumulative |
|------|----------|------------|
| 1 Critical Security | 2-3 days | Week 1 |
| 2 RBAC | 4-5 days | Week 2 |
| 3 Database | 5-7 days | Week 3 |
| 4 Backend | 4-6 days | Week 4 |
| 5 Frontend | 5-8 days | Week 5-6 |
| 6 Deployment | 3-4 days | Week 6 |
| 7 Monitoring | 2-3 days | Week 7 |
| 8 Go Live | 2 days + soak | Week 7-8 |

**Total estimated: 7-8 weeks** with 1-2 engineers (sequential waves).

Parallelization option: W5-01/02 parallel with W4 after W2 complete.

---

## Approval Gates

| Gate | Approver | Required Before |
|------|----------|-----------------|
| G1 | Security lead | Wave 2 start |
| G2 | DBA / Architect | Wave 3 SQL apply |
| G3 | Tech lead | Wave 5 auth storage change |
| G4 | DevOps | Wave 6 production config |
| G5 | Product owner | Wave 8 go-live |

---

*No implementation started. Submit wave approval to begin W1-01.*
