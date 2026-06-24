# 19 — Implementation Roadmap
# Phase 5.0: Enterprise Service Management Platform

---

## 1. Executive Timeline

```
PHASE 5.0 — Foundation (8 weeks)
Week 1–2:  Infrastructure + DB Schema + Workflow Engine Core
Week 3–4:  Workflow Builder UI + SLA Policy Engine
Week 5–6:  SLA Enforcement + Cron Jobs + Notifications
Week 7–8:  Audit Framework + Integration Tests + Verification Gate

PHASE 5.1 — Self-Service & Automation (8 weeks)
Week 9–10:  Service Catalog DB + Backend
Week 11–12: Catalog Frontend + Dynamic Forms
Week 13–14: Automation Rules Engine Backend
Week 15–16: Automation Builder UI + Integration Tests + Verification Gate

PHASE 5.2 — Intelligence (6 weeks)
Week 17–18: Executive Intelligence DB + KPI Services
Week 19–20: Dashboard Pages + Chart Components
Week 21–22: Report Generation + Performance Tuning + Verification Gate

PHASE 5.3 — AI Copilot (9 weeks)
Week 23–25: LLM Provider Integration + RAG Pipeline
Week 26–27: AI Features (Summary, Suggestions, Classification)
Week 28–29: AI Panel UI Rewrite + Feedback Loop
Week 30–31: Security Audit + Performance Test + Penetration Test + GA Release

TOTAL TIMELINE: ~31 weeks (~7.5 months)
```

---

## 2. Phase 5.0 — Detailed Sprint Plan

### Sprint 1 (Week 1–2): Infrastructure
| Task | Owner | Effort | Priority |
|---|---|---|---|
| Provision Redis (dev + staging) | DevOps | 1d | P0 |
| Install + configure BullMQ | Backend | 1d | P0 |
| Create workflow DB migration | DBA | 2d | P0 |
| Create SLA engine DB migration | DBA | 1d | P0 |
| Create audit_logs DB migration | DBA | 1d | P0 |
| Backend: workflow-engine module scaffold | Backend | 2d | P0 |
| Backend: sla-engine module scaffold | Backend | 1d | P0 |
| Update feature flag config (frontend + backend) | Frontend | 0.5d | P0 |
| Add BullMQ queue definitions | Backend | 1d | P1 |

### Sprint 2 (Week 3–4): Workflow Builder + SLA Core
| Task | Owner | Effort | Priority |
|---|---|---|---|
| Workflow CRUD APIs (list, create, update, publish) | Backend | 3d | P0 |
| Install reactflow + WorkflowCanvas component | Frontend | 2d | P0 |
| WorkflowListPage + WorkflowBuilderPage scaffold | Frontend | 2d | P0 |
| Step palette (approval, notification, action nodes) | Frontend | 2d | P1 |
| SLA policy CRUD APIs | Backend | 2d | P0 |
| SlaPolicyListPage + SlaPolicyBuilderPage | Frontend | 2d | P0 |
| SLA assignment on ticket create (hook into ticketing module) | Backend | 1d | P0 |

### Sprint 3 (Week 5–6): Execution + Enforcement
| Task | Owner | Effort | Priority |
|---|---|---|---|
| Workflow execution engine (start, advance, complete) | Backend | 3d | P0 |
| Step approval/reject endpoints | Backend | 1d | P0 |
| Workflow step notification integration | Backend | 1d | P1 |
| SLA monitor cron job (BullMQ repeatable) | Backend | 2d | P0 |
| SLA breach detection + escalation | Backend | 2d | P0 |
| SLA notification dispatching | Backend | 1d | P1 |
| WorkflowExecution detail view (frontend) | Frontend | 2d | P1 |

