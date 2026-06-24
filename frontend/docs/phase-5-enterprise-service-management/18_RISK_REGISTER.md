# 18 — Risk Register
# Phase 5.0: Enterprise Service Management Platform

---

## 1. Risk Matrix Key

| Severity | Likelihood | Impact | Action |
|---|---|---|---|
| P0 Critical | High | Blocking | Immediate mitigation required before launch |
| P1 High | Medium | Major degradation | Must resolve before beta |
| P2 Medium | Low–Medium | Significant but manageable | Resolve before GA |
| P3 Low | Low | Minor impact | Monitor and address in next cycle |

---

## 2. Technical Risks

| ID | Risk | Severity | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|---|---|
| T01 | React Flow canvas performance degrades with 50+ workflow nodes | P1 | Medium | Workflow builder unusable for complex workflows | Implement node virtualization; cap max nodes at 30 for v1 | Frontend |
| T02 | SLA cron job causes DB lock contention at peak load | P0 | Medium | All ticket operations slow down or fail | Use `pg_advisory_lock`; partial indexes; limit batch size to 500 | DBA |
| T03 | BullMQ Redis single point of failure | P1 | Low | All automation + SLA jobs stop processing | Redis Sentinel or Cluster for production; circuit breaker for graceful degradation | DevOps |
| T04 | AI LLM provider rate limits block all AI features | P1 | Medium | AI panel returns errors for all users | Implement exponential backoff; fallback provider; cache aggressively | Backend |
| T05 | pgvector similarity search too slow at scale (100k+ chunks) | P1 | Medium | KB suggestions take > 5s | IVFFlat index with probes=5; limit knowledge base to 10k articles for v1 | DBA |
| T06 | Supabase Realtime channel limit exceeded | P2 | Low | Realtime updates fail silently | Monitor channel count; implement connection pooling for socket events | Backend |
| T07 | Automation rule circular loop causes infinite execution | P1 | Medium | CPU spike; ticket flood; runaway notifications | Max 3 automation cycles per ticket per minute; circuit breaker in evaluator | Backend |
| T08 | Workflow state machine corruption (concurrent decisions) | P0 | Low | Step approved twice; skipped approvals | Database-level optimistic locking on step_executions; idempotency keys | Backend |
| T09 | Service catalog form definition breaking change | P2 | Low | Old submissions fail to render | Snapshot form definition at submission time (store form_id, not just catalog_id) | Backend |
| T10 | AI prompt token cost overrun | P2 | Medium | Monthly AI bill exceeds budget | Hard token limits; daily budget alerts; per-user quotas | Backend |

---

## 3. Business Risks

| ID | Risk | Severity | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|---|---|
| B01 | Workflow engine adoption is low — users bypass workflows | P1 | Medium | ROI not achieved | Make workflows mandatory for catalog requests; manager-visible compliance dashboard | Product |
| B02 | SLA targets are too aggressive — constant breach notifications cause alert fatigue | P2 | High | Agents ignore SLA alerts | Allow tenant-specific SLA targets; grace period on first deployment | Product |
| B03 | AI suggestions are inaccurate — agents stop using copilot | P1 | Medium | AI investment wasted | Feedback loop improves quality; show confidence scores; A/B test prompts | AI Team |
| B04 | Service catalog is too complex for end users | P1 | Medium | Low self-service adoption | UX testing pre-launch; simplify forms; progressive disclosure; contextual help | UX |
| B05 | Executive dashboards don't match existing reporting tools | P2 | Low | Low adoption by leadership | Export to Excel/PDF; schedule email reports; compare vs. previous period | Product |
| B06 | Phase 5 overloads the development team | P1 | High | Delayed delivery; quality issues | Enforce phased rollout; Phase 5.0 before 5.1; no overlapping deliverables | Engineering |

---

## 4. Security Risks (Summary — See 14_SECURITY_REVIEW.md for detail)

| ID | Risk | Severity | Status |
|---|---|---|---|
| S01 | Webhook SSRF | P0 | Mitigation designed |
| S02 | AI prompt injection | P0 | Mitigation designed |
| S03 | SLA cron DB overload | P0 | Mitigation designed |
| S04 | Workflow approver injection | P0 | Mitigation designed |
| S05 | Service request IDOR | P1 | Mitigation designed |
| S06 | File upload malware | P1 | Mitigation designed |
| S07 | Automation field privilege escalation | P1 | Mitigation designed |

---

## 5. Dependency Risks

| ID | Risk | Severity | Mitigation |
|---|---|---|---|
| D01 | `reactflow` npm package breaking changes | P2 | Pin to `^11.x`; test before upgrade |
| D02 | LLM API deprecation (OpenAI model changes) | P1 | Use provider abstraction layer; test against multiple models |
| D03 | Supabase pgvector extension not available on chosen tier | P1 | Confirm pgvector availability on current Supabase plan before Phase 5.3 |
| D04 | BullMQ incompatibility with Node.js version | P2 | Test BullMQ 5.x on Node 18 LTS before commit |
| D05 | Redis memory limits exceeded by job queue | P2 | Set Redis `maxmemory-policy allkeys-lru`; monitor queue depth |

---

## 6. Organizational Risks

| ID | Risk | Severity | Mitigation |
|---|---|---|---|
| O01 | Key engineer leaves during Phase 5 | P1 | Document all architectural decisions in these docs; pair on critical modules |
| O02 | Scope creep expands Phase 5.0 beyond 8 weeks | P1 | Strict scope freeze after Week 2; defer new requests to Phase 5.4 |
| O03 | LLM provider contract not signed before Phase 5.3 | P2 | Begin vendor evaluation in Phase 5.0; sign by Week 12 |
| O04 | DBA unavailable for migration review | P1 | Pre-train backup DBA; schedule migration reviews weekly in Phase 5.0 |

---

## 7. Risk Heatmap

```
Likelihood
High  │ B02    ·    ·    B06
      │  ·    T04   ·     ·
Med   │ T01   T07  B03   T02
      │  ·    B04  T05    ·
Low   │ D01   D02  T03   T08
      └────────────────────── Impact
           Low   Med  High  Crit
```

---

## 8. Risk Response Plan

### Escalation Path
```
Developer discovers risk
  └→ Report to Engineering Lead (same day)
       └→ Engineering Lead classifies P0/P1/P2
            └→ P0: Immediate team meeting + mitigation sprint
            └→ P1: Add to next sprint, assign owner
            └→ P2: Add to backlog, review quarterly
```

### Risk Review Cadence
- **Weekly:** Review all P0/P1 risks in sprint planning
- **Monthly:** Review full risk register; close resolved risks
- **Per-Phase:** Full risk re-assessment at each verification gate
