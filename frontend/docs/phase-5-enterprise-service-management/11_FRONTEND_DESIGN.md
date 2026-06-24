# 11 — Frontend Design
# Phase 5.0: Enterprise Service Management Platform

---

## 1. Architecture Conventions

All Phase 5 frontend modules follow the existing Ticketra architecture:
- Feature-flagged at module root (check flag before rendering)
- Lazy-loaded with `React.lazy()` + `Suspense`
- TanStack Query for all server state
- shadcn/ui + ETMS design tokens
- RBAC check via `useAuth()` before rendering admin sections
- `ComponentErrorBoundary` wrapping all data-heavy sections
- Skeleton states for all loading conditions
- Empty states for all zero-data conditions

---

## 2. Route Registration Pattern

```typescript
// frontend/src/config/route-metadata.ts (additive entries only)

// Workflow Engine
{ path: '/app/admin/workflows',              component: lazy(() => import('@/modules/workflow-engine/pages/WorkflowListPage')),       featureFlag: 'VITE_ENABLE_WORKFLOW_ENGINE', roles: ['ADMIN'] },
{ path: '/app/admin/workflows/:id/builder',  component: lazy(() => import('@/modules/workflow-engine/pages/WorkflowBuilderPage')),    featureFlag: 'VITE_ENABLE_WORKFLOW_ENGINE', roles: ['ADMIN'] },

// SLA Engine
{ path: '/app/admin/sla',                   component: lazy(() => import('@/modules/sla-engine/pages/SlaPolicyListPage')),           featureFlag: 'VITE_ENABLE_SLA_ENGINE',      roles: ['ADMIN'] },
{ path: '/app/admin/sla/:id',               component: lazy(() => import('@/modules/sla-engine/pages/SlaPolicyBuilderPage')),        featureFlag: 'VITE_ENABLE_SLA_ENGINE',      roles: ['ADMIN'] },
{ path: '/app/analytics/sla',               component: lazy(() => import('@/modules/sla-engine/pages/SlaAnalyticsDashboardPage')),   featureFlag: 'VITE_ENABLE_SLA_ENGINE',      roles: ['ADMIN','MANAGER','HR'] },

// Service Catalog
{ path: '/app/service-catalog',             component: lazy(() => import('@/modules/service-catalog/pages/CatalogHomePage')),        featureFlag: 'VITE_ENABLE_SERVICE_CATALOG', roles: ['EMPLOYEE','MANAGER','ADMIN'] },
{ path: '/app/service-catalog/:id',         component: lazy(() => import('@/modules/service-catalog/pages/CatalogItemPage')),        featureFlag: 'VITE_ENABLE_SERVICE_CATALOG', roles: ['EMPLOYEE','MANAGER','ADMIN'] },
{ path: '/app/service-requests/new/:id',    component: lazy(() => import('@/modules/service-catalog/pages/ServiceRequestPage')),     featureFlag: 'VITE_ENABLE_SERVICE_CATALOG', roles: ['EMPLOYEE','MANAGER','ADMIN'] },
{ path: '/app/service-requests/my',         component: lazy(() => import('@/modules/service-catalog/pages/MyRequestsPage')),         featureFlag: 'VITE_ENABLE_SERVICE_CATALOG', roles: ['EMPLOYEE','MANAGER','ADMIN'] },

// Automation
{ path: '/app/admin/automation',            component: lazy(() => import('@/modules/automation-rules/pages/RuleListPage')),          featureFlag: 'VITE_ENABLE_AUTOMATION_ENGINE', roles: ['ADMIN'] },
{ path: '/app/admin/automation/:id',        component: lazy(() => import('@/modules/automation-rules/pages/RuleBuilderPage')),       featureFlag: 'VITE_ENABLE_AUTOMATION_ENGINE', roles: ['ADMIN'] },

// Executive Intelligence
{ path: '/app/executive/command',           component: lazy(() => import('@/modules/executive-intelligence/pages/ExecutiveCommandPage')),     featureFlag: 'VITE_ENABLE_EXECUTIVE_INTELLIGENCE', roles: ['ADMIN','MANAGER','HR'] },
{ path: '/app/executive/service-health',    component: lazy(() => import('@/modules/executive-intelligence/pages/ServiceHealthPage')),        featureFlag: 'VITE_ENABLE_EXECUTIVE_INTELLIGENCE', roles: ['ADMIN','MANAGER'] },
{ path: '/app/executive/capacity',          component: lazy(() => import('@/modules/executive-intelligence/pages/CapacityPlanningPage')),     featureFlag: 'VITE_ENABLE_EXECUTIVE_INTELLIGENCE', roles: ['ADMIN','MANAGER'] },

// AI Copilot
{ path: '/app/admin/ai-copilot',            component: lazy(() => import('@/modules/ai-copilot/pages/AiCopilotSettingsPage')),              featureFlag: 'VITE_ENABLE_AI_COPILOT',   roles: ['ADMIN'] },
```

