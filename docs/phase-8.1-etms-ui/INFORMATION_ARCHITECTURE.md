# Information Architecture — Ticketra ETMS

**Date:** 2026-06-19  
**Version:** 1.0  
**Principle:** ETMS primary, EMS secondary (Legacy EMS collapsed by default)

---

## IA Principles

1. **Task-first ordering** — Most frequent ETMS tasks appear first (Dashboard → Tickets → Assignments)
2. **Progressive disclosure** — Legacy EMS hidden until explicitly expanded
3. **Consistent depth** — Max 2 levels in sidebar; deeper views via in-page tabs
4. **Role-aware visibility** — RBAC preserved; empty groups hidden per user
5. **Route stability** — All existing URLs remain valid; nav is the only reorder

---

## Target Navigation Tree

```
Ticketra ETMS
│
├── 🏠 Dashboard                          /app/dashboard
│
├── 🎫 Tickets
│   ├── My Tickets                        /app/tickets?scope=mine
│   ├── Team Tickets                      /app/tickets?scope=team
│   ├── All Tickets                       /app/tickets?scope=all
│   └── Create Ticket                     /app/tickets/new
│
├── 📋 Assignments
│   ├── Assigned To Me                    /app/my-queue
│   ├── Team Assignments                  /app/team-queue
│   └── Workload                          /app/assignment-analytics
│
├── ✅ Approvals
│   ├── Pending                           /app/my-approvals?status=pending
│   ├── Approved                          /app/my-approvals?status=approved
│   ├── Rejected                          /app/my-approvals?status=rejected
│   └── Approval Dashboard                /app/approvals
│
├── 📚 Knowledge Base
│   ├── Articles                          /app/knowledge-base
│   ├── Categories                        /app/knowledge-base/categories
│   └── Search                            /app/knowledge-base/search
│
├── 💬 Communications
│   ├── Chat                              /app/communications (chat tab)
│   ├── Announcements                     /app/communications/announcements
│   ├── Discussions                       /app/communications/discussions
│   └── Activity Timeline                 /app/activity-timeline
│
├── 📊 Analytics
│   ├── Executive Dashboard               /app/executive-dashboard
│   ├── SLA Dashboard                     /app/sla-dashboard          [NEW]
│   ├── Department Analytics              /app/department-analytics
│   └── Analytics Reports                 /app/analytics-reports
│
├── 🔔 Notifications                      /app/notifications
│
├── ⚙️ Administration                     [ADMIN, HR roles]
│   ├── Users                             /app/admin/users
│   ├── Departments                       /app/departments
│   ├── Roles                             /app/admin/roles            [NEW or profile-adjacent]
│   └── Settings                          /app/settings               [NEW hub or payroll/settings alias]
│
└── 📦 Legacy EMS                         [collapsed by default]
    ├── Payroll                           /app/payroll
    ├── Attendance                        /app/attendance
    ├── Leaves                            /app/leaves
    ├── Projects                          /app/projects
    ├── Meetups                           /app/meetups
    └── Updates                           /app/updates/daily
        └── [sub-routes preserved]
```

---

## Mapping: Current → Target

### ETMS Modules (Reorder & Relabel)

| Current Group | Current Item | Target Location |
|---------------|--------------|-----------------|
| Service Management | Tickets | Tickets → All Tickets |
| Service Management | Create Ticket | Tickets → Create Ticket |
| Service Management | Feedback Analytics | Analytics → or Tickets submenu |
| Work Queues | My Queue | Assignments → Assigned To Me |
| Work Queues | Team Queue | Assignments → Team Assignments |
| Work Queues | Assignment Analytics | Assignments → Workload |
| Approvals | Approval Dashboard | Approvals → Approval Dashboard |
| Approvals | My Approvals | Approvals → Pending (default tab) |
| Approvals | Approval Analytics | Analytics → or Approvals submenu |
| Knowledge Base | Knowledge Base | Knowledge Base → Articles |
| Knowledge Base | Article Editor | Knowledge Base → (author action, not primary nav) |
| Knowledge Base | KB Analytics | Analytics → |
| Communications | Communications | Communications → Chat |
| Communications | Activity Timeline | Communications → Activity Timeline |
| Communications | Communication Analytics | Analytics → |
| Executive Analytics | Executive Dashboard | Analytics → Executive Dashboard |
| Executive Analytics | Department Analytics | Analytics → Department Analytics |
| Executive Analytics | Business Unit Analytics | Analytics → (executive sub-page) |
| Executive Analytics | Analytics Reports | Analytics → Analytics Reports |
| Notifications | Notifications | Notifications (top-level) |
| Notifications | Notification Analytics | Analytics → or Admin |

### EMS Items → Legacy EMS

