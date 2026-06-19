# Phase 8.0 — Risk Register

**Date:** 2026-06-19  
**Mode:** Audit only

---

## Risk Scoring Matrix

| Score | Likelihood | Impact |
|-------|------------|--------|
| 1–4 | Low | Low/Medium |
| 5–9 | Medium | Medium/High |
| 10–16 | High | High/Critical |
| 17–25 | Very High | Critical |

**Overall Program Risk Score: 14 / 25 (HIGH)**

---

## Active Risks

| ID | Risk | L | I | Score | Mitigation | Owner |
|----|------|---|---|-------|------------|-------|
| R-001 | Analytics route collision breaks 7.7 in prod | 4 | 4 | **16** | Wave 1 B-01; verify with curl | Backend |
| R-002 | EMS removal breaks unknown hidden dependency | 3 | 5 | **15** | Feature-flag observation period | Architect |
| R-003 | Payroll data loss on premature DB drop | 2 | 5 | **10** | Legal retention review; no drops in 8.x without sign-off | DBA |
| R-004 | RLS change locks out all users | 3 | 5 | **15** | Staging first; policy snapshot | Security |
| R-005 | Token migration auth regression | 3 | 4 | **12** | Parallel auth period | Frontend |
| R-006 | Flag mismatch disables ETMS silently | 4 | 3 | **12** | Env sync checklist; startup log flags | DevOps |
| R-007 | No CI merges broken code | 4 | 4 | **16** | Wave 1 CI pipeline | DevOps |
| R-008 | localStorage XSS token theft | 3 | 5 | **15** | Wave 4 token migration | Security |
| R-009 | Bundle size degrades mobile UX | 3 | 3 | **9** | Code splitting | Frontend |
| R-010 | Phase 7.4 tables exposed without RLS | 3 | 5 | **15** | Apply RLS migration in staging | DBA |
| R-011 | Stakeholder expects payroll in ETMS | 4 | 4 | **16** | Confirm product scope before D-01 | Product |
| R-012 | Scratch scripts contain secrets | 2 | 4 | **8** | Review before A-01 removal | Security |
| R-013 | Supabase schema drift from repo | 4 | 3 | **12** | Live schema export vs repo diff | DBA |
| R-014 | Dual notification confusion for users | 3 | 2 | **6** | UX consolidation in 8.3 | Product |
| R-015 | Render cold start + no Redis | 3 | 3 | **9** | Enable Redis when scaling | DevOps |

---

## Risk by Cleanup Group

| Group | Primary Risks |
|-------|---------------|
| A (Safe removal) | R-012 low |
| B (Refactoring) | R-001, R-006, R-007 |
| C (Shared) | R-002 if misidentified as removable |
| D (High risk) | R-002, R-003, R-004, R-005, R-011 |
| E (Do not touch) | R-002 if accidentally modified |

---

## Residual Risk After Planned Waves

| Wave | Residual Score (est.) |
|------|----------------------|
| Current state | 14 |
| After Wave 1 | 11 |
| After Wave 2 | 8 |
| After Wave 3 (EMS retired) | 6 |
| After Wave 4 (hardening) | 4 |

---

## Risk Acceptance Notes

- **Parallel EMS+ETMS operation** is accepted short-term if business requires payroll
- **Service role RLS bypass** accepted if application RBAC verified (ongoing audit needed)
- **No CI** is **NOT acceptable** long-term — Wave 1 mandatory

---

## Escalation Triggers

Stop all cleanup activity if:

1. Any Phase 7.1–7.8 regression test fails post-change
2. Production ticket creation breaks
3. Auth login failure rate increases
4. Supabase policy change causes data exposure or lockout
5. Stakeholder revokes EMS retirement approval

**No risks mitigated in Phase 8.0 — register only.**
