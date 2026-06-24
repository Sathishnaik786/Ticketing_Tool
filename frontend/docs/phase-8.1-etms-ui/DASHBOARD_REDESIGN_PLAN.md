# Dashboard Redesign Plan — Ticketra ETMS

**Date:** 2026-06-19  
**Version:** 1.0

---

## Overview

Replace the HR-centric "Executive Hub" with a **three-dashboard strategy**:

| Dashboard | Route | Primary Audience |
|-----------|-------|------------------|
| **Command Dashboard** | `/app/dashboard` | All authenticated users — ETMS home |
| **Executive Dashboard** | `/app/executive-dashboard` | ADMIN, HR, executives |
| **Operator Dashboard** | `/app/operator-dashboard` [NEW] | Agents, assignees, MANAGER |

Existing `Dashboard.tsx` becomes Command Dashboard. EMS widgets demoted or removed from primary view.

---

## 1. Command Dashboard (`/app/dashboard`)

**Purpose:** Immediate ETMS identity — "You are in an Enterprise Ticket Management System."

### Header

```
Ticketra Command Center
Enterprise Ticket Management System — real-time service operations
[Quick Create Ticket]  [View My Queue]
```

Replace `EnterpriseHeader` title "Executive Hub" and EMS copy.

### Row 1 — Top KPI Cards (6 cards)

| Card | Data Source | Icon |
|------|-------------|------|
| Open Tickets | Ticketing API — count status=open | `Ticket` |
| Assigned Tickets | Assignment API — assigned to user/team | `UserCheck` |
| Resolved Today | Ticketing API — resolved_at=today | `CheckCircle2` |
| SLA Compliance % | Ticketing SLA metrics | `ShieldCheck` |
| Pending Approvals | Approval engine — pending count | `Clock` |
| Knowledge Articles | KB API — published count | `BookOpen` |

**Component:** New `EtmsKpiGrid` using design system stat cards (not `EnterpriseStatCard` payroll styling).

**Fallback:** When module flag off, show "—" with tooltip "Module not enabled".

### Row 2 — Ticket Status Chart

Horizontal stacked bar or donut chart:

| Segment | Color |
|---------|-------|
| Open | `#2563EB` |
| In Progress | `#F59E0B` |
| Resolved | `#10B981` |
| Closed | `#64748B` |

**Component:** `TicketStatusChart` — new or extend executive analytics chart primitives.

**Data:** Aggregate ticket counts by status (new API endpoint or client-side from list API).

### Row 3 — Department Performance

Bar chart or scorecard row:

| Department | Metrics |
|------------|---------|
| HR | Open, avg resolution time, SLA % |
| IT | Open, avg resolution time, SLA % |
| Admin | Open, avg resolution time, SLA % |
| Finance | Open, avg resolution time, SLA % |
| Operations | Open, avg resolution time, SLA % |

**Component:** `DepartmentPerformancePanel` — reuse `DepartmentScorecard` from executive-analytics module.

### Row 4 — Recent Activity Feed

Unified timeline (max 20 items):

| Event Type | Icon | Example |
|------------|------|---------|
| Ticket Created | `Plus` | "TKT-1042 created by Jane Doe" |
| Ticket Assigned | `UserPlus` | "TKT-1041 assigned to John Smith" |
| Ticket Escalated | `AlertTriangle` | "TKT-1039 escalated to IT L2" |
| Ticket Resolved | `CheckCircle` | "TKT-1038 resolved — 2h 14m" |
| Approval Completed | `BadgeCheck` | "Approval for TKT-1035 approved" |

**Component:** `EtmsActivityFeed` — merge communication tracking events + ticket events + approval events.

**Data:** Notification center event sync or dedicated activity API.

### Role Variants (Same Page, Conditional Sections)

| Role | Additional Section |
|------|-------------------|
| EMPLOYEE | "My Open Tickets" mini-list (top priority) |
| MANAGER | Team workload summary strip |
| ADMIN/HR | Link strip to Executive Dashboard |

### Remove / Demote from Command Dashboard

| Current Element | Action |
|-----------------|--------|
| UpdatesQuickAccess | Remove from primary — link from Legacy EMS |
| Workforce KPI cards | Remove |
| AnalyticsOverview (HR) | Remove |
| My Payslips (employee) | Move to profile dropdown or Legacy EMS |
| TicketFeedbackDashboardWidgets | Move to Analytics or ticket detail |
| CommunicationDashboardWidgets | Integrate into Activity Feed |

---

## 2. Executive Dashboard (`/app/executive-dashboard`)

**Purpose:** Strategic service performance for leadership.

**File:** Extend existing `ExecutiveDashboardPage.tsx` — already partially built in Phase 7.7.

### KPI Cards

| Card | Metric |
|------|--------|
| Total Tickets | All-time or period total |
| SLA % | Organization-wide compliance |
| Avg Resolution Time | Mean time to resolve (hours) |
| Department Ranking | Top performing dept |
| Escalation Rate | % tickets escalated |
| Customer Satisfaction | CSAT from ticket feedback module |

### Charts

| Chart | Type | Data |
|-------|------|------|
| Ticket Trends | Line (30/90 day) | Volume over time |
| Monthly Volume | Bar | Tickets per month |
| Department Performance | Horizontal bar | SLA + volume by dept |
| SLA Breaches | Area or bar | Breaches over time |
| Resolution Analytics | Line + percentile | MTTR distribution |

