# 04 — SLA Policy Engine
# Phase 5.0: Enterprise Service Management Platform

---

## 1. Overview

The current SLA implementation is display-only (renders due dates from the database). Phase 5.0 replaces this with a real-time enforcement engine that calculates, monitors, escalates, and reports on SLA compliance across all ticket types and departments.

---

## 2. SLA Concepts

| Term | Definition |
|---|---|
| **Response SLA** | Time from ticket creation to first agent response |
| **Resolution SLA** | Time from ticket creation to full resolution |
| **SLA Policy** | Named ruleset defining target times by priority and department |
| **SLA Target** | Specific time value (e.g., P1 response: 1 hour) |
| **SLA Breach** | When a target time is exceeded |
| **SLA Warning** | When 75% of target time has elapsed (configurable) |
| **Escalation** | Auto-routing when SLA warning or breach triggers |
| **Business Hours** | Option to count only working hours for SLA calculation |

---

## 3. SLA Priority Levels

| Priority | Default Response SLA | Default Resolution SLA | Escalation After |
|---|---|---|---|
| P1 – Critical | 30 minutes | 4 hours | 15 min warning |
| P2 – High | 1 hour | 8 hours | 30 min warning |
| P3 – Medium | 4 hours | 24 hours | 2 hour warning |
| P4 – Low | 8 hours | 72 hours | 4 hour warning |

All targets are configurable per department and per SLA policy.

---

## 4. Database Schema

```sql
-- SLA policy definitions
CREATE TABLE sla_policies (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL,
  name                VARCHAR(255) NOT NULL,
  description         TEXT,
  is_default          BOOLEAN NOT NULL DEFAULT FALSE,
  business_hours_only BOOLEAN NOT NULL DEFAULT FALSE,
  business_hours_config JSONB DEFAULT '{
    "timezone": "Asia/Kolkata",
    "days": [1,2,3,4,5],
    "start": "09:00",
    "end": "18:00"
  }',
  warning_threshold_pct INTEGER NOT NULL DEFAULT 75, -- % of SLA time elapsed
  status              VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  created_by          UUID REFERENCES employees(id),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ
);

-- Individual SLA targets per priority × department
CREATE TABLE sla_targets (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id           UUID NOT NULL REFERENCES sla_policies(id) ON DELETE CASCADE,
  priority            VARCHAR(50) NOT NULL,   -- P1 | P2 | P3 | P4
  department_id       UUID REFERENCES departments(id), -- NULL = all departments
  response_minutes    INTEGER NOT NULL,
  resolution_minutes  INTEGER NOT NULL,
  escalation_minutes  INTEGER,               -- Override warning threshold
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- SLA assignments: which policy applies to which ticket
CREATE TABLE sla_assignments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id           UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  policy_id           UUID NOT NULL REFERENCES sla_policies(id),
  target_id           UUID NOT NULL REFERENCES sla_targets(id),
  response_due_at     TIMESTAMPTZ NOT NULL,
  resolution_due_at   TIMESTAMPTZ NOT NULL,
  response_met_at     TIMESTAMPTZ,           -- NULL until first response
  resolution_met_at   TIMESTAMPTZ,           -- NULL until resolved
  paused_at           TIMESTAMPTZ,           -- When ticket set to PENDING_USER
  pause_reason        TEXT,
  total_paused_mins   INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ticket_id)
);

-- SLA breach records
CREATE TABLE sla_breaches (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id           UUID NOT NULL REFERENCES tickets(id),
  assignment_id       UUID NOT NULL REFERENCES sla_assignments(id),
  breach_type         VARCHAR(50) NOT NULL,  -- 'RESPONSE' | 'RESOLUTION'
  breached_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_at              TIMESTAMPTZ NOT NULL,
  overdue_minutes     INTEGER NOT NULL,
  acknowledged_by     UUID REFERENCES employees(id),
  acknowledged_at     TIMESTAMPTZ,
  root_cause          TEXT
);

-- SLA escalation records
CREATE TABLE sla_escalations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id           UUID NOT NULL REFERENCES tickets(id),
  assignment_id       UUID NOT NULL REFERENCES sla_assignments(id),
  escalation_type     VARCHAR(50) NOT NULL,  -- 'WARNING' | 'BREACH'
  escalated_to        UUID REFERENCES employees(id),
  escalated_to_role   VARCHAR(100),
  notification_sent   BOOLEAN NOT NULL DEFAULT FALSE,
  escalated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Aggregated SLA metrics (materialized, refreshed hourly)
CREATE TABLE sla_metrics_daily (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date         DATE NOT NULL,
  department_id       UUID REFERENCES departments(id),
  priority            VARCHAR(50),
  total_tickets       INTEGER NOT NULL DEFAULT 0,
  response_met        INTEGER NOT NULL DEFAULT 0,
  resolution_met      INTEGER NOT NULL DEFAULT 0,
  total_breaches      INTEGER NOT NULL DEFAULT 0,
  avg_response_mins   NUMERIC,
  avg_resolution_mins NUMERIC,
  sla_compliance_pct  NUMERIC,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(metric_date, department_id, priority)
);

-- Indexes
CREATE INDEX idx_sla_assignments_ticket ON sla_assignments(ticket_id);
CREATE INDEX idx_sla_assignments_response_due ON sla_assignments(response_due_at)
  WHERE response_met_at IS NULL;
CREATE INDEX idx_sla_assignments_resolution_due ON sla_assignments(resolution_due_at)
  WHERE resolution_met_at IS NULL;
CREATE INDEX idx_sla_breaches_ticket ON sla_breaches(ticket_id);
CREATE INDEX idx_sla_metrics_date ON sla_metrics_daily(metric_date);
```

