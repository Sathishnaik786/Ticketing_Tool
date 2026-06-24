# 13 — Feature Flags
# Phase 5.0: Enterprise Service Management Platform

---

## 1. Overview

All Phase 5.0 features are controlled by environment variable feature flags. Every new feature is **off by default** until explicitly enabled in the environment configuration. This ensures zero impact on existing functionality during incremental rollout.

---

## 2. New Phase 5.0 Feature Flags

### Frontend (`.env` / `VITE_` prefix)

| Flag | Type | Default | Description |
|---|---|---|---|
| `VITE_ENABLE_WORKFLOW_ENGINE` | boolean | `false` | Visual workflow builder + execution engine |
| `VITE_ENABLE_SLA_ENGINE` | boolean | `false` | SLA policy enforcement + analytics |
| `VITE_ENABLE_SERVICE_CATALOG` | boolean | `false` | Self-service catalog + request portal |
| `VITE_ENABLE_AUTOMATION_ENGINE` | boolean | `false` | IF/THEN automation rules builder |
| `VITE_ENABLE_EXECUTIVE_INTELLIGENCE` | boolean | `false` | Strategic KPI dashboards + forecasting |
| `VITE_ENABLE_AI_COPILOT` | boolean | `false` | Production AI assistant (real LLM) |
| `VITE_ENABLE_AUDIT_LOG` | boolean | `false` | Immutable audit log viewer |

### Backend (`.env` / no prefix)

| Flag | Type | Default | Description |
|---|---|---|---|
| `ENABLE_WORKFLOW_ENGINE` | boolean | `false` | Workflow execution service + jobs |
| `ENABLE_SLA_ENGINE` | boolean | `false` | SLA enforcement + cron jobs |
| `ENABLE_SERVICE_CATALOG` | boolean | `false` | Catalog + service request service |
| `ENABLE_AUTOMATION_ENGINE` | boolean | `false` | Rule evaluation + BullMQ processor |
| `ENABLE_EXECUTIVE_INTELLIGENCE` | boolean | `false` | KPI aggregation + snapshot jobs |
| `ENABLE_AI_COPILOT` | boolean | `false` | LLM provider + RAG service |
| `ENABLE_AUDIT_LOG` | boolean | `true` | Audit logging (recommended always on) |
| `ENABLE_JOB_QUEUE` | boolean | `false` | BullMQ + Redis job queue |

---

## 3. Existing Flags (Preserved)

```
VITE_ENABLE_TICKETING=true
VITE_ENABLE_TICKET_FEEDBACK=true
VITE_ENABLE_TICKET_ASSIGNMENTS=true
VITE_ENABLE_COMMUNICATION_TRACKING=true
VITE_ENABLE_APPROVAL_ENGINE=true
VITE_ENABLE_KNOWLEDGE_BASE=true
VITE_ENABLE_EXECUTIVE_ANALYTICS=true
VITE_ENABLE_NOTIFICATION_CENTER=true
VITE_ENABLE_ETMS_UI_V2=true
VITE_ENABLE_ETMS_NAVIGATION=true
VITE_ENABLE_ETMS_DASHBOARD=true
VITE_ENABLE_ETMS_NOTIFICATIONS=true
VITE_ENABLE_OBSERVABILITY=true
```

---

## 4. Frontend Feature Flag Pattern

```typescript
// frontend/src/config/features.ts — Phase 5.0 additions (additive)

// Workflow Engine
export const isWorkflowEngineEnabled =
  import.meta.env.VITE_ENABLE_WORKFLOW_ENGINE === 'true';

// SLA Policy Engine
export const isSlaEngineEnabled =
  import.meta.env.VITE_ENABLE_SLA_ENGINE === 'true';

// Service Catalog
export const isServiceCatalogEnabled =
  import.meta.env.VITE_ENABLE_SERVICE_CATALOG === 'true';

// Automation Rules Engine
export const isAutomationEngineEnabled =
  import.meta.env.VITE_ENABLE_AUTOMATION_ENGINE === 'true';

// Executive Intelligence Platform
export const isExecutiveIntelligenceEnabled =
  import.meta.env.VITE_ENABLE_EXECUTIVE_INTELLIGENCE === 'true';

// AI Copilot (production)
export const isAiCopilotEnabled =
  import.meta.env.VITE_ENABLE_AI_COPILOT === 'true';

// Audit Log viewer
export const isAuditLogEnabled =
  import.meta.env.VITE_ENABLE_AUDIT_LOG === 'true';
```

### Registering new flags in `isFeatureFlagEnabled()`

```typescript
// Add to the map in features.ts isFeatureFlagEnabled():
VITE_ENABLE_WORKFLOW_ENGINE:        isWorkflowEngineEnabled,
VITE_ENABLE_SLA_ENGINE:             isSlaEngineEnabled,
VITE_ENABLE_SERVICE_CATALOG:        isServiceCatalogEnabled,
VITE_ENABLE_AUTOMATION_ENGINE:      isAutomationEngineEnabled,
VITE_ENABLE_EXECUTIVE_INTELLIGENCE: isExecutiveIntelligenceEnabled,
VITE_ENABLE_AI_COPILOT:             isAiCopilotEnabled,
VITE_ENABLE_AUDIT_LOG:              isAuditLogEnabled,
```

