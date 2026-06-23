# Ticketra ETMS — Dashboard Redesign Plan

**Prepared by:** Principal Product Designer & Senior Frontend Engineer  
**Status:** Complete  
**Date:** June 20, 2026

---

## 1. Core Visual Hierarchy

The primary dashboard is redesigned as a modular dashboard. The user landing experience will dynamically route users to the appropriate dashboard layout based on their role and preferences, while maintaining immediate orientation around **Enterprise Ticket Management**.

---

## 2. Command Center Dashboard (Default Landing)

```
+---------------------------------------------------------------------------------------------------+
| TICKETRA COMMAND CENTER                                                                          |
+---------------------------------------------------------------------------------------------------+
| [ Open Tickets ] [ Assigned Tickets ] [ Resolved Today ] [ SLA % ] [ Pending Appr ] [ KB Articles ] |
| [     422      ] [       128      ] [       64       ] [ 94.2% ] [     18     ] [     156    ] |
+---------------------------------------------------------------------------------------------------+
|  TICKET STATUS OVERVIEW (Second Row)                                                             |
|  [|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||]       |
|  Open: 45 (10.6%)   |   In Progress: 180 (42.6%)   |   Resolved: 154 (36.5%)   |   Closed: 43 (10.1%)|
+---------------------------------------------------------------------------------------------------+
|  DEPARTMENT PERFORMANCE (Third Row)                 |  RECENT ACTIVITY FEED (Fourth Row)          |
|  - HR: 88% Compliance  |  Avg Res: 1.4h             |  - [Escalated] Ticket IT-394: Breached SLA  |
|  - IT: 96% Compliance  |  Avg Res: 0.8h             |  - [Assigned] Ticket HR-205 -> Operative 42 |
|  - Admin: 92% Compliance|  Avg Res: 2.1h             |  - [Created] Ticket SEC-101: Access Request |
|  - Finance: 94% Compl  |  Avg Res: 1.9h             |  - [Resolved] Ticket IT-192 solved          |
+---------------------------------------------------------------------------------------------------+
```

---

## 3. Top KPI Grid Structure

Six key metric cards are arranged at the top of the interface:

1. **Open Tickets**: Aggregate active tickets inside the system (excluding closed/resolved statuses).
2. **Assigned Tickets**: Active tickets assigned to the logged-in user or their immediate team.
3. **Resolved Today**: Count of issues moved to `'RESOLVED'` or `'CLOSED'` within the current calendar day.
4. **SLA Compliance %**: Percent of resolved tickets that met response and resolution thresholds.
5. **Pending Approvals**: Workflows awaiting the user's signature.
6. **Knowledge Articles**: Total active items in the deflecting self-service directory.

---

## 4. Sub-Panel Layouts

### A. Second Row: Ticket Status Chart
- Renders a horizontal percentage bar or stack-line chart showing the distribution of tickets across states: `Open`, `In Progress`, `Resolved`, and `Closed`.
- Interactive legends allow filtering the entire dashboard view by status.

### B. Third Row: Department Performance
- Comparison panel tracking compliance and throughput metrics across divisions (`HR`, `IT`, `Admin`, `Finance`, `Operations`).
- Tracks average resolution times (ART) in hours.

### C. Fourth Row: Recent Activity Feed
- Event log displaying live system updates. 
- Actions are color-coded:
  - *Created*: Light Blue
  - *Assigned*: Slate Grey
  - *Escalated*: Red / Warning Amber
  - *Resolved / Approved*: Emerald Green

---

## 5. Executive Dashboard Layout

Renders business intelligence metrics for `ADMIN`, `HR`, and `MANAGER` roles:

- **Key Performance indicators**:
  - *Total Tickets*: Aggregate historical volume.
  - *SLA %*: Compliance metrics over time.
  - *Avg Resolution Time*: Operational velocity.
  - *Department Ranking*: Ordered by compliance scores.
  - *Escalation Rate*: Ratio of tickets breaching Level 1 triage.
  - *Customer Satisfaction (CSAT)*: Average rating from ticket feedback loops.
- **BI Charts**:
  - *Ticket Trends*: Weekly incoming vs. closed volume comparisons.
  - *Monthly Volume*: Categorized bar charts indicating ticket category spikes.
  - *SLA Breaches*: Heatmap of bottleneck hours.

---

## 6. Operator Dashboard Layout

A task-focused workspace for individual agents (`EMPLOYEE` role):

- **Focus Cards**:
  - *Assigned to Me*: User-specific workload count.
  - *Overdue*: Tasks that have breached response/resolution SLAs.
  - *High Priority*: Critical alerts.
  - *Pending Actions*: Requests for updates or feedback.
  - *Today's Workload*: Percentage gauge against capacity.
  - *Recent Updates*: Notifications on user's active watcher list.
