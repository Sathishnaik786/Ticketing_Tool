# Screen Inventory — Ticketra ETMS

**Date:** 2026-06-19  
**Version:** 1.0  
**Legend:** ✅ Exists | 🔄 Redesign | 🆕 New | 📦 Legacy EMS | 🔒 Feature-flagged

---

## Public & Marketing Screens

| Route | Screen | Status | Domain |
|-------|--------|--------|--------|
| `/` | Landing | ✅ | Marketing |
| `/workforce` | WorkforcePage | ✅ | EMS marketing |
| `/payroll` | PayrollPage | ✅ | EMS marketing |
| `/intelligence` | IntelligencePage | ✅ | Mixed |
| `/governance` | GovernancePage | ✅ | Mixed |
| `/operations` | OperationsPage | ✅ | Mixed |
| `/about` | AboutPage | ✅ | Marketing |
| `/security-standards` | SecurityStandardsPage | ✅ | Marketing |
| `/enterprise-sla` | EnterpriseSLAPage | ✅ | ETMS marketing |
| `/contact-sales` | ContactSalesPage | ✅ | Marketing |
| `/login` | Login | ✅ | Shared |
| `/forgot-password` | ForgotPassword | ✅ | Shared |
| `/reset-password` | ResetPassword | ✅ | Shared |

---

## ETMS Primary Screens

### Dashboard & Analytics

| Route | Screen | File | Status | Action |
|-------|--------|------|--------|--------|
| `/app/dashboard` | Command Dashboard | `pages/Dashboard.tsx` | ✅ 🔄 | Replace HR content with ETMS KPIs |
| `/app/executive-dashboard` | Executive Dashboard | `modules/executive-analytics/pages/ExecutiveDashboardPage.tsx` | ✅ 🔄 | Extend charts per spec |
| `/app/operator-dashboard` | Operator Dashboard | — | 🆕 | New page |
| `/app/sla-dashboard` | SLA Dashboard | — | 🆕 | New page |
| `/app/department-analytics` | Department Analytics | `DepartmentAnalyticsPage.tsx` | ✅ | Nav relabel |
| `/app/business-unit-analytics` | Business Unit Analytics | `BusinessUnitAnalyticsPage.tsx` | ✅ | Under Analytics |
| `/app/analytics-reports` | Analytics Reports | `AnalyticsReportsPage.tsx` | ✅ | Nav relabel |

### Tickets

| Route | Screen | File | Status | Action |
|-------|--------|------|--------|--------|
| `/app/tickets` | Ticket List | `modules/ticketing/pages/TicketListPage.tsx` | ✅ 🔄 | Enterprise data table |
| `/app/tickets?scope=mine` | My Tickets | Same + filter | ✅ 🔄 | Query scope |
| `/app/tickets?scope=team` | Team Tickets | Same + filter | ✅ 🔄 | Query scope |
| `/app/tickets?scope=all` | All Tickets | Same + filter | ✅ 🔄 | Query scope |
| `/app/tickets/new` | Create Ticket | `TicketCreatePage.tsx` | ✅ | Header quick action |
| `/app/tickets/:ticketId` | Ticket Detail | `TicketDetailPage.tsx` | ✅ 🔄 | 3-column layout |

**Ticket Detail Target Layout:**

| Column | Content | Components (existing) |
|--------|---------|----------------------|
| Left | Ticket info, priority, status, assignee, dept | Form fields, badges |
| Center | Conversation timeline | `TicketTimeline`, `TicketCommentList` |
| Right | SLA, approval, activity log | `TicketSlaCard`, approval tab, activity |

### Assignments

| Route | Screen | File | Status |
|-------|--------|------|--------|
| `/app/my-queue` | Assigned To Me | `modules/ticket-assignment/pages/MyQueuePage.tsx` | ✅ |
| `/app/team-queue` | Team Assignments | `TeamQueuePage.tsx` | ✅ |
| `/app/assignment-analytics` | Workload | `AssignmentAnalyticsPage.tsx` | ✅ |

### Approvals

| Route | Screen | File | Status |
|-------|--------|------|--------|
| `/app/approvals` | Approval Dashboard | `ApprovalDashboardPage.tsx` | ✅ |
| `/app/my-approvals` | My Approvals (tabs) | `MyApprovalsPage.tsx` | ✅ 🔄 Add status tabs |
| `/app/approval-analytics` | Approval Analytics | `ApprovalAnalyticsPage.tsx` | ✅ |

### Knowledge Base

| Route | Screen | File | Status |
|-------|--------|------|--------|
| `/app/knowledge-base` | Articles | `KnowledgeBasePage.tsx` | ✅ |
| `/app/knowledge-base/categories` | Categories | — | 🆕 |
| `/app/knowledge-base/search` | Search | — | 🆕 (or enhance `KnowledgeSearch`) |
| `/app/articles/:id` | Article Detail | `ArticleDetailPage.tsx` | ✅ |
| `/app/article-editor` | Article Editor | `ArticleEditorPage.tsx` | ✅ |
| `/app/kb-analytics` | KB Analytics | `KnowledgeAnalyticsPage.tsx` | ✅ |

### Communications

| Route | Screen | File | Status |
|-------|--------|------|--------|
| `/app/communications` | Communications Hub | `CommunicationsPage.tsx` | ✅ 🔄 Tab: Chat |
| `/app/communications/announcements` | Announcements | — | 🆕 |
| `/app/communications/discussions` | Discussions | — | 🆕 |
| `/app/activity-timeline` | Activity Timeline | `ActivityTimelinePage.tsx` | ✅ |
| `/app/communication-analytics` | Comm Analytics | `CommunicationAnalyticsPage.tsx` | ✅ |

### Notifications