---

## 3. Navigation Registry (Additive)

```typescript
// frontend/src/config/navigation.utils.ts — new ETMS groups

// Admin Settings group
{
  group: 'Configuration',
  items: [
    { label: 'Workflows',    href: '/app/admin/workflows',  icon: 'GitFork',   flag: 'VITE_ENABLE_WORKFLOW_ENGINE',   roles: ['ADMIN'] },
    { label: 'SLA Policies', href: '/app/admin/sla',        icon: 'Shield',    flag: 'VITE_ENABLE_SLA_ENGINE',        roles: ['ADMIN'] },
    { label: 'Automation',   href: '/app/admin/automation', icon: 'Zap',       flag: 'VITE_ENABLE_AUTOMATION_ENGINE', roles: ['ADMIN'] },
    { label: 'AI Copilot',   href: '/app/admin/ai-copilot', icon: 'Bot',       flag: 'VITE_ENABLE_AI_COPILOT',        roles: ['ADMIN'] },
  ]
},

// Service group
{
  group: 'Services',
  items: [
    { label: 'Service Catalog',  href: '/app/service-catalog',       icon: 'Store',        flag: 'VITE_ENABLE_SERVICE_CATALOG',  roles: ['EMPLOYEE','MANAGER','ADMIN'] },
    { label: 'My Requests',      href: '/app/service-requests/my',   icon: 'ClipboardList',flag: 'VITE_ENABLE_SERVICE_CATALOG',  roles: ['EMPLOYEE','MANAGER','ADMIN'] },
  ]
},

// Executive group
{
  group: 'Intelligence',
  items: [
    { label: 'Executive Command', href: '/app/executive/command',        icon: 'LayoutDashboard', flag: 'VITE_ENABLE_EXECUTIVE_INTELLIGENCE', roles: ['ADMIN','MANAGER','HR'] },
    { label: 'Service Health',    href: '/app/executive/service-health', icon: 'Activity',        flag: 'VITE_ENABLE_EXECUTIVE_INTELLIGENCE', roles: ['ADMIN','MANAGER'] },
    { label: 'SLA Analytics',     href: '/app/analytics/sla',           icon: 'BarChart2',       flag: 'VITE_ENABLE_SLA_ENGINE',             roles: ['ADMIN','MANAGER','HR'] },
  ]
},
```

---

## 4. Module: Workflow Engine

### `WorkflowListPage.tsx`
```typescript
// Shows list of workflows with: name, status, version, trigger type, last updated
// Actions: Create, Edit (→ Builder), Publish, Clone, Archive
// Components: DataTable + StatusBadge + VersionTag

const WorkflowListPage = () => {
  const { data, isLoading } = useQuery({ queryKey: ['workflows'], queryFn: workflowApi.list });
  // ComponentErrorBoundary wraps the DataTable
  // Skeleton: 5 rows during load
  // Empty state: "No workflows yet. Create your first workflow."
};
```

### `WorkflowBuilderPage.tsx`
```typescript
// Three-panel layout:
// Left: Step palette (drag sources)
// Center: React Flow canvas (drop target)
// Right: Step properties panel (context-sensitive)
// Bottom bar: Save Draft | Publish | History | Preview

import ReactFlow, { addEdge, Background, Controls } from 'reactflow';

const WorkflowBuilderPage = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // Auto-save draft every 30 seconds
  // Validate before publish: check all nodes connected, no orphan steps
  // Version history in right drawer
};
```

### Custom Node Components
```typescript
// WorkflowStepNode.tsx — Renders step with type icon + status indicator
// StepTypes: APPROVAL, NOTIFICATION, ACTION, CONDITION, PARALLEL_GATE

// WorkflowConditionEdge.tsx — Edge with condition label (e.g., "Priority = CRITICAL")
```

---

## 5. Module: SLA Engine

### `SlaPolicyBuilderPage.tsx`
```typescript
// Form sections:
// 1. Policy name, description, business hours toggle
// 2. Warning threshold slider (50–90%)
// 3. Targets table: per-priority rows with response/resolution minute inputs
// 4. Department override table (optional)

// Save → creates/updates sla_policies + sla_targets
// Activate → sets policy as default (one default per tenant)
```

### `SlaAnalyticsDashboardPage.tsx`
```typescript
// Components:
// - SlaComplianceSummaryCard (overall %)
// - SlaBreachTable (breach list, sortable by overdue time)
// - SlaComplianceTrendChart (30-day recharts LineChart)
// - SlaHeatMap (department × priority matrix)
// - EscalationLogTable

// All components wrapped in ComponentErrorBoundary
// Date range picker: Last 7d / 30d / 90d / Custom
```

