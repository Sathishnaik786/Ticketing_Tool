# Dashboard Audit

This document audits the legacy `Dashboard.tsx` compared to the newer `EtmsCommandDashboard.tsx` view.

## 1. Current KPIs (EMS-coupled)
The legacy dashboard exposes the following workforce metrics as key indicators:
* **Total Workforce**: Total active employee count.
* **Pending Actions**: Outstanding leave approvals.
* **Active Presence**: Present-today head count.
* **Operational Rate**: Overall attendance rate.

## 2. Current Widgets
* **UpdatesQuickAccess**: Personnel daily update summaries.
* **TicketsQuickAccess**: Legacy list views of issues.
* **Communication & Feedback widgets**: Communication and feedback widgets are appended sequentially in the scroll group.

## 3. Current EMS Coupling
* **HR-first layout**: The landing view prioritizes organizational statistics and HR metrics instead of active operations.
* **Financial shortcuts**: Direct link to "My Payslips" for employee roles.

## 4. Missing ETMS Widgets
To focus on service ticket execution, the following widgets were missing but are now enabled via `EtmsCommandDashboard`:
* **Live Service Queue metrics**: Open, Assigned, and Overdue Tickets.
* **Service Level Indicators**: SLA Compliance rate (%).
* **Department Performance Matrix**: Average resolution times across departments.
* **Live Activity Feed**: Real-time event timeline of ticket updates.
