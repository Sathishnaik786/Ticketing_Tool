# 10 — Backend Design
# Phase 5.0: Enterprise Service Management Platform

---

## 1. Overview

The backend extends the existing Express.js + Supabase architecture with six new modules under `backend/src/modules/`. Each module follows a layered architecture: **Routes → Controller → Service → Repository**.

All new routes are versioned under `/api/v2/` and do not touch existing `/api/v1/` endpoints.

---

## 2. Module Structure Template

Each new module follows this internal structure:

```
backend/src/modules/<module-name>/
├── <module>.controller.js     # HTTP request handling, validation delegation
├── <module>.service.js        # Business logic, orchestration
├── <module>.repository.js     # Database queries (Supabase client)
├── <module>.routes.js         # Express Router with RBAC middleware
├── <module>.validators.js     # Joi/Zod schemas for request validation
├── <module>.events.js         # EventEmitter definitions for internal events
├── <module>.types.js          # JSDoc type definitions
└── jobs/                      # BullMQ job handlers (if applicable)
    └── <job-name>.job.js
```

---

## 3. Workflow Engine Module

### `workflow.routes.js`
```javascript
const router = express.Router();
router.use(authenticate);                           // JWT required

// Workflow CRUD
router.get('/',          rbac(['ADMIN']),           workflowController.list);
router.post('/',         rbac(['ADMIN']),           workflowController.create);
router.get('/:id',       rbac(['ADMIN','MANAGER']), workflowController.getById);
router.put('/:id',       rbac(['ADMIN']),           workflowController.update);
router.delete('/:id',    rbac(['ADMIN']),           workflowController.softDelete);
router.post('/:id/publish', rbac(['ADMIN']),        workflowController.publish);
router.post('/:id/clone',   rbac(['ADMIN']),        workflowController.clone);

// Executions
router.post('/executions',           authenticate,  executionController.start);
router.get('/executions/:id',        authenticate,  executionController.getById);
router.post('/executions/:id/cancel',authenticate,  executionController.cancel);

// Step decisions
router.post('/step-executions/:id/approve',  authenticate, stepController.approve);
router.post('/step-executions/:id/reject',   authenticate, stepController.reject);
router.post('/step-executions/:id/delegate', authenticate, stepController.delegate);

// Analytics
router.get('/analytics/summary', rbac(['ADMIN','MANAGER']), workflowController.analyticsSummary);
```

### `workflow.service.js` — Key Methods
```javascript
class WorkflowService {
  async createWorkflow(tenantId, dto, createdBy)        // Validates + inserts
  async publishVersion(workflowId, userId)               // Validates graph, creates version
  async startExecution(workflowId, entityType, entityId, context, startedBy)
  async advanceExecution(executionId, decision, decidedBy, notes)
  async handleStepTimeout(stepExecutionId)               // Called by BullMQ job
  async evaluateConditions(step, executionContext)        // Branching logic
  async resolveApprovers(stepConfig, context)            // Dynamic approver resolution
}
```

### `workflow-execution.service.js` — Execution State Machine
```javascript
class WorkflowExecutionService {
  // State transitions
  TRANSITIONS = {
    RUNNING: ['COMPLETED', 'CANCELLED', 'FAILED'],
    PENDING: ['IN_PROGRESS', 'SKIPPED'],
    IN_PROGRESS: ['APPROVED', 'REJECTED'],
  };

  async processStep(stepExecution) {
    // 1. Notify assigned approvers
    // 2. Schedule timeout job via BullMQ
    // 3. Update execution current_step_key
  }

  async onStepDecision(stepExecutionId, decision, actor, notes) {
    // 1. Record decision
    // 2. Evaluate next step conditions
    // 3. Create next step_execution record
    // 4. OR mark execution COMPLETED if no more steps
  }
}
```

### `jobs/workflow-escalation.job.js`
```javascript
// BullMQ worker — processes 'workflow:escalations' queue
// Triggered when step due_at is passed
// Action: reassign to escalation approver, notify, log
```

---

## 4. SLA Engine Module