---

## 6. Module: Service Catalog

### `CatalogHomePage.tsx`
```typescript
// Layout: Category tabs + search bar + catalog item grid
// Each CatalogCard shows: icon, name, short description, estimated SLA
// Featured section at top (is_featured=true items)
// Search: client-side fuzzy search on loaded catalog items
// Empty state per category: "No services in this category."

const CatalogCard = ({ item }: { item: CatalogItem }) => (
  <Link to={`/app/service-catalog/${item.id}`}>
    <div className="rounded-xl border border-border bg-card p-5 hover:border-primary/50 transition-all hover:shadow-md">
      {/* Icon + Category badge + Name + Short description + SLA badge + CTA */}
    </div>
  </Link>
);
```

### `ServiceRequestPage.tsx`
```typescript
// Dynamic form renderer driven by catalog_fields definition
// Field types: text, textarea, select, multi-select, date, file_upload, user_picker
// Conditional logic: show/hide fields based on other field values
// Step indicator: 1. Fill Form → 2. Review → 3. Submitted
// Submit → calls POST /api/v2/service-requests
// Success: redirect to /app/service-requests/my with success toast

const DynamicFormRenderer = ({ fields, value, onChange }) => {
  // Renders each field based on field_type
  // Applies conditional_logic (show_if)
  // Handles validation_rules (min, max, pattern, required)
};
```

---

## 7. Module: Automation Rules

### `RuleBuilderPage.tsx`
```typescript
// Three-card layout (vertical on mobile, horizontal on desktop):
// Card 1: Trigger selector (dropdown of trigger types)
// Card 2: Conditions builder (add row button, field/operator/value per row)
// Card 3: Actions builder (add row button, action type + config per row)

// Test button: sends rule to /api/v2/automation/rules/:id/test
//   Shows modal with last 10 tickets and MATCHED/NOT MATCHED status

const ConditionRow = ({ condition, fields, onUpdate, onRemove }) => {
  // Field selector (grouped by: Ticket, Requester, SLA, Custom)
  // Operator dropdown (context-sensitive to field type)
  // Value input (string | number | date picker | multi-select)
};

const ActionRow = ({ action, onUpdate, onRemove }) => {
  // Action type selector
  // Dynamic config form based on action type
  //   set_field → field selector + value input
  //   assign_to_group → group selector
  //   send_notification → recipient multi-select + template picker
  //   trigger_webhook → URL input + method + body template textarea
};
```

---

## 8. Module: AI Copilot

### AI Panel Integration (Ticket Detail)
```typescript
// AiAssistPanel.tsx — fully rewritten from mock to real API

const AiAssistPanel = ({ ticketId }: { ticketId: string }) => {
  // Tab 1: Summary — calls POST /api/v2/ai/summarize
  // Tab 2: Suggested Replies — calls POST /api/v2/ai/suggest-responses
  // Tab 3: Knowledge — calls POST /api/v2/ai/suggest-knowledge
  // Tab 4: Classification — calls POST /api/v2/ai/classify

  // Each tab: loading skeleton → content → feedback buttons (👍 / 👎)
  // Feedback calls POST /api/v2/ai/feedback
  // Low confidence → shows "AI confidence: 62% — verify before using" warning
};
```

### `useAiCopilot.ts`
```typescript
export function useAiSummary(ticketId: string) {
  return useQuery({
    queryKey: ['ai-summary', ticketId],
    queryFn: () => aiApi.summarize(ticketId),
    staleTime: 5 * 60 * 1000,  // 5 min — summaries change rarely
    retry: 1,                   // Only 1 retry for AI calls (cost control)
  });
}

export function useAiResponseSuggestions(ticketId: string) {
  return useQuery({
    queryKey: ['ai-suggestions', ticketId],
    queryFn: () => aiApi.suggestResponses(ticketId),
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
}
```

---

## 9. Shared Components (New)

### `DynamicFormRenderer.tsx`
Reusable across Service Catalog, Workflow config, Automation action config.

### `ConditionBuilder.tsx`
Reusable IF/THEN condition editor used in Automation Rules and Workflow conditions.

### `EntityTimeline.tsx`
Enhanced version of existing timeline — supports workflow steps, SLA events, automation logs.

### `KpiScorecard.tsx`
Reusable card for executive KPI display with trend indicator and sparkline.

---

## 10. Performance Guidelines

| Concern | Solution |
|---|---|
| Workflow canvas (React Flow) | Only render visible nodes, lazy-load builder page |
| Catalog item list | TanStack Query with staleTime=5min, paginated |
| AI panel requests | `enabled: false` until tab is active |
| Executive dashboards | Separate query per widget, independent loading states |
| Automation logs | Server-side pagination, no client-side filtering of large sets |
| Form renderer | `useMemo` for field definitions, `useCallback` for handlers |