### Sprint 4 (Week 7–8): Audit + Testing + Gate
| Task | Owner | Effort | Priority |
|---|---|---|---|
| Audit service implementation | Backend | 2d | P0 |
| Hook audit service into workflow + SLA + ticket services | Backend | 1d | P0 |
| Phase 5.0 unit tests (all modules) | All | 3d | P0 |
| Phase 5.0 integration tests | Backend | 2d | P0 |
| Phase 5.0 E2E tests (Playwright) | Frontend | 2d | P1 |
| SLA analytics page + breach table | Frontend | 2d | P1 |
| Verification gate review + sign-off | All | 1d | P0 |

---

## 3. Phase 5.1 — Detailed Sprint Plan

### Sprint 5 (Week 9–10): Service Catalog Foundation
| Task | Owner | Effort |
|---|---|---|
| Catalog DB migration (categories, items, forms, fields, requests) | DBA | 2d |
| Catalog CRUD APIs | Backend | 3d |
| Service request submission API (with form validation) | Backend | 2d |
| Ticket auto-creation from service request | Backend | 1d |
| Workflow auto-start from service request | Backend | 1d |

### Sprint 6 (Week 11–12): Catalog Frontend
| Task | Owner | Effort |
|---|---|---|
| CatalogHomePage (browse, search, categories) | Frontend | 2d |
| CatalogItemPage (detail + SLA info) | Frontend | 1d |
| DynamicFormRenderer (all field types) | Frontend | 3d |
| ServiceRequestPage (step wizard) | Frontend | 2d |
| MyRequestsPage (tracking) | Frontend | 1d |
| CatalogAdminPage (item management) | Frontend | 1d |

### Sprint 7 (Week 13–14): Automation Backend
| Task | Owner | Effort |
|---|---|---|
| Automation rules DB migration | DBA | 1d |
| Rule CRUD APIs | Backend | 2d |
| Rule evaluator service (all operators) | Backend | 3d |
| Action executor service (all action types) | Backend | 2d |
| BullMQ automation event worker | Backend | 2d |
| Webhook action SSRF protection | Backend (Security) | 1d |

### Sprint 8 (Week 15–16): Automation Frontend + Gate
| Task | Owner | Effort |
|---|---|---|
| RuleListPage + enable/disable toggle | Frontend | 1d |
| RuleBuilderPage (trigger + conditions + actions) | Frontend | 3d |
| AutomationLogPage | Frontend | 1d |
| Rule test mode (simulate against tickets) | Frontend + Backend | 2d |
| Phase 5.1 unit + integration + E2E tests | All | 3d |
| Verification gate review + sign-off | All | 1d |

---

## 4. Phase 5.2 — Intelligence Sprint Plan

### Sprint 9 (Week 17–18): Intelligence Foundation
| Task | Owner | Effort |
|---|---|---|
| Intelligence snapshot DB migration | DBA | 1d |
| KPI service (MTTR, MTTA, SLA %, FCR) | Backend | 3d |
| Daily snapshot cron job | Backend | 2d |
| Executive KPI API endpoints | Backend | 2d |

### Sprint 10 (Week 19–20): Dashboard Pages
| Task | Owner | Effort |
|---|---|---|
| ExecutiveCommandPage (KPI scorecard + 4 widgets) | Frontend | 3d |
| ServiceHealthPage (breach heatmap + volume) | Frontend | 2d |
| CapacityPlanningPage (agent workload + forecast) | Frontend | 2d |
| DepartmentInsightsPage | Frontend | 2d |
| Redis caching for all dashboard APIs | Backend | 1d |

### Sprint 11 (Week 21–22): Reports + Gate
| Task | Owner | Effort |
|---|---|---|
| PDF report generation (BullMQ job) | Backend | 2d |
| Weekly email report cron | Backend | 1d |
| Volume forecasting algorithm | Backend | 2d |
| Performance testing (k6) | DevOps | 2d |
| Verification gate review + sign-off | All | 1d |

---

## 5. Phase 5.3 — AI Sprint Plan