### `sla-enforcement.service.js` — Core Logic
```javascript
class SlaEnforcementService {
  async assignSlaToTicket(ticketId, priority, departmentId) {
    // 1. Find matching policy (department-specific > default)
    // 2. Find matching target for priority
    // 3. Calculate response_due_at and resolution_due_at
    // 4. Insert sla_assignments record
    // 5. Schedule SLA monitor job
  }

  async recordFirstResponse(ticketId, respondedAt) {
    // Update sla_assignments.response_met_at if not already set
  }

  async pauseSla(ticketId, reason) {
    // Set paused_at = NOW() on sla_assignments
  }

  async resumeSla(ticketId) {
    // Calculate pause duration, extend due dates, clear paused_at
  }
}
```

### `jobs/sla-monitor.cron.js`
```javascript
// BullMQ repeatable job — every 1 minute
// Queries sla_assignments for at-risk tickets
// Creates sla_breaches records
// Creates sla_escalations records
// Dispatches notifications via NotificationService
// Updates intelligence_snapshots (async)
```

---

## 5. Service Catalog Module

### `catalog.service.js` — Key Methods
```javascript
class CatalogService {
  async listCategories(tenantId, visibleToRole)
  async getCatalogItems(tenantId, filters)               // Filter by category, search
  async getCatalogItemWithForm(catalogId)
  async submitServiceRequest(catalogId, requesterId, formData) {
    // 1. Validate form data against form definition
    // 2. Create service_requests record + generate request_number
    // 3. Create linked ticket (priority, category, SLA)
    // 4. Start associated workflow execution
    // 5. Apply SLA policy
    // 6. Send confirmation notification
    // 7. Return service_request with tracking info
  }
}
```

### `catalog-form.service.js`
```javascript
class CatalogFormService {
  async validateFormSubmission(formId, formData) {
    // Validate required fields, types, patterns, conditional logic
    // Return { valid: true } or { valid: false, errors: [...] }
  }

  async getCurrentForm(catalogId)
  async createFormVersion(catalogId, fields, userId)
}
```

---

## 6. Automation Engine Module

### `rule-evaluator.service.js`
```javascript
class RuleEvaluatorService {
  async evaluateRulesForEvent(eventType, entity, context) {
    // 1. Load active rules for trigger_type (cached in Redis, TTL 60s)
    // 2. For each rule (ordered by run_order):
    //    a. Evaluate condition groups (AND/OR logic)
    //    b. If matched: queue action execution job
    //    c. If stop_processing=true: break
  }

  evaluateCondition(condition, entity) {
    // Supports: eq, ne, gt, lt, contains, in, is_null, older_than_N_hours
    // Field path resolution: 'ticket.priority', 'ticket.age_hours'
  }
}
```

### `action-executor.service.js`
```javascript
class ActionExecutorService {
  async execute(actionType, config, entity) {
    const executors = {
      set_field:       this.setField,
      assign_to_group: this.assignToGroup,
      send_notification: this.sendNotification,
      add_comment:     this.addComment,
      close_ticket:    this.closeTicket,
      trigger_webhook: this.triggerWebhook,    // With retry queue
      start_workflow:  this.startWorkflow,
      apply_sla_policy:this.applySlaPolicy,
    };
    return await executors[actionType].call(this, config, entity);
  }
}
```

### `jobs/automation-processor.job.js`
```javascript
// BullMQ worker — 'automation:events' queue
// Concurrency: 5 (configurable)
// Timeout: 30s per rule evaluation
// On failure: mark log as failed, do not retry (idempotency risk)
```

---

## 7. AI Copilot Module

### `llm-provider.service.js`
```javascript
class LLMProviderService {
  constructor() {
    this.providers = {
      vertex:   new VertexAIProvider(config.vertex),
      openai:   new OpenAIProvider(config.openai),
    };
    this.primary   = this.providers[config.ai.primaryProvider];
    this.fallback  = this.providers[config.ai.fallbackProvider];
  }

  async complete(request) {
    // 1. Check Redis cache (key: hash(feature+input_fingerprint))
    // 2. If cache hit: return cached + mark cache_hit=true
    // 3. Apply PII scrubber to input
    // 4. Call primary provider with timeout (10s)
    // 5. On failure: call fallback provider
    // 6. Validate output (safety filter)
    // 7. Cache response (TTL: 24h for summaries, 1h for suggestions)
    // 8. Log to ai_interactions
    // 9. Return response
  }
}
```