**Reuse:** `KpiCards`, `TrendCharts`, `DepartmentScorecard`, `BusinessUnitScorecard` from executive-analytics module.

### Layout

```
[Page Header: Executive Dashboard]
[KPI Grid — 3x2]
[Row: Ticket Trends | Monthly Volume]
[Row: Department Performance | SLA Breaches]
[Row: Resolution Analytics — full width]
[Export Reports CTA]
```

### Access

Roles: `ADMIN`, `HR`, `SUPER_ADMIN` (existing RBAC).

---

## 3. Operator Dashboard (`/app/operator-dashboard`) — NEW

**Purpose:** Daily work surface for agents and assignees.

### KPI Cards

| Card | Metric |
|------|--------|
| Assigned To Me | Count from my-queue |
| Overdue | SLA breached assigned to me |
| High Priority | Critical + high open |
| Pending Actions | Approvals + comments needed |
| Today's Workload | Due today |
| Recent Updates | Count last 24h on my tickets |

### Sections

1. **My Queue Table** — compact ticket list (top 10), link to `/app/my-queue`
2. **Overdue Alerts** — red-highlighted list
3. **Pending Approvals** — quick approve/reject inline
4. **Recent Updates** — activity on assigned tickets

### Access

Roles: `ADMIN`, `HR`, `MANAGER`, `EMPLOYEE` (all operators).

### Navigation

Add under Dashboard as sub-item or role-based redirect:
- EMPLOYEE/MANAGER default landing → Operator Dashboard (optional config)
- ADMIN/HR default landing → Command Dashboard

---

## 4. SLA Dashboard (`/app/sla-dashboard`) — NEW

Listed under Analytics in IA. Focused SLA breach monitoring.

| Widget | Content |
|--------|---------|
| SLA Compliance Gauge | Overall % |
| Breach List | Active breaches sorted by severity |
| At-Risk Tickets | Approaching breach window |
| SLA by Priority | Table |
| SLA by Department | Chart |

**Data:** Ticketing SLA endpoints + executive analytics repository patterns.

---

## Component Architecture

```
frontend/src/modules/dashboard/
├── pages/
│   ├── CommandDashboardPage.tsx      (refactor from pages/Dashboard.tsx)
│   ├── OperatorDashboardPage.tsx     (new)
│   └── SlaDashboardPage.tsx          (new)
├── components/
│   ├── EtmsKpiGrid.tsx
│   ├── TicketStatusChart.tsx
│   ├── DepartmentPerformancePanel.tsx
│   ├── EtmsActivityFeed.tsx
│   └── OperatorQueueSummary.tsx
├── hooks/
│   └── useEtmsDashboard.ts           (aggregates API calls)
└── services/
    └── etmsDashboardService.ts
```

**Migration:** Move `pages/Dashboard.tsx` logic into module; re-export for route stability.

---

## API Requirements

| Endpoint | Purpose | Status |
|----------|---------|--------|
| `GET /api/tickets/stats` | KPI aggregates | May need new |
| `GET /api/tickets/stats/by-status` | Status chart | May need new |
| `GET /api/tickets/stats/by-department` | Dept performance | May need new |
| `GET /api/activity/recent` | Activity feed | May need new |
| Executive analytics existing | Executive dashboard | Exists (7.7) |
| Assignment queue existing | Operator dashboard | Exists (7.2) |

**Phase 1 fallback:** Client-side aggregation from list endpoints with caching; optimize with dedicated stats API in Phase 2.

---

## Wireframe — Command Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│ Ticketra Command Center                    [+ Create] [My Queue]│
├─────────────────────────────────────────────────────────────────┤
│ [Open] [Assigned] [Resolved Today] [SLA %] [Approvals] [KB]    │
├──────────────────────────────┬──────────────────────────────────┤
│ Ticket Status Chart          │  Quick Actions                    │
│ █ Open █ InProg █ Resolved   │  • Create Ticket                  │
│                              │  • Search KB                      │
├──────────────────────────────┴──────────────────────────────────┤
│ Department Performance                                          │
│ HR ████████░░  IT ██████████  Admin ██████░░  Finance ████░░   │
├─────────────────────────────────────────────────────────────────┤
│ Recent Activity                                                 │
│ • TKT-1042 created — 2m ago                                     │
│ • TKT-1041 assigned to John — 15m ago                           │
│ • Approval completed TKT-1035 — 1h ago                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Testing Plan

| Test | Type |
|------|------|
| Command dashboard renders 6 KPIs | Unit |
| Status chart segments sum to total | Unit |
| Activity feed merges event sources | Integration |
| Executive dashboard RBAC | Existing tests extend |
| Operator dashboard shows user queue only | Unit |
| EMS widgets not on command dashboard | Snapshot |
| Loading/error skeleton states | Unit |

---

## Rollout

1. Build new components behind feature flag `VITE_ENABLE_ETMS_DASHBOARD`
2. Parallel render: toggle between old/new dashboard
3. UAT with operators + executives
4. Remove legacy HR dashboard sections
5. Update onboarding/docs

---

**Related:** [SCREEN_INVENTORY.md](./SCREEN_INVENTORY.md), [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md)