### Sprint 12–13 (Week 23–25): LLM Foundation
| Task | Owner | Effort |
|---|---|---|
| AI copilot DB migration (ai_suggestions, ai_feedback, ai_interactions) | DBA | 1d |
| pgvector extension enable + kb_embeddings migration | DBA | 1d |
| LLM provider service (Vertex + OpenAI + fallback) | Backend | 3d |
| PII scrubbing + safety filter | Backend (Security) | 2d |
| RAG service (chunker + embedder + similarity search) | Backend | 3d |
| KB article indexing pipeline (batch job) | Backend | 2d |

### Sprint 14 (Week 26–27): AI Features
| Task | Owner | Effort |
|---|---|---|
| Ticket summarization endpoint + caching | Backend | 2d |
| Response suggestions endpoint | Backend | 1d |
| KB knowledge suggestions endpoint | Backend | 1d |
| Duplicate detection endpoint | Backend | 2d |
| Sentiment analysis + risk detection | Backend | 2d |
| AI rate limiting + cost controls | Backend | 1d |

### Sprint 15 (Week 28–29): AI Frontend
| Task | Owner | Effort |
|---|---|---|
| AiAssistPanel rewrite (real API, 4 tabs) | Frontend | 3d |
| AI feedback buttons (accept/reject/thumbs) | Frontend | 1d |
| Confidence score warning display | Frontend | 1d |
| AiCopilotSettingsPage (admin config) | Frontend | 2d |
| AI usage analytics widget | Frontend | 1d |

### Sprint 16 (Week 30–31): Security + GA
| Task | Owner | Effort |
|---|---|---|
| External penetration test | Security Firm | 3d |
| Remediate pen test findings | All | 3d |
| Full E2E regression test suite | QA | 2d |
| Performance test (all Phase 5 features) | DevOps | 2d |
| Accessibility audit (all new pages) | Frontend | 1d |
| GA release preparation + runbook | All | 2d |

---

## 6. Effort Summary

| Phase | Duration | Backend (days) | Frontend (days) | DevOps (days) | QA (days) |
|---|---|---|---|---|---|
| 5.0 Foundation | 8 weeks | 25 | 20 | 3 | 8 |
| 5.1 Self-Service | 8 weeks | 25 | 20 | 2 | 8 |
| 5.2 Intelligence | 6 weeks | 15 | 15 | 3 | 5 |
| 5.3 AI Copilot | 9 weeks | 25 | 15 | 2 | 10 |
| **Total** | **31 weeks** | **90 days** | **70 days** | **10 days** | **31 days** |

**Team assumption:** 2 backend engineers, 2 frontend engineers, 1 DevOps, 1 QA

---

## 7. Dependencies & Critical Path

```
Redis + BullMQ setup (Week 1)
  └→ SLA cron can run (Week 5)
      └→ SLA analytics available (Week 8)

Workflow DB migration (Week 1)
  └→ Workflow execution engine (Week 5)
      └→ Catalog can trigger workflows (Week 10)
          └→ Service requests use workflows (Week 12)

Supabase pgvector (Week 23)
  └→ KB embedding pipeline (Week 24)
      └→ RAG knowledge suggestions (Week 27)
          └→ AI panel knowledge tab (Week 29)

LLM provider contract (by Week 12)
  └→ AI development can start (Week 23)
```

---

## 8. Definition of Done (Per Phase)

✅ All unit tests pass (≥ 80% coverage for new code)  
✅ All integration tests pass  
✅ At least 3 E2E tests per major user journey  
✅ Performance: page load < 2s, API P95 < 500ms  
✅ Zero `axe-core` critical accessibility violations  
✅ Security checklist reviewed and signed off  
✅ Feature flag off by default in production  
✅ Dark mode tested on all new pages  
✅ Mobile responsiveness tested at 375px and 768px  
✅ All existing Phase 0–4 tests still passing  
✅ Walkthrough document updated  
✅ Product Owner sign-off  
