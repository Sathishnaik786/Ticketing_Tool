# Phase 7.7 — API Reference

Base: `/api/analytics` | Auth required | Flag: `ENABLE_EXECUTIVE_ANALYTICS=true`

All endpoints return `{ success: true, data: ... }` on success. Feature flag OFF returns **503**.

## Query Filters (dashboard endpoints)

Optional query params validated by `DashboardFilterSchema`:

| Param | Type | Description |
|-------|------|-------------|
| from | ISO datetime | Start of range |
| to | ISO datetime | End of range |
| department_id | UUID | Filter by department |
| business_unit | string | Filter by business unit name |

## Dashboards

### GET /executive-dashboard
**RBAC:** HR, ADMIN, SUPER_ADMIN

Returns enterprise KPIs: open/closed tickets, resolution %, SLA compliance %, CSAT, approval turnaround, knowledge deflection %, average resolution time, escalation count, workload distribution.

### GET /department-dashboard
**RBAC:** MANAGER, HR, ADMIN, SUPER_ADMIN

Returns department scorecards with ticket volume, SLA %, CSAT, escalations, resolution time, approval cycle time. Managers scoped to own department when `departmentId` present on user profile.

### GET /business-unit-dashboard
**RBAC:** HR, ADMIN, SUPER_ADMIN

Returns scorecards for Aparna business units: tickets, SLA %, CSAT, approvals, resolution trends.

## Analytics Endpoints

### GET /sla
**RBAC:** MANAGER+ (non-employee)

SLA compliance breakdown, breach counts, response/resolution metrics.

### GET /csat
**RBAC:** MANAGER+

Average CSAT, rating distribution, feedback trends.

### GET /approvals
**RBAC:** HR, ADMIN, SUPER_ADMIN

Approval turnaround, pending vs completed, cycle time analytics.

### GET /knowledge
**RBAC:** HR, ADMIN, SUPER_ADMIN

Article views, search trends, deflection rate from knowledge views.

### GET /trends
**RBAC:** MANAGER+

Monthly ticket creation/closure trends.

## Reports

### GET /reports
**RBAC:** MANAGER+

Lists saved reports from `analytics_reports`.

### POST /reports
**RBAC:** MANAGER+ (enterprise report types require HR/Admin)

Body:
```json
{
  "name": "Q1 Trend Report",
  "report_type": "TREND",
  "format": "CSV",
  "filters": {}
}
```

Supported `report_type`: EXECUTIVE, DEPARTMENT, BUSINESS_UNIT, SLA, CSAT, APPROVAL, KNOWLEDGE, TREND  
Supported `format`: JSON, CSV, XLSX, PDF

Creates report record and returns export buffer metadata in response payload.

## Error Codes

| Code | Condition |
|------|-----------|
| 403 | EMPLOYEE access, or role lacks scope |
| 503 | Feature flag disabled |
| 400 | Validation failure on filters or report body |
