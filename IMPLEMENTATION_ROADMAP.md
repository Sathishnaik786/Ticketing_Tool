# Ticketra ETMS — Implementation Roadmap

**Prepared by:** Principal Product Designer, UX Architect & Senior Frontend Engineer  
**Status:** Complete  
**Date:** June 20, 2026

---

## 1. Rollout Phases

The redesign rollout is divided into 6 distinct, sequential phases to minimize regression risks and ensure continuous delivery:

```
[ Phase 1: Foundation ]
        │
        ▼
[ Phase 2: Shell & Sidebar ]
        │
        ▼
[ Phase 3: Dashboard Hub ]
        │
        ▼
[ Phase 4: Ticket Views ]
        │
        ▼
[ Phase 5: Notification Center ]
        │
        ▼
[ Phase 6: QA & Verification ]
```

---

## 2. Detailed Phase Breakdown

### Phase 1: Foundation (Tokens & Theme Scaffolding)
- **Actions**:
  - Define CSS custom variables for primary blue (`#2563EB`), success (`#10B981`), warning (`#F59E0B`), danger (`#EF4444`), and dark background (`#0F172A`) inside `frontend/src/index.css`.
  - Scaffolding of typography scales and border radius rules inside `tailwind.config.ts`.
- **Verify**: Compile checks on CSS stylesheet bindings.

### Phase 2: Navigation & Shell (Sidebar & Navbar)
- **Actions**:
  - Redesign Sidebar component: implement group headers (`Services`, `Utilities`, `Configuration`) and the `Legacy EMS` collapsible folder (default closed).
  - Add icons to all items.
  - Redesign Top Navbar: implement Global Search trigger, notifications bell, quick create button, and theme switch.
- **Verify**: UI testing on collapsed sidebar states and mobile responsive slide drawer.

### Phase 3: Dashboard Hub Redesign
- **Actions**:
  - Redesign Landing Dashboard to immediately communicate ETMS brand. Add 6 KPI top cards (Open, Assigned, Resolved, SLA %, Approvals, KB Articles).
  - Add Second Row status chart, Third Row department compliance cards, and Fourth Row live activity feed.
  - Implement role-based toggle for Operator Dashboard and Executive Dashboard views.
- **Verify**: Data aggregation checks for the 6 KPIs.

### Phase 4: Core Ticketing Page Redesigns
- **Actions**:
  - Redesign Ticket List Page (`/app/tickets`) with data table featuring sorting, category filters, text search, and bulk operations.
  - Redesign Ticket Details Page (`/app/tickets/:id`) with 3-column layout: Left (fields), Center (conversation feed), Right (SLA countdown and approval logs).
- **Verify**: User flow verification for ticket updates and comment posting.

### Phase 5: Notification Center & Command Palette
- **Actions**:
  - Implement Unified Notification Center with tabs: `Unread`, `Mentions`, `Approvals`, `System`, `Announcements`.
  - Add global command search dialog matching search indexes.
- **Verify**: WebSocket connection verification and notification feed updates.

### Phase 6: QA, Compliance & Polish
- **Actions**:
  - Verify WCAG 2.1 AA keyboard focus returns, screen reader alerts (`aria-live`), and dark mode contrast ratios.
  - Resolve any layout issues on legacy pages when viewed under the new dark mode theme.
- **Verify**: End-to-end user tests.

---

## 3. Risk Assessment & Verification Strategy

- **Risk: Legacy EMS Styling Breakage**  
  *Mitigation*: Use custom CSS classes for new ETMS component styles, ensuring they do not bleed into legacy tables.
- **Risk: Routing Breakage**  
  *Mitigation*: Keep routes under the unified `/app` hierarchy intact, only updating element page templates.
- **Risk: Local Storage Corruptions**  
  *Mitigation*: Provide fallbacks in navigation controllers if localStorage keys contain old EMS settings.