### `rag.service.js`
```javascript
class RagService {
  async findRelevantChunks(queryText, topK = 5) {
    const embedding = await this.generateEmbedding(queryText);
    // Supabase pgvector query:
    // SELECT chunk_text, article_id, 1 - (embedding <=> $embedding) AS similarity
    // FROM kb_embeddings ORDER BY similarity DESC LIMIT $topK
    return chunks;
  }

  async indexArticle(articleId, articleText) {
    const chunks = this.chunkText(articleText, 500, 50); // size, overlap
    for (const [i, chunk] of chunks.entries()) {
      const embedding = await this.generateEmbedding(chunk);
      await this.upsertEmbedding(articleId, i, chunk, embedding);
    }
  }
}
```

---

## 8. Executive Intelligence Module

### `kpi.service.js`
```javascript
class KpiService {
  async getOverallKpis(tenantId, dateRange, filters) {
    // Try Redis cache first (TTL: 30s)
    // Query intelligence_snapshots or live aggregates
    return { mtta, mttr, slaCompliance, fcr, backlogGrowth, ... };
  }

  async getDepartmentKpis(tenantId, departmentId, dateRange) { ... }
  async getAgentKpis(tenantId, agentId, dateRange) { ... }
  async getVolumeTrend(tenantId, days) { ... }
}
```

### `jobs/snapshot-aggregator.cron.js`
```javascript
// BullMQ cron — runs daily at 01:00
// Aggregates previous day's ticket data
// Upserts into intelligence_snapshots
// Refreshes Redis dashboard cache
```

---

## 9. Audit & Compliance Module

### `audit.service.js`
```javascript
class AuditService {
  // Called by all other services on state mutations
  async log(tenantId, actorId, actorRole, action, entityType, entityId, oldValues, newValues, metadata, req) {
    await this.repository.insert({
      tenant_id: tenantId,
      actor_id: actorId,
      actor_role: actorRole,
      action,                     // 'ticket.status_changed'
      entity_type: entityType,    // 'ticket'
      entity_id: entityId,
      old_values: oldValues,      // Snapshot before change
      new_values: newValues,      // Snapshot after change
      metadata,                   // Additional context
      ip_address: req?.ip,
      user_agent: req?.headers['user-agent'],
    });
  }

  async query(filters, pagination) { ... }  // Immutable — no delete
}
```

---

## 10. Shared Infrastructure

### Middleware (`backend/src/middlewares/`)
```javascript
// rbac.middleware.js — Phase 5 additions
const PERMISSION_MAP = {
  'workflow:manage':  ['SUPER_ADMIN', 'ADMIN'],
  'sla:manage':       ['SUPER_ADMIN', 'ADMIN'],
  'catalog:manage':   ['SUPER_ADMIN', 'ADMIN'],
  'automation:manage':['SUPER_ADMIN', 'ADMIN'],
  'ai:use':           ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'AGENT'],
  'executive:view':   ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'HR'],
  'audit:view':       ['SUPER_ADMIN', 'ADMIN', 'AUDITOR'],
};
```

### Queue Setup (`backend/src/lib/queue.js`)
```javascript
import { Queue, Worker, QueueScheduler } from 'bullmq';

export const queues = {
  workflowEscalations: new Queue('workflow:escalations', { connection: redis }),
  slaMonitor:          new Queue('sla:monitor', { connection: redis }),
  automationEvents:    new Queue('automation:events', { connection: redis }),
  aiProcessing:        new Queue('ai:processing', { connection: redis }),
  reportGeneration:    new Queue('reports:generate', { connection: redis }),
  snapshotAggregation: new Queue('intelligence:snapshots', { connection: redis }),
};
```