| Current Group | Items Consolidated |
|---------------|-------------------|
| Executive Overview | Meetups only (Dashboard moves to top) |
| Workforce Intelligence | → Legacy EMS → Payroll |
| Operational Cycles | → Legacy EMS → Payroll (nested or payroll landing) |
| Governance & Compliance | → Legacy EMS → Payroll |
| Financial Orchestration | → Legacy EMS → Payroll |
| Predictive Analytics | → Legacy EMS → Payroll |
| Personalized Portal | Profile stays in user menu; payslips/deductions → Legacy EMS → Payroll |
| Human Capital Management | Attendance, Leaves → Legacy EMS; Employees/Departments → Administration |
| Strategic Assets | Documents, Reports → Legacy EMS or Administration |

**Payroll sub-navigation:** When user opens Legacy EMS → Payroll, show existing payroll sub-routes via secondary nav or payroll module layout — do not flatten 20+ payroll links into primary sidebar.

### Hidden Routes — Now Discoverable

| Route | Target Nav |
|-------|------------|
| `/app/projects` | Legacy EMS → Projects |
| `/app/my-projects` | Legacy EMS → Projects (tab) |
| `/app/updates/*` | Legacy EMS → Updates |
| `/app/calendar` | Legacy EMS → (optional Calendar under Meetups) |
| `/app/admin/users` | Administration → Users |

---

## URL Strategy

### Preserve Existing Routes

All current paths remain valid. No redirects required for bookmarks.

### New Query-Param Scopes (Tickets)

| URL | Behavior |
|-----|----------|
| `/app/tickets?scope=mine` | Filter to creator/assignee = current user |
| `/app/tickets?scope=team` | Filter to user's department/team |
| `/app/tickets?scope=all` | Full list (role-gated) |

Implementation: extend `TicketListPage` filters; no new route files required.

### New Routes (Net-New Screens)

| Route | Screen | Priority |
|-------|--------|----------|
| `/app/sla-dashboard` | SLA Dashboard | P1 |
| `/app/knowledge-base/categories` | KB Categories | P2 |
| `/app/knowledge-base/search` | KB Search (dedicated) | P2 |
| `/app/communications/announcements` | Announcements | P2 |
| `/app/communications/discussions` | Discussions | P2 |
| `/app/settings` | Settings hub | P3 |
| `/app/admin/roles` | Roles management | P3 |

---

## Top Navbar IA

```
[≡ Sidebar] [Date]     [🔍 Global Search — tickets, KB, people]     [+ Create Ticket] [🔔 Notifications] [🏢 Department ▾] [🌓 Theme] [👤 Profile ▾]
```

| Element | Action |
|---------|--------|
| Global Search | Extend index: tickets, KB articles, employees, legacy modules |
| Quick Create Ticket | `/app/tickets/new` or modal shortcut |
| Notifications | Opens unified center (drawer or `/app/notifications`) |
| Department Selector | Filters dashboard/list context by department |
| Theme Switch | Light / dark / system |
| Profile | Profile, Support, Logout (existing dropdown) |

---

## Role-Based IA Visibility

| Section | ADMIN | HR | MANAGER | EMPLOYEE |
|---------|-------|-----|---------|----------|
| Dashboard | ✓ | ✓ | ✓ | ✓ |
| Tickets (all scopes) | ✓ | ✓ | ✓ | ✓ (mine only) |
| Assignments | ✓ | ✓ | ✓ | ✓ (mine only) |
| Approvals | ✓ | ✓ | ✓ | — |
| Knowledge Base | ✓ | ✓ | ✓ | ✓ |
| Communications | ✓ | ✓ | ✓ | ✓ |
| Analytics | ✓ | ✓ | partial | — |
| Notifications | ✓ | ✓ | ✓ | ✓ |
| Administration | ✓ | partial | — | — |
| Legacy EMS | ✓ | ✓ | partial | partial |

---

## Feature Flag Behavior

ETMS nav sections respect existing flags. When a module is disabled:

- Hide its nav group entirely
- Dashboard widgets for that module hidden
- Legacy EMS unaffected

**Recommended default change (deployment):** Set core ETMS flags `true` in production `.env` while keeping optional modules (feedback, notification analytics) configurable.

---

## Breadcrumb Convention

```
Dashboard > Tickets > All Tickets > TKT-1042
Dashboard > Analytics > SLA Dashboard
Dashboard > Legacy EMS > Payroll > Cycles
```

Legacy EMS appears in breadcrumbs whenever user navigates from legacy section.

---

## Search Taxonomy

| Category | Sources |
|----------|---------|
| Tickets | Ticketing API |
| Knowledge | KB articles |
| People | Employees |
| Legacy | Payroll pages, projects (static index) |

---

## IA Success Metrics

| Metric | Target |
|--------|--------|
| Clicks to create ticket | ≤ 2 (header CTA) |
| Clicks to my open tickets | ≤ 2 |
| EMS items visible without expand | 0 |
| Primary nav groups (expanded) | ≤ 10 |
| User comprehension (UAT) | 90% identify app as ticket system |

---

**Next:** [SIDEBAR_RESTRUCTURE_PLAN.md](./SIDEBAR_RESTRUCTURE_PLAN.md) for technical nav composition.
