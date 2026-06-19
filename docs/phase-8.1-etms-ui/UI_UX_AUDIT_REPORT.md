# UI/UX Audit Report — Ticketra ETMS Transformation

**Date:** 2026-06-19  
**Scope:** Frontend application shell, navigation, dashboards, and cross-module UX  
**Status:** Audit complete — no code changes in this phase  
**Product:** Ticketra Enterprise Ticket Management System (ETMS)

---

## Executive Summary

Ticketra evolved from an Employee Management System (EMS). The authenticated application still presents **EMS as the primary experience** while ETMS modules are appended as secondary, feature-flagged additions. Users encounter payroll, attendance, and workforce terminology before tickets, assignments, and service analytics — creating cognitive friction and undermining the ETMS product identity.

**Severity:** High — affects first impression, daily navigation, and role-based task completion for service-desk operators, approvers, and executives.

**Recommendation:** Restructure information architecture (IA), rebrand the app shell, and rebuild dashboards without removing EMS functionality. EMS moves to a collapsed **Legacy EMS** section.

---

## Current State Assessment

### 1. Brand & Identity Confusion

| Surface | Current Label | Expected (ETMS) |
|---------|---------------|-----------------|
| Sidebar wordmark | "EMTS" / "Enterprise OS" | Ticketra ETMS |
| Dashboard title | "Executive Hub" | ETMS Command Dashboard |
| Dashboard subtitle | "Tracking operations and personnel health" | Ticket/service operations focus |
| Footer badge | "EMTS PLATFORM v2.5.0-PF" | Ticketra ETMS |
| `.env.example` | Employee Management System | Enterprise Ticket Management System |

**Impact:** Users cannot tell whether they are in HR/payroll software or a ticket management platform.

### 2. Navigation Hierarchy — EMS Dominates

`AppLayout.tsx` defines **9 static EMS nav groups (~35 items)** before any ETMS module groups are spread in:

```
Current sidebar order (default flags OFF):
1. Executive Overview          → Dashboard, Meetups
2. Workforce Intelligence      → 4 payroll items
3. Operational Cycles          → 4 payroll items
4. Governance & Compliance     → 3 payroll items
5. Financial Orchestration     → 3 finance items
6. Predictive Analytics        → 2 payroll analytics items
7. Personalized Portal         → Profile, payslips, deductions
8. Human Capital Management    → Employees, departments, attendance, leaves
9. Strategic Assets            → Documents, reports, settings
[+ ETMS groups when flags ON, appended at bottom]
```

**Problems:**
- ETMS items appear **after** ~35 EMS items — visually and cognitively secondary
- Duplicate group labels: "Service Management" appears twice (ticketing + feedback)
- Naming collisions: "Approval Queue" (payroll) vs "Approvals" (ticket workflow)
- Hidden routes: Projects, Updates, Calendar, Admin Users have routes but **no sidebar entry**
- Default expanded sections favor EMS groups (`localStorage` defaults all EMS groups to `true`)

### 3. Dashboard — HR-Centric, Not Ticket-Centric

**File:** `frontend/src/pages/Dashboard.tsx`

| Section | Content | Domain |
|---------|---------|--------|
| Header | "Executive Hub" | EMS framing |
| Action Center | UpdatesQuickAccess (primary), then ETMS widgets | Mixed — Updates first |
| Employee section | My Payslips card | EMS |
| KPI cards | Total Workforce, Pending Leaves, Active Presence, Attendance Rate | **100% EMS metrics** |
| Analytics | Workforce Intelligence (role-based HR analytics) | EMS |

**Missing ETMS dashboard elements:**
- Open Tickets, Assigned Tickets, Resolved Today, SLA Compliance
- Ticket status distribution chart
- Department performance (service context)
- Recent ticket/approval activity feed
- Role-specific Operator Dashboard vs Executive Dashboard split

### 4. Top Navbar — Partial ETMS Coverage

**Present today:**
- Global Search (`GlobalSearch`)
- Chat drawer trigger
- NotificationBell (legacy) + UnreadBadge (notification center)
- OnlineIndicator (profile capsule)

**Missing vs target:**
- Quick Create Ticket (CTA)
- Theme Switch (exists on landing only — `ThemeToggle` not in AppLayout)
- Department Selector
- Unified notification center entry point with tabbed experience

**Dead UI:** `MegaMenu` mounted in AppLayout with no visible open trigger.

### 5. Ticket Experience — Module Exists, Shell Does Not Support It

ETMS modules (Phase 7.x) are well-structured under `frontend/src/modules/` but isolated:

| Module | Nav Group Label | Issue |
|--------|-----------------|-------|
| Ticketing | Service Management | Only 2 items; no My/Team/All split |
| Ticket Assignment | Work Queues | Good structure, wrong IA placement |
| Approvals | Approvals | Collides with payroll "Approval Queue" |
| Knowledge Base | Knowledge Base | Missing Categories, Search as nav items |
| Communications | Communications | Missing Chat, Announcements, Discussions split |
| Executive Analytics | Executive Analytics | Separate from main dashboard; no SLA dashboard nav |
| Notifications | Notifications | Dual bell UI; no tabbed center in nav |

**Ticket List Page** (`TicketListPage.tsx`): Has filters and list view but lacks enterprise data-table features (column sorting, bulk actions, export) specified in requirements.

**Ticket Detail Page** (`TicketDetailPage.tsx`): Has timeline and SLA card components but layout is not the specified three-column professional structure.