---

## 5. SLA Calculation Logic

### Due Date Calculation
```javascript
function calculateSlaDeadline(createdAt, targetMinutes, businessHoursConfig) {
  if (!businessHoursConfig.enabled) {
    return addMinutes(createdAt, targetMinutes);
  }
  // Walk forward through business hours only
  return calculateBusinessHoursDeadline(createdAt, targetMinutes, businessHoursConfig);
}
```

### SLA Pause / Resume
When a ticket transitions to `PENDING_USER` status:
1. Record `paused_at = NOW()` on `sla_assignments`
2. When ticket transitions back to `IN_PROGRESS`:
   - Calculate `pause_duration = NOW() - paused_at`
   - Add `pause_duration` to `total_paused_mins`
   - Extend `response_due_at` and `resolution_due_at` by `pause_duration`
   - Clear `paused_at`

---

## 6. Background Jobs

### SLA Monitor (Cron — every 1 minute)
```
1. Query sla_assignments WHERE:
   - (response_due_at BETWEEN now-2m AND now+1m AND response_met_at IS NULL)
   - OR (resolution_due_at BETWEEN now-2m AND now+1m AND resolution_met_at IS NULL)
2. For each at-risk assignment:
   - If now > due_at → create sla_breaches record
   - Else if elapsed_pct > warning_threshold → create sla_escalations (WARNING)
3. Dispatch notifications via NotificationService
4. Update ticket priority if configured (P1 auto-escalation)
```

### SLA Metrics Aggregation (Cron — every hour)
```
1. Aggregate completed tickets for yesterday
2. Calculate compliance percentages by department + priority
3. Upsert into sla_metrics_daily
4. Refresh Redis cache for executive dashboards
```

---

## 7. API Contracts

```
# SLA Policies
GET    /api/v2/sla/policies              List policies
POST   /api/v2/sla/policies              Create policy
GET    /api/v2/sla/policies/:id          Get policy + targets
PUT    /api/v2/sla/policies/:id          Update policy
DELETE /api/v2/sla/policies/:id          Soft delete

# SLA Targets
POST   /api/v2/sla/policies/:id/targets  Add target to policy
PUT    /api/v2/sla/targets/:id           Update target
DELETE /api/v2/sla/targets/:id           Delete target

# SLA Analytics
GET    /api/v2/sla/analytics/summary     Overall SLA compliance
GET    /api/v2/sla/analytics/breaches    Breach list + trends
GET    /api/v2/sla/analytics/escalations Escalation audit log
GET    /api/v2/sla/analytics/department  Per-department breakdown
GET    /api/v2/sla/analytics/agent       Per-agent compliance

# Ticket SLA (read)
GET    /api/v2/tickets/:id/sla           Current SLA status for ticket
```

---

## 8. Frontend Pages

| Page | Route | Description |
|---|---|---|
| `SlaPolicyListPage` | `/app/admin/sla` | List and manage SLA policies |
| `SlaPolicyBuilderPage` | `/app/admin/sla/:id` | Create/edit policy with targets |
| `SlaAnalyticsDashboardPage` | `/app/analytics/sla` | Compliance trends + breach table |
| `SlaBreachDetailPage` | `/app/analytics/sla/breaches` | Detailed breach investigation |

---

## 9. SLA Notification Events

| Event | Recipients | Channel |
|---|---|---|
| SLA Warning (75%) | Assigned Agent | In-App + Email |
| SLA Warning (90%) | Assigned Agent + Manager | In-App + Email |
| SLA Breach (Response) | Agent + Manager | In-App + Email + Slack |
| SLA Breach (Resolution) | Agent + Manager + Dept Head | In-App + Email + Slack |
| SLA Breach Acknowledged | Ticket Requester | In-App |

---

## 10. Feature Flag

```
VITE_ENABLE_SLA_ENGINE=true
ENABLE_SLA_ENGINE=true   # backend .env
```