---

## 5. Backend Feature Flag Pattern

```javascript
// backend/src/config/features.js
module.exports = {
  isWorkflowEngineEnabled:        process.env.ENABLE_WORKFLOW_ENGINE === 'true',
  isSlaEngineEnabled:             process.env.ENABLE_SLA_ENGINE === 'true',
  isServiceCatalogEnabled:        process.env.ENABLE_SERVICE_CATALOG === 'true',
  isAutomationEngineEnabled:      process.env.ENABLE_AUTOMATION_ENGINE === 'true',
  isExecutiveIntelligenceEnabled: process.env.ENABLE_EXECUTIVE_INTELLIGENCE === 'true',
  isAiCopilotEnabled:             process.env.ENABLE_AI_COPILOT === 'true',
  isAuditLogEnabled:              process.env.ENABLE_AUDIT_LOG !== 'false', // default ON
  isJobQueueEnabled:              process.env.ENABLE_JOB_QUEUE === 'true',
};

// Usage in route registration (app.js)
if (features.isWorkflowEngineEnabled) {
  app.use('/api/v2/workflows', require('./modules/workflow-engine/workflow.routes'));
}
```

---

## 6. Rollout Strategy

### Phase 5.0 (Weeks 1–8): Foundation
```env
# Enable for development/staging only
VITE_ENABLE_WORKFLOW_ENGINE=true
VITE_ENABLE_SLA_ENGINE=true
ENABLE_WORKFLOW_ENGINE=true
ENABLE_SLA_ENGINE=true
ENABLE_JOB_QUEUE=true
ENABLE_AUDIT_LOG=true
```

### Phase 5.1 (Weeks 9–16): Catalog + Automation
```env
VITE_ENABLE_SERVICE_CATALOG=true
VITE_ENABLE_AUTOMATION_ENGINE=true
ENABLE_SERVICE_CATALOG=true
ENABLE_AUTOMATION_ENGINE=true
```

### Phase 5.2 (Weeks 17–22): Intelligence
```env
VITE_ENABLE_EXECUTIVE_INTELLIGENCE=true
ENABLE_EXECUTIVE_INTELLIGENCE=true
```

### Phase 5.3 (Weeks 23–31): AI Copilot
```env
VITE_ENABLE_AI_COPILOT=true
ENABLE_AI_COPILOT=true
AI_PROVIDER=vertex
AI_FALLBACK_PROVIDER=openai
```

---

## 7. `.env.example` Template (Full Phase 5)

```env
# ==========================================
# TICKETRA ETMS — Phase 5 Environment
# ==========================================

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Redis (for BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# AI Providers
AI_PROVIDER=vertex
AI_FALLBACK_PROVIDER=openai
GOOGLE_VERTEX_PROJECT_ID=your-project
GOOGLE_VERTEX_LOCATION=us-central1
OPENAI_API_KEY=sk-...

# Phase 0–4 Feature Flags
VITE_ENABLE_TICKETING=true
VITE_ENABLE_TICKET_FEEDBACK=true
VITE_ENABLE_TICKET_ASSIGNMENTS=true
VITE_ENABLE_COMMUNICATION_TRACKING=true
VITE_ENABLE_APPROVAL_ENGINE=true
VITE_ENABLE_KNOWLEDGE_BASE=true
VITE_ENABLE_EXECUTIVE_ANALYTICS=true
VITE_ENABLE_NOTIFICATION_CENTER=true
VITE_ENABLE_ETMS_UI_V2=true
VITE_ENABLE_ETMS_NAVIGATION=true
VITE_ENABLE_ETMS_DASHBOARD=true
VITE_ENABLE_ETMS_NOTIFICATIONS=true

# Phase 5.0 Feature Flags (start all false in prod until validated)
VITE_ENABLE_WORKFLOW_ENGINE=false
VITE_ENABLE_SLA_ENGINE=false
VITE_ENABLE_SERVICE_CATALOG=false
VITE_ENABLE_AUTOMATION_ENGINE=false
VITE_ENABLE_EXECUTIVE_INTELLIGENCE=false
VITE_ENABLE_AI_COPILOT=false
VITE_ENABLE_AUDIT_LOG=true

ENABLE_WORKFLOW_ENGINE=false
ENABLE_SLA_ENGINE=false
ENABLE_SERVICE_CATALOG=false
ENABLE_AUTOMATION_ENGINE=false
ENABLE_EXECUTIVE_INTELLIGENCE=false
ENABLE_AI_COPILOT=false
ENABLE_AUDIT_LOG=true
ENABLE_JOB_QUEUE=false
```

---

## 8. Feature Flag Testing

Every new feature flag must have a test in `featureFlagMatrix.test.ts`:

```typescript
// frontend/src/config/featureFlagMatrix.test.ts (extend existing)
describe('Phase 5.0 Feature Flags', () => {
  it('isWorkflowEngineEnabled defaults to false', () => {
    expect(isWorkflowEngineEnabled).toBe(false);
  });
  it('isAuditLogEnabled defaults to true', () => {
    expect(isAuditLogEnabled).toBe(true);
  });
  // ... one test per flag
});
```
