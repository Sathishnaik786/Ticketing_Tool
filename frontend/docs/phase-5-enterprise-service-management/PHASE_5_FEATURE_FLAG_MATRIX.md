# FEATURE FLAG MATRIX
# Enterprise Service Management Platform — Feature Flag Audit

---

## 1. Feature Flag Registry

| Feature | Frontend Flag | Backend Variable | Default State | Rollout Stage | Dependency |
|---|---|---|---|---|---|
| **Audit Framework** | N/A | `PROCESS_AUDIT_LOGS` | `ENABLED` | Phase 5.0 (Step 1) | None |
| **BullMQ Jobs** | N/A | `USE_BULLMQ_PROCESSING` | `DISABLED` | Phase 5.0 (Step 2) | Redis Connection |
| **Workflow Engine** | `isWorkflowEnabled` | `ENABLE_WORKFLOWS` | `DISABLED` | Phase 5.0 (Step 3) | BullMQ Jobs |
| **SLA Engine** | `isSlaEnabled` | `ENABLE_SLA_ENGINE` | `DISABLED` | Phase 5.0 (Step 4) | BullMQ Jobs |
| **Service Catalog** | `isCatalogEnabled` | `ENABLE_SERVICE_CATALOG` | `DISABLED` | Phase 5.1 (Step 5) | Workflow Engine |
| **Automation Rules** | `isAutomationEnabled` | `ENABLE_AUTOMATION` | `DISABLED` | Phase 5.1 (Step 6) | BullMQ Jobs |
| **Executive Intelligence**| `isExecutiveIntelEnabled` | `ENABLE_KPI_ANALYTICS` | `DISABLED` | Phase 5.2 (Step 7) | None |

---

## 2. Implementation Strategy

### Frontend Configuration (`src/config/features.ts`)
Toggle visibility of menu navigation links, builder canvas routes, and client dashboard panels.
```typescript
export const isWorkflowEnabled = import.meta.env.VITE_ENABLE_WORKFLOWS === 'true';
export const isSlaEnabled = import.meta.env.VITE_ENABLE_SLA_ENGINE === 'true';
export const isCatalogEnabled = import.meta.env.VITE_ENABLE_SERVICE_CATALOG === 'true';
export const isAutomationEnabled = import.meta.env.VITE_ENABLE_AUTOMATION === 'true';
export const isExecutiveIntelEnabled = import.meta.env.VITE_ENABLE_KPI_ANALYTICS === 'true';
```

### Backend Configuration (`src/config/features.js`)
Backend middleware blocks incoming requests if the associated feature flag is disabled:
```javascript
exports.requireFeature = (flagName) => {
  return (req, res, next) => {
    const isEnabled = process.env[flagName] === 'true';
    if (!isEnabled) {
      return res.status(403).json({
        success: false,
        message: `Feature ${flagName} is currently disabled in this environment.`
      });
    }
    next();
  };
};
```

---

## 3. Rollout Sequence & Safety Gates

1. **Gate 1: Infra Setup (Phase 5.0 - Step 1 & 2):** Audit logs are enabled globally. Redis is connected and BullMQ flags are enabled in isolation inside development.
2. **Gate 2: Processing Engines (Phase 5.0 - Step 3 & 4):** Enable Workflow & SLA Engines in Staging. Perform concurrency and failure testing for BullMQ processes.
3. **Gate 3: Self-Service Portal (Phase 5.1):** Enable Service Catalog & Automation Engines. Submissions automatically route tickets using active workflows.
4. **Gate 4: Telemetry Aggregation (Phase 5.2):** Enable Executive dashboards. Pre-run aggregation queries to ensure they populate without slowing staging or production interfaces.
