# Ticketra ETMS — Information Architecture (IA)

**Prepared by:** UX Architect  
**Status:** Complete  
**Date:** June 20, 2026

---

## 1. Hierarchy & Sitemap

```
/ (Root Landing Page)
│
├── /login
├── /forgot-password
└── /app (Authenticated Portal Layout)
    │
    ├── /dashboard (Command Center Dashboard)
    │
    ├── /tickets (Ticketing Module)
    │   ├── /new (Create Ticket Form)
    │   ├── /mine (My Tickets list)
    │   ├── /team (Team Queue)
    │   └── /all (Enterprise Ledger)
    │
    ├── /assignments (Queue & Workload)
    │   ├── /mine (Assigned to Me)
    │   ├── /team (Team Assignments)
    │   └── /workload (Team Heatmap)
    │
    ├── /approvals (Approval Engine)
    │   ├── /pending (Needs Signature)
    │   ├── /approved (History Log)
    │   └── /rejected (Defeated Actions)
    │
    ├── /knowledge-base (Self-Service)
    │   ├── /articles (Search & View)
    │   ├── /categories (Category Index)
    │   └── /manage (Write/Edit Article)
    │
    ├── /communications (Collaboration)
    │   ├── /chat (Direct & Group channels)
    │   ├── /announcements (Broadcasts)
    │   └── /discussions (Postings)
    │
    ├── /analytics (Intelligence & BI)
    │   ├── /executive (Total Tickets, SLA, satisfaction scorecards)
    │   ├── /sla (Compliance & Escalation rates)
    │   └── /department (Department Performance charts)
    │
    ├── /notifications (Unified Notification Center)
    │
    ├── /administration (Admin Workspace)
    │   ├── /users (Clearance & Tiers)
    │   ├── /departments (Structure)
    │   ├── /roles (RBAC matrices)
    │   └── /settings (System config)
    │
    └── /legacy-ems (Collapsible Container - Default Closed)
        ├── /payroll (Wage processing)
        ├── /attendance (Hours logged)
        ├── /leaves (Leave requests)
        ├── /projects (Coordination workspaces)
        ├── /meetups (Meetings)
        └── /updates (Progress updates)
```

---

## 2. Path Mapping & Feature Flags

Each route is guarded by feature flags configuration parameters. If disabled, routers automatically redirect requests to a `404` or `503` view:

| Route Path | Feature Flag | Roles Allowed | Access Scope |
|---|---|---|---|
| `/app/dashboard` | None | ALL | Dynamic render based on role |
| `/app/tickets/*` | `VITE_ENABLE_TICKETING` | ALL | User scoped writes, global index |
| `/app/assignments/*` | `VITE_ENABLE_TICKET_ASSIGNMENTS` | MANAGER, ADMIN, HR | Queue reassignment capability |
| `/app/approvals/*` | `VITE_ENABLE_APPROVAL_ENGINE` | ALL (writes), MANAGER+ (approves) | Workflow transitions validation |
| `/app/knowledge-base/*`| `VITE_ENABLE_KNOWLEDGE_BASE` | ALL (read), ADMIN/HR (write) | Search deflection indexing |
| `/app/analytics/*` | `VITE_ENABLE_EXECUTIVE_ANALYTICS`| ADMIN, HR, MANAGER | BI data processing |
| `/app/legacy-ems/*` | `VITE_ENABLE_ETMS_NAVIGATION` | ALL | Hidden from sidebar if navigation = false |

---

## 3. Sidebar Navigation Groupings

Primary links are divided into 5 major navigation segments:
1. **Command Surface**: `/dashboard`, `/notifications`
2. **Work Management**: `/tickets`, `/assignments`
3. **Control Center**: `/approvals`, `/administration`
4. **Resources & Collaboration**: `/knowledge-base`, `/communications`
5. **Legacy Systems**: Collapsible `/legacy-ems` container

---

## 4. Navigation & Orientation Patterns

### A. Breadcrumbs
- Breadcrumb paths indicate system location (e.g. `Dashboard / Work Management / Tickets / Ticket #IT-103`).
- Legacy routes display a prefix segment tag `Legacy EMS` to explicitly signal HR-related actions.

### B. Route Redirection
- When landing on `/`, if authenticated, users are redirected to `/app/dashboard`.
- If feature flag `VITE_ENABLE_ETMS_DASHBOARD` is set to `false`, `/app/dashboard` renders the original EMS executive hub statistics.
