# Phase 8.0 — Cleanup Execution Plan

**Date:** 2026-06-19  
**Status:** PLAN ONLY — **awaiting approval before any execution**  
**Rules:** No file deletion, no code removal, no SQL changes until approved per group

---

## Group A — Safe Removal (Low Risk)

*Isolated artifacts with no ETMS dependency. Execute only after approval.*

| ID | Item | Reason | Dependencies | Risk | Rollback |
|----|------|--------|--------------|------|----------|
| A-01 | Root `scratch_*.js`, `test_employees_api.js` | Dev debug scripts not in build | None | **Low** | Git revert |
| A-02 | `backend/test-status.js`, `verify_admin_login.js` | One-off utilities | None | **Low** | Git revert |
| A-03 | `frontend/src/data/mockData.ts` | Mock HR data unused in prod | Verify no imports | **Low** | Git revert |
| A-04 | `frontend/src/pages/Index.tsx` | Not routed (Landing used) | None | **Low** | Git revert |
| A-05 | CORS origin `yviems.netlify.app` | Legacy EMS deployment | Verify no active users on domain | **Low** | Restore app.js line |
| A-06 | `security-hardening-backups/` | Dated snapshots superseded by git | None | **Low** | Restore from git history |
| A-07 | `.kiro/` specs (if obsolete) | Design exploration artifacts | Confirm team doesn't use Kiro | **Low** | Git revert |

**Pre-condition:** Grep for imports/references before each removal.

---

## Group B — Requires Refactoring (Medium Risk)

*Functional change or structural move required.*

| ID | Item | Reason | Dependencies | Risk | Rollback |
|----|------|--------|--------------|------|----------|
| B-01 | Resolve `/api/analytics` collision | 7.7 unreachable if legacy wins | executive-analytics FE service URL | **High** | Revert app.js mount order |
| B-02 | Feature-flag EMS modules | Cannot disable EMS without code deploy | app.js, App.tsx, AppLayout | **Medium** | Set `ENABLE_EMS_LEGACY=false` |
| B-03 | ETMS-first sidebar restructure | UX clarity | AppLayout navGroups | **Medium** | Git revert |
| B-04 | Wire `npm test` to full regression | CI readiness | package.json scripts | **Low** | Revert script |
| B-05 | Split frontend bundle (manualChunks) | 2.7MB main chunk | vite.config.ts | **Medium** | Revert vite config |
| B-06 | Move legacy analytics to `/api/hr-analytics` | Free `/api/analytics` for ETMS | FE consumers of legacy analytics | **Medium** | Dual-mount both prefixes temporarily |
| B-07 | Gate debug routes (`/redis-test`) | Attack surface | env var | **Low** | Remove env gate |
| B-08 | Add `departmentId` to auth middleware | Manager scoping for 7.7/7.8 | employee lookup | **Medium** | Revert middleware |

---

## Group C — Shared Dependencies (Do Not Remove — Isolate)

*Must remain until ETMS platform extraction complete.*

| ID | Item | Reason | ETMS Depends On | Action |
|----|------|--------|-----------------|--------|
| C-01 | `employees` table + API | Ticket assignees, RBAC | All ETMS | **Keep** — extract to platform module |
| C-02 | `departments` table + API | Ticket routing, analytics | 7.7, ticketing | **Keep** |
| C-03 | Auth system (Supabase + middleware) | All modules | Everything | **Keep** — harden only |
| C-04 | Chat + legacy notifications | Ticket realtime bell | Ticketing | **Keep** — 7.8 is parallel |
| C-05 | `AppLayout` shell | Route container | All UI | **Keep** — refactor nav only |
| C-06 | `Dashboard.tsx` | Post-login landing | Both | **Migrate** widgets to ETMS-only |
| C-07 | Document vault | May store ticket attachments policy | Unknown | **Audit usage** before decision |

---

## Group D — High Risk (Requires Stakeholder Sign-Off + Data Plan)

| ID | Item | Reason | Dependencies | Risk | Rollback |
|----|------|--------|--------------|------|----------|
| D-01 | Retire payroll module (FE+BE) | Pure ETMS goal | 80+ DB tables, active users? | **Critical** | Cannot rollback without DB restore |
| D-02 | Drop payroll SQL tables | Storage/compliance | Legal retention requirements | **Critical** | Supabase point-in-time recovery |
| D-03 | Retire attendance/leaves | EMS cleanup | HR historical data | **High** | DB restore |
| D-04 | Retire projects/meetups | EMS cleanup | User content | **High** | DB restore |
| D-05 | Retire employee updates module | EMS cleanup | Update history | **Medium** | DB restore |
| D-06 | Remove legacy `@analytics` module | Collision with 7.7 | HR dashboard users | **High** | Git revert + remount |
| D-07 | RLS policy revocation (public policies) | Security | **Can break all access** | **Critical** | Policy snapshot restore |
| D-08 | Token storage migration (localStorage→httpOnly) | Security | Full auth regression | **High** | Feature flag parallel auth |

**Mandatory before D-01–D-06:**
1. Stakeholder confirms EMS scope out of ETMS product
2. Export/archive all EMS data
3. Feature-flag EMS off for 30-day observation period

---

## Group E — Do Not Touch (Stable ETMS)

| ID | Item | Reason |
|----|------|--------|
| E-01 | Phase 7.1–7.8 modules (code + SQL) | Stable, tested, flagged |
| E-02 | `ticketing_phase1.sql` core schema | ETMS foundation |
| E-03 | Ticketing services, SLA embedded logic | Core business |
| E-04 | Feature flag env vars (7.1–7.8) | Production contract |
| E-05 | Phase 7.x rollback SQL scripts | Operational safety |
| E-06 | `render.yaml` / `netlify.toml` deploy configs | Production (modify only via approved change) |
| E-07 | 504-test regression suites | Quality gate |
| E-08 | Approval engine on TicketDetailPage | Additive integration pattern |

---

## Recommended Execution Order (Post-Approval)

### Wave 1 — Quick Wins (1–2 weeks, no EMS removal)
1. A-01 through A-06 (hygiene)
2. B-01 (analytics collision)
3. B-04 (npm test wiring)
4. B-07 (debug route gating)
5. TD-005, TD-006 security quick fixes

### Wave 2 — Isolation (2–4 weeks)
1. B-02 (EMS feature flags)
2. B-03 (ETMS-first nav)
3. B-08 (departmentId on auth)
4. CI pipeline (TD-002)
5. Live Supabase schema inventory (TD-013)

### Wave 3 — EMS Decision Gate (requires business approval)
1. 30-day EMS flag-off observation
2. Data export/archive
3. D-01 through D-06 as approved
4. Database cleanup (D-02) only after legal/compliance sign-off

### Wave 4 — Hardening
1. D-07 RLS (staging first)
2. D-08 token migration
3. Observability stack
4. Performance bundle split

---

**NO ITEMS EXECUTED IN PHASE 8.0. AWAITING APPROVAL.**