### 6. Design System — Fragmented Tokens

Two parallel token systems coexist:

| Source | Character |
|--------|-----------|
| `design-tokens.css` | EMTS "Phase-7 Final Perfection" — large radii (2.5rem), cyan/teal glow |
| `index.css` | shadcn HSL tokens, payroll domain colors, liquid-glass utilities |
| `AppLayout.tsx` inline | `#c1e1ec` background, cyan accent overrides |

**Target tokens (user spec) not yet canonical:**
- Primary `#2563EB`, Success `#10B981`, Warning `#F59E0B`, Danger `#EF4444`
- Background `#F8FAFC`, Dark `#0F172A`
- Border radius `12px` (current: 2.5rem capsules)
- 8px spacing grid (current: fluid clamp values)

Visual language skews "premium glass HR portal" (Freshservice/Jira enterprise SaaS not yet achieved).

### 7. Responsive & Accessibility

**Strengths:**
- Skip-to-content link in AppLayout
- Sidebar collapse + mobile drawer
- Tooltip labels when sidebar collapsed
- Radix/shadcn primitives (keyboard-friendly base)

**Gaps:**
- Long EMS sidebar scroll on mobile/tablet — no section prioritization
- WCAG AA contrast not verified on cyan-on-light active states
- No `aria-current` on active nav items
- Theme toggle inaccessible in authenticated shell (dark mode partial)
- Notification center lacks unified tabbed ARIA structure

### 8. Feature Flag Impact on UX

All ETMS modules are **opt-in** (`VITE_ENABLE_* === 'true'`). Default `.env.example` has all flags `false`.

**Result:** Most deployments show pure EMS with zero ticket navigation — opposite of ETMS product goal.

---

## UX Pain Points (User-Reported Alignment)

| Pain Point | Evidence | Priority |
|------------|----------|----------|
| Payroll mixed with Tickets | Sidebar order, dashboard KPIs | P0 |
| No clear ETMS home | "Executive Hub" + HR stats | P0 |
| Legacy items compete for attention | 9 expanded EMS groups by default | P0 |
| Approvals ambiguity | Payroll queue vs ticket approvals | P1 |
| Hidden Projects/Updates | Routed but not in nav | P1 |
| Inconsistent visual language | Glass/cyan vs enterprise SaaS blue | P1 |
| Operator vs Executive views undifferentiated | Single dashboard for all roles | P1 |
| No quick ticket creation in header | Must navigate sidebar | P2 |

---

## Competitive Benchmark Gap

Reference products: Jira, Freshservice, Zendesk, ServiceNow.

| Capability | Ticketra Today | Target |
|------------|----------------|--------|
| Primary nav = service items | No | Yes |
| Grouped IA with ≤10 top-level sections | No (~17 groups) | Yes |
| Command dashboard with ticket KPIs | No | Yes |
| Global search + quick create | Search only | Both |
| Enterprise data table on list views | Partial | Full |
| Three-column ticket detail | Partial | Full |
| Legacy module tuck-away | No | Collapsed section |
| Consistent 8px grid / 12px radius | No | Yes |

---

## Audit Scorecard

| Dimension | Score (1–5) | Notes |
|-----------|-------------|-------|
| Information Architecture | 2 | EMS-first ordering |
| Visual Consistency | 3 | Strong components, mixed tokens |
| ETMS Discoverability | 2 | Feature flags + bottom placement |
| Dashboard Relevance | 2 | HR metrics dominate |
| Navigation Efficiency | 2 | 35+ items before ETMS |
| Responsive Design | 3 | Works but long scroll |
| Accessibility | 3 | Good base, gaps in nav/theme |
| Legacy Preservation | 5 | All EMS routes intact |

**Overall UX Maturity for ETMS positioning:** 2.4 / 5

---

## What Must NOT Change (Constraints)

Per product requirements and Phase 8.0 audit:

1. **Do not delete** EMS routes, pages, or payroll module code
2. **Do not remove** attendance, leaves, projects, meetups, updates functionality
3. **Preserve** existing shadcn/Radix component library
4. **Preserve** feature flags — ETMS modules remain toggleable
5. **Preserve** RBAC on all nav items and routes

---

## Recommended Transformation Pillars

1. **IA Inversion** — ETMS primary nav first; EMS under collapsed "Legacy EMS"
2. **Dashboard Split** — Command Dashboard (ETMS), Executive Dashboard, Operator Dashboard
3. **Shell Modernization** — Top navbar additions, design token unification
4. **Screen Upgrades** — Ticket list data table, ticket detail three-column layout, notification center tabs
5. **Brand Alignment** — Ticketra ETMS naming throughout authenticated shell

---

## Related Documents

| Document | Purpose |
|----------|---------|
| [INFORMATION_ARCHITECTURE.md](./INFORMATION_ARCHITECTURE.md) | Target nav tree |
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Token specification |
| [DASHBOARD_REDESIGN_PLAN.md](./DASHBOARD_REDESIGN_PLAN.md) | Dashboard layouts |
| [SIDEBAR_RESTRUCTURE_PLAN.md](./SIDEBAR_RESTRUCTURE_PLAN.md) | Sidebar implementation |
| [SCREEN_INVENTORY.md](./SCREEN_INVENTORY.md) | Full page map |
| [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md) | Phased delivery plan |

---

**Audit completed. Ready for implementation planning — no application code modified.**
