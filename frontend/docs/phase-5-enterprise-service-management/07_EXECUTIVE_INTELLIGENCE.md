# 07 — Executive Intelligence Platform
# Phase 5.0: Enterprise Service Management Platform

---

## 1. Overview

The Executive Intelligence Platform transforms operational dashboards into strategic command centers, providing leadership with the metrics, forecasts, and insights needed to make data-driven service management decisions.

---

## 2. KPI Definitions

| KPI | Formula | Target |
|---|---|---|
| **MTTA** (Mean Time to Assign) | avg(assigned_at - created_at) | < 30 min |
| **MTTR** (Mean Time to Resolve) | avg(resolved_at - created_at) | < 4h (P1), < 24h (P3) |
| **SLA Compliance** | (tickets_sla_met / total_tickets) × 100 | ≥ 90% |
| **First Contact Resolution** | tickets closed at first response / total | ≥ 40% |
| **Backlog Growth Rate** | (open_tickets_now - open_tickets_7d_ago) / 7 | ≤ 0 (decreasing) |
| **Cost Per Ticket** | total_support_cost / tickets_resolved | Establish baseline |
| **Agent Utilization** | resolved_tickets / capacity_tickets per agent | 70–85% |
| **Reopen Rate** | reopened_tickets / resolved_tickets | < 5% |
| **Escalation Rate** | escalated_tickets / total_tickets | < 10% |
| **Approval Bottleneck** | avg_workflow_step_wait_hours per step type | < 4h |

---

## 3. Dashboard Pages

### 3.1 Executive Command Center
**Route:** `/app/executive/command`  
**Audience:** C-Suite, Senior Leadership  

Widgets:
- Today's KPI scorecard (MTTR, SLA %, Open tickets, Resolved today)
- SLA compliance trend (30-day sparkline)
- Top 5 bottleneck departments
- Critical tickets requiring attention (P1 open > 2h)
- Resolution forecast (next 7 days based on historical velocity)
- Team capacity gauge

### 3.2 Service Health Dashboard
**Route:** `/app/executive/service-health`  
**Audience:** IT Managers, Operations  

Widgets:
- Real-time ticket volume by status
- SLA breach heat map (department × priority)
- Open tickets by age bucket (< 1h, 1-4h, 4-24h, > 24h)
- SLA escalation funnel
- Automation rule effectiveness (% tickets auto-handled)

### 3.3 Capacity Planning Dashboard
**Route:** `/app/executive/capacity`  
**Audience:** Service Management Leaders  

Widgets:
- Agent workload distribution (tickets per agent)
- Incoming volume trend (7d, 30d, 90d)
- Resolution capacity vs. incoming volume gap
- Top 10 ticket categories by volume
- Predicted peak load periods
- Headcount recommendation (if volume grows at current rate)

### 3.4 Department Performance Dashboard
**Route:** `/app/executive/departments`  
**Audience:** Department Heads, HR  

Widgets:
- Department SLA compliance table (sortable)
- Department MTTR ranking
- Cross-department ticket flow (requester vs. resolver dept)
- Department ticket volume trend
- Employee satisfaction score (from ticket feedback module)

---

## 4. Analytics API Contracts

```
# Executive KPIs
GET /api/v2/intelligence/kpis                   Overall KPIs (date range)
GET /api/v2/intelligence/kpis/department        Per-department KPIs
GET /api/v2/intelligence/kpis/agent             Per-agent KPIs

# Trends
GET /api/v2/intelligence/trends/volume          Ticket volume over time
GET /api/v2/intelligence/trends/sla             SLA compliance over time
GET /api/v2/intelligence/trends/resolution      MTTR trend over time
GET /api/v2/intelligence/trends/backlog         Open ticket backlog over time

# Forecasting
GET /api/v2/intelligence/forecast/volume        Predicted volume (next 7/30d)
GET /api/v2/intelligence/forecast/resolution    Predicted resolution capacity

# Bottleneck analysis
GET /api/v2/intelligence/bottlenecks/workflow   Slowest workflow steps
GET /api/v2/intelligence/bottlenecks/agents     Overloaded agents
GET /api/v2/intelligence/bottlenecks/categories High-volume categories

# Service catalog analytics
GET /api/v2/intelligence/catalog/performance    Catalog item completion rates

# Export
POST /api/v2/intelligence/reports/generate      Generate PDF/Excel report
GET  /api/v2/intelligence/reports/:id           Download generated report
```

---

## 5. Data Aggregation Strategy

### Approach: Hybrid (OLTP + Materialized Views)

For real-time metrics (< 5 min freshness): Query live PostgreSQL with indexed aggregates  
For trend/historical metrics (hourly granularity): Materialized views refreshed hourly  
For forecasting: Pre-computed nightly batch jobs stored in `intelligence_snapshots`

```sql
-- Daily intelligence snapshots
CREATE TABLE intelligence_snapshots (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date         DATE NOT NULL,
  granularity           VARCHAR(20) NOT NULL,  -- 'daily' | 'weekly' | 'monthly'
  department_id         UUID REFERENCES departments(id),
  agent_id              UUID REFERENCES employees(id),
  priority              VARCHAR(20),
  total_created         INTEGER,
  total_resolved        INTEGER,
  total_breached        INTEGER,
  avg_mtta_mins         NUMERIC,
  avg_mttr_mins         NUMERIC,
  sla_compliance_pct    NUMERIC,
  fcr_rate              NUMERIC,
  reopen_rate           NUMERIC,
  escalation_rate       NUMERIC,
  automation_rate       NUMERIC,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(snapshot_date, granularity, department_id, agent_id, priority)
);

-- Create indexes for fast dashboard queries
CREATE INDEX idx_snapshots_date ON intelligence_snapshots(snapshot_date DESC);
CREATE INDEX idx_snapshots_dept ON intelligence_snapshots(department_id, snapshot_date DESC);
CREATE INDEX idx_snapshots_agent ON intelligence_snapshots(agent_id, snapshot_date DESC);
```

### Redis Caching
- Dashboard aggregates cached for 60 seconds
- KPI scorecards cached for 30 seconds
- Trend data cached for 5 minutes
- Cache invalidated on major ticket state changes

---

## 6. Forecasting Engine

### Volume Forecasting
Uses simple time-series analysis on `intelligence_snapshots`:
1. Fetch last 90 days of daily creation counts
2. Apply 7-day moving average smoothing
3. Detect day-of-week patterns
4. Project forward using weighted moving average
5. Return with ±15% confidence interval

### Resolution Forecast
- Calculate current rolling 7-day resolution rate (tickets/day)
- Compare against current open backlog
- Output: "At current rate, backlog will be cleared in X days"

**Note:** Phase 5.0 uses statistical methods. ML-based forecasting planned for Phase 5.3.

---

## 7. Report Generation

| Report | Format | Schedule |
|---|---|---|
| Weekly SLA Summary | PDF + Email | Every Monday 08:00 |
| Monthly Executive Snapshot | PDF | 1st of month |
| Department Performance | Excel | Weekly |
| SLA Breach Analysis | PDF | On-demand |
| Agent Productivity Report | Excel | Weekly |

Reports generated as BullMQ jobs, stored in Supabase Storage, linked via signed URLs.

---

## 8. Feature Flag

```
VITE_ENABLE_EXECUTIVE_INTELLIGENCE=true
ENABLE_EXECUTIVE_INTELLIGENCE=true  # backend
```
