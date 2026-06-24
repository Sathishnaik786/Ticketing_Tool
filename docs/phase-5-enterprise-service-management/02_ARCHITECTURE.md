# 02 — System Architecture
# Phase 5.0: Enterprise Service Management Platform

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                │
│  React 18 + TypeScript + TanStack Query + shadcn/ui + Vite 5       │
│                                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ Workflow │ │   SLA    │ │ Service  │ │   AI     │ │Executive │ │
│  │ Builder  │ │Dashboard │ │ Catalog  │ │ Copilot  │ │Intelligence│ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
└─────────────────────────┬───────────────────────────────────────────┘
                          │ HTTPS + WSS
┌─────────────────────────▼───────────────────────────────────────────┐
│                         API GATEWAY LAYER                           │
│  Express.js + JWT Middleware + RBAC Middleware + Rate Limiting       │
│                                                                     │
│  /api/v1/workflows    /api/v1/sla       /api/v1/catalog             │
│  /api/v1/automation   /api/v1/ai        /api/v1/executive           │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────────┐
│                         SERVICE LAYER                               │
│                                                                     │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐       │
│  │ Workflow   │ │ SLA Engine │ │ Automation │ │ AI Copilot │       │
│  │ Engine     │ │ Service    │ │ Engine     │ │ Service    │       │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘       │
│                                                                     │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐                      │
│  │ Service    │ │ Executive  │ │ Audit &    │                      │
│  │ Catalog    │ │ Analytics  │ │ Compliance │                      │
│  └────────────┘ └────────────┘ └────────────┘                      │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────────┐
│                         PROCESSING LAYER                            │
│                                                                     │
│  BullMQ Job Queue (Redis)     │  Event Emitter (in-process)         │
│  ┌──────────────────────────┐ │  ┌──────────────────────────┐       │
│  │ SLA Breach Cron (1min)   │ │  │ Workflow Step Execution   │       │
│  │ Auto Escalation (5min)   │ │  │ Automation Rule Trigger   │       │
│  │ AI Processing Queue      │ │  │ Notification Dispatch     │       │
│  │ Report Generation        │ │  └──────────────────────────┘       │
│  └──────────────────────────┘                                       │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────────┐
│                         DATA LAYER                                  │
│                                                                     │
│  Supabase PostgreSQL (Primary)     Redis (Cache + Queue)            │
│  ┌──────────────────────────────┐  ┌────────────────────────┐       │
│  │ workflows / workflow_steps   │  │ Session cache           │       │
│  │ sla_policies / sla_breaches  │  │ Dashboard aggregates    │       │
│  │ service_catalogs             │  │ AI suggestion cache     │       │
│  │ automation_rules             │  │ BullMQ job queues       │       │
│  │ ai_interactions              │  └────────────────────────┘       │
│  │ audit_logs (immutable)       │                                   │
│  └──────────────────────────────┘                                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Module Architecture Map

### Backend Modules (Express.js)

```
backend/src/modules/
├── workflow-engine/
│   ├── workflow.controller.js
│   ├── workflow.service.js
│   ├── workflow-execution.service.js
│   ├── workflow.repository.js
│   ├── workflow.routes.js
│   ├── workflow.validators.js
│   ├── workflow.events.js
│   └── jobs/
│       └── workflow-step-processor.job.js
│
├── sla-engine/
│   ├── sla.controller.js
│   ├── sla-policy.service.js
│   ├── sla-enforcement.service.js
│   ├── sla-breach.service.js
│   ├── sla.repository.js
│   ├── sla.routes.js
│   └── jobs/
│       ├── sla-monitor.cron.js        # Every 1 min
│       └── sla-escalation.job.js
│
├── service-catalog/
│   ├── catalog.controller.js
│   ├── catalog.service.js
│   ├── catalog-form.service.js
│   ├── service-request.service.js
│   ├── catalog.repository.js
│   └── catalog.routes.js
│
├── automation-engine/
│   ├── automation.controller.js
│   ├── automation.service.js
│   ├── rule-evaluator.service.js
│   ├── action-executor.service.js
│   ├── automation.repository.js
│   ├── automation.routes.js
│   └── jobs/
│       └── automation-processor.job.js
│
├── executive-intelligence/
│   ├── executive.controller.js
│   ├── kpi.service.js
│   ├── forecasting.service.js
│   ├── executive.repository.js
│   └── executive.routes.js
│
├── ai-copilot/
│   ├── ai.controller.js
│   ├── ai-summarization.service.js
│   ├── ai-suggestions.service.js
│   ├── ai-classification.service.js
│   ├── rag.service.js
│   ├── ai-feedback.service.js
│   ├── llm-provider.service.js       # Provider abstraction
│   └── ai.routes.js
│
└── audit-compliance/
    ├── audit.controller.js
    ├── audit.service.js
    ├── audit.repository.js
    └── audit.routes.js
```