| Route | Screen | File | Status |
|-------|--------|------|--------|
| `/app/notifications` | Notification Center | `NotificationCenterPage.tsx` | ✅ 🔄 Unified tabs |
| `/app/notification-analytics` | Notification Analytics | `NotificationAnalyticsPage.tsx` | ✅ |

**Notification Center Target Tabs:**

| Tab | Content |
|-----|---------|
| Unread | Unread notifications |
| Mentions | @mentions |
| Approvals | Approval-related |
| System | System alerts |
| Announcements | Org announcements |

### Feedback (ETMS Module)

| Route | Screen | File | Status |
|-------|--------|------|--------|
| `/app/feedback-analytics` | CSAT Analytics | `FeedbackAnalyticsPage.tsx` | ✅ 🔒 |

---

## Administration Screens

| Route | Screen | File | Status | Action |
|-------|--------|------|--------|--------|
| `/app/admin/users` | User Management | `pages/AdminUsers.tsx` | ✅ | Add to Administration nav |
| `/app/departments` | Departments | `pages/Departments.tsx` | ✅ | Move to Administration nav |
| `/app/admin/roles` | Roles | — | 🆕 | Optional Phase 2 |
| `/app/payroll/settings` | Platform Settings | payroll module | ✅ | Link from Administration |
| `/app/profile` | User Profile | `pages/Profile.tsx` | ✅ | User menu only |

---

## Legacy EMS Screens (Preserved — 📦)

### Core HR

| Route | Screen | File | Nav (Target) |
|-------|--------|------|--------------|
| `/app/employees` | Employees | `Employees.tsx` | Administration or Legacy |
| `/app/attendance` | Attendance | `Attendance.tsx` | Legacy EMS |
| `/app/leaves` | Leaves | `Leaves.tsx` | Legacy EMS |
| `/app/calendar` | Calendar | `Calendar.tsx` | Legacy (optional) |
| `/app/meetups` | Meetups | `Meetups.tsx` | Legacy EMS |
| `/app/documents` | Documents | `Documents.tsx` | Legacy or Admin |
| `/app/reports` | Reports | `Reports.tsx` | Legacy EMS |
| `/app/payroll/my-payslips` | My Payslips | `MyPayslips.tsx` | Legacy → Payroll |

### Projects

| Route | Screen | File | Nav (Target) |
|-------|--------|------|--------------|
| `/app/projects` | Projects | `Projects.tsx` | Legacy EMS |
| `/app/my-projects` | My Projects | `MyProjects.tsx` | Legacy EMS |
| `/app/projects/:id` | Project Detail | `ProjectDetail.tsx` | Legacy EMS |

### Updates Module

| Route | Screen | File | Nav (Target) |
|-------|--------|------|--------------|
| `/app/updates/daily` | Daily Updates | updates module | Legacy EMS |
| `/app/updates/weekly` | Weekly Updates | updates module | Legacy EMS |
| `/app/updates/monthly` | Monthly Updates | updates module | Legacy EMS |
| `/app/updates/analytics` | Updates Analytics | updates module | Legacy EMS |
| `/app/updates/automation` | Automation | updates module | Legacy EMS |

### Payroll Module (30+ routes)

All routes under `/app/payroll/*` preserved. Entry: **Legacy EMS → Payroll**.

Key sub-screens:

| Area | Example Routes |
|------|----------------|
| Dashboard | `/app/payroll` |
| Governance | `/app/payroll/governance/*` |
| Components | `/app/payroll/components/*` |
| Structures | `/app/payroll/structures/*` |
| Cycles | `/app/payroll/cycles/*` |
| Bulk | `/app/payroll/bulk/*` |
| Compliance | `/app/payroll/compliance/*` |
| Finance | `/app/payroll/finance/*` |
| Analytics | `/app/payroll/analytics`, `/app/payroll/variance` |

---

## Shared / System Screens

| Route | Screen | File |
|-------|--------|------|
| `/app/unauthorized` | Unauthorized | `Unauthorized.tsx` |
| `*` | Not Found | `NotFound.tsx` |

---

## Overlay / Drawer UI (Not Routes)

| Component | File | Status | Action |
|-----------|------|--------|--------|
| Global Search | `GlobalSearch.tsx` | ✅ | Extend ETMS index |
| Command Palette | `CommandPalette.tsx` | ✅ | ETMS-first commands |
| Quick Action Launcher | `QuickActionLauncher.tsx` | ✅ | Add Create Ticket |
| Chat Drawer | `ChatDrawer.tsx` | ✅ | Link to Communications |
| Notification Bell | `NotificationBell.tsx` | ✅ | Consolidate with center |
| Unread Badge | `UnreadBadge.tsx` | ✅ | Unified notifications |
| Floating Operations Panel | `FloatingOperationsPanel.tsx` | ✅ | Review EMS actions |
| MegaMenu | `MegaMenu.tsx` | ⚠️ | Remove or wire trigger |

---

## Screen Count Summary

| Category | Count |
|----------|-------|
| ETMS primary (existing) | ~25 |
| ETMS new screens | 5 |
| ETMS redesign | ~8 |
| Legacy EMS (preserved) | ~45 |
| Marketing / auth | 14 |
| **Total routed screens** | ~90 |

---

## Priority Matrix

| Priority | Screens |
|----------|---------|
| P0 | Command Dashboard, Sidebar, Ticket List, Ticket Detail |
| P1 | Operator Dashboard, Notification Center tabs, Top navbar |
| P2 | SLA Dashboard, KB categories/search, Communications split |
| P3 | Roles admin, Settings hub, MegaMenu cleanup |

---

**Related:** [DASHBOARD_REDESIGN_PLAN.md](./DASHBOARD_REDESIGN_PLAN.md), [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md)
