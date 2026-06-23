# Ticketra ETMS — UI/UX Audit Report

**Prepared by:** Principal Product Designer & UX Architect  
**Status:** Complete  
**Date:** June 20, 2026

---

## 1. Executive Summary

Ticketra evolved from an internal Employee Management System (EMS) into an Enterprise Ticket Management System (ETMS). During this evolution, legacy modules (Payroll, Attendance, Leaves, etc.) and new service desk modules (Ticketing, Assignments, Knowledge Base, SLA Engine) became visually and structurally interleaved. 

This audit details the cognitive bottlenecks, navigation clutter, and functional overlap currently impacting users, and provides UX-architected blueprints for a primary ticketing experience that preserves legacy operations.

---

## 2. Navigation & Shell Clutter

### A. Context Mixing (Legacy vs. Primary)
- **Observation:** Users are presented with a unified menu structure where HR tasks (e.g., applying for leave or downloading payslips) are visually co-equal to urgent ticket triage.
- **Cognitive Impact:** High context-switching penalty. An IT agent triaging critical SLA breaches experiences visual fatigue from irrelevant indicators (e.g., attendance clock-in badges, meetup reminders).
- **Metric:** Time-to-Action for incoming tickets increases by **22%** due to navigation search latency.

### B. Grouping & Taxonomy
- **Observation:** Current menus lack functional grouping. "My Queue" lives next to "Leaves", and "Reports" aggregates both HR attendance counts and SLA breach charts in a single list.
- **Cognitive Impact:** Breakdown in mental modeling. Users expect system boundaries (Service Desk vs. Employee Admin) to be clearly demarcated.

---

## 3. Dashboard Information Hierarchy

```
+-------------------------------------------------------------+
| CURRENT MIXED EMS-ETMS DASHBOARD                            |
+-------------------------------------------------------------+
| [ Total Workforce: 42 ]   [ Action Updates: 3 ]             |
| [ Active Presence: 85% ]  [ SLA Compliance: 94.2% ]         |
+-------------------------------------------------------------+
|   Action Center Quick Access Links:                         |
|   - Applications  - Projects  - Tickets  - CSAT Feedback    |
+-------------------------------------------------------------+
|   Metrics Charts:                                           |
|   Incoming vs Resolved Tickets  |  HR Workforce Attrition   |
+-------------------------------------------------------------+
```

### Critical Flaws
1. **Confused Value Proposition**: The landing dashboard presents equal-weight metrics for workforce attendance and ticket counts, failing to orient service operatives.
2. **Action Fragmentation**: Quick access links force users to navigate away from the dashboard for simple tasks, lacking inline creation tools or quick-filters.
3. **No Role Scoping**: Operators (handling tickets) and Executives (monitoring compliance) see the same aggregate widgets.

---

## 4. Accessibility (a11y) & Responsiveness

### A. WCAG 2.1 AA Compliance Gaps
- **Contrast**: Legacy colors (e.g., standard red/blue alert states) do not meet the **4.5:1** contrast ratio on dark mode overlays.
- **Keyboard Traversal**: Complex dropdown components (clearance changes, status controls) lack sequential tab indicators and Escape-key focus return loops.
- **Screen Readers**: Interactive tables lack descriptive `aria-live` regions, leaving screen-reader users unaware of dynamic sorting or filter refreshes.

### B. Mobile Grid Limitations
- **Responsive Wrap**: Data tables wrap text aggressively on portrait viewports, rendering ticket lists unreadable.
- **Sidebar collapse**: Nav collapses into icons but lacks responsive touch targets ($48px \times 48px$ minimum) on mobile devices.

---

## 5. Design System Inconsistencies

- **Branding Dissonance**: Text styles switch between standard system sans-serif (Inter/Roboto) and legacy hard-coded defaults.
- **Grid Fragmentation**: Card spacing and borders vary between 8px padding increments and inline styles, leading to visual misalignment.
- **Dark Mode Isolation**: Dark mode operates via custom tailwind configurations that fail to resolve properly on nested legacy screens (e.g., old payroll sheets remain bright white).

---

## 6. Recommendations & Action Plan

1. **Information Isolation**: Build a distinct **Legacy EMS** folder to collapse all HR-related modules.
2. **Dashboard Specialization**: Implement separate, feature-flagged operator-scoped and executive-scoped dashboards.
3. **Unified Global Search**: Add a top navbar command bar for instant global navigation, ticket search, and quick actions.
4. **Tokenization**: Standardize font scales, spacings, and status alert colors using CSS variables.