### Frontend Modules (React)

```
frontend/src/modules/
├── workflow-engine/
│   ├── pages/
│   │   ├── WorkflowListPage.tsx
│   │   ├── WorkflowBuilderPage.tsx
│   │   └── WorkflowAnalyticsPage.tsx
│   ├── components/
│   │   ├── WorkflowCanvas.tsx        # Visual drag-drop builder
│   │   ├── WorkflowStepNode.tsx
│   │   ├── WorkflowConditionEditor.tsx
│   │   └── WorkflowExecution.tsx
│   ├── hooks/
│   │   └── useWorkflow.ts
│   └── services/
│       └── workflowApi.ts
│
├── sla-engine/
│   ├── pages/
│   │   ├── SlaPolicyListPage.tsx
│   │   ├── SlaPolicyBuilderPage.tsx
│   │   └── SlaAnalyticsDashboardPage.tsx
│   ├── components/
│   │   ├── SlaPolicyCard.tsx
│   │   ├── SlaBreachTable.tsx
│   │   └── SlaEscalationMatrix.tsx
│   └── hooks/
│       └── useSlaPolicy.ts
│
├── service-catalog/
│   ├── pages/
│   │   ├── CatalogHomePage.tsx
│   │   ├── CatalogItemPage.tsx
│   │   ├── ServiceRequestPage.tsx
│   │   └── CatalogAdminPage.tsx
│   ├── components/
│   │   ├── CatalogCard.tsx
│   │   ├── DynamicFormRenderer.tsx
│   │   └── RequestTracker.tsx
│   └── hooks/
│       └── useServiceCatalog.ts
│
├── automation-rules/
│   ├── pages/
│   │   ├── RuleListPage.tsx
│   │   └── RuleBuilderPage.tsx
│   ├── components/
│   │   ├── RuleConditionBuilder.tsx
│   │   ├── RuleActionEditor.tsx
│   │   └── AutomationLogTable.tsx
│   └── hooks/
│       └── useAutomationRules.ts
│
├── executive-intelligence/
│   ├── pages/
│   │   ├── ExecutiveDashboardPage.tsx (existing — enhance)
│   │   ├── ServiceHealthPage.tsx
│   │   ├── CapacityPlanningPage.tsx
│   │   └── DepartmentInsightsPage.tsx
│   └── components/
│       ├── KpiScorecard.tsx
│       ├── TrendChart.tsx
│       └── ForecastPanel.tsx
│
└── ai-copilot/
    ├── pages/
    │   └── AiCopilotSettingsPage.tsx
    ├── components/
    │   ├── AiSummaryWidget.tsx
    │   ├── AiResponseSuggestion.tsx
    │   ├── AiClassificationBadge.tsx
    │   └── AiFeedbackCollector.tsx
    └── hooks/
        └── useAiCopilot.ts
```

---

## 3. Technology Stack

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Frontend Framework | React | 18.x | Existing |
| Frontend Language | TypeScript | 5.x | Existing |
| Frontend Build | Vite | 5.x | Existing |
| UI Components | shadcn/ui + Radix | Latest | Existing |
| State/Cache | TanStack Query | v5 | Existing |
| Backend Runtime | Node.js + Express | 18+ LTS | Existing |
| Database | Supabase PostgreSQL | 15 | Existing |
| Realtime | Supabase Realtime + Socket.IO | Current | Existing |
| Job Queue | BullMQ (new) | 5.x | **NEW** |
| Cache | Redis (new) | 7.x | **NEW** |
| AI Provider | Vertex AI / OpenAI | API | **NEW** |
| Vector DB | pgvector (new) | 0.5+ | **NEW** |
| Workflow Render | React Flow (new) | 11.x | **NEW** |

---

## 4. API Versioning Strategy

All Phase 5 APIs go under `/api/v2/`:
- `/api/v2/workflows`
- `/api/v2/sla`
- `/api/v2/catalog`
- `/api/v2/automation`
- `/api/v2/intelligence`
- `/api/v2/ai`
- `/api/v2/audit`

Existing `/api/v1/` routes remain unchanged.

---

## 5. Integration Architecture

```
Supabase Realtime ──► Workflow Step Completion Events
Socket.IO        ──► Agent presence + live ticket updates
BullMQ           ──► SLA monitoring + automation execution
Redis            ──► Cache dashboard aggregates (TTL: 60s)
pgvector         ──► Knowledge base embedding search (RAG)
LLM API          ──► AI summarization/suggestions/classification
```
