# Phase 8.0.6 — UI Audit

**Date:** 2026-06-19  
**Mode:** Audit only

---

## Navigation Architecture

`AppLayout.tsx` defines **9 static nav groups** (EMS/payroll-heavy) plus **8 additive ETMS nav spreads** from phase modules.

### EMS-Dominant Sidebar Groups (~35 nav items)

| Group | Items | Class |
|-------|-------|-------|
| Executive Overview | Dashboard, Meetups | SHARED |
| Workforce Intelligence | Payroll control, governance, components, salary matrix | **LEGACY EMS** |
| Operational Cycles | Payroll engine, bulk, assignments, approvals | **LEGACY EMS** |
| Governance & Compliance | Statutory ledger, compliance, tax | **LEGACY EMS** |
| Financial Orchestration | Journals, disbursements, ERP | **LEGACY EMS** |
| Predictive Analytics | Workforce trends, variance | **LEGACY EMS** |
| Personalized Portal | Profile, payslips, deductions | MIXED |
| Human Capital Management | Employees, departments, attendance, leaves | **LEGACY EMS** |
| Strategic Assets | Documents, reports, settings | **LEGACY EMS** |

### ETMS Nav (Feature-Flag Gated)

Injected via module `.nav.ts` files — visible only when respective `VITE_ENABLE_*` flags true.

---

## Page Inventory

### Public / Marketing (11 routes)

| Route | Page | ETMS | EMS |
|-------|------|------|-----|
| `/` | Landing | ✓ | ✓ |
| `/workforce`, `/payroll`, `/intelligence`, etc. | Marketing | Mixed EMS branding | **LEGACY EMS marketing** |
| `/login`, `/forgot-password`, `/reset-password` | Auth | SHARED | SHARED |

### Protected App Shell (`/app/*`)

| Route | Page | Status |
|-------|------|--------|
| `/app/dashboard` | Dashboard | **SHARED** — may show mixed widgets |
| `/app/employees`, `/app/departments` | Org management | **SHARED** |
| `/app/attendance`, `/app/leaves` | HR ops | **LEGACY EMS** |
| `/app/documents`, `/app/reports` | HR assets | **LEGACY EMS** |
| `/app/calendar`, `/app/meetups` | Collaboration | **LEGACY EMS** |
| `/app/projects/*` | Project mgmt | **LEGACY EMS** |
| `/app/payroll/*` | 30+ payroll sub-routes | **LEGACY EMS** |
| `/app/tickets/*` | Ticketing module | **ETMS ACTIVE** |
| Phase 7.x routes | Feedback, assignment, comms, approvals, KB, analytics, notifications | **ETMS ACTIVE** |

---

## Component Audit

### Shared UI (`frontend/src/components/ui/`)

~40 shadcn/Radix components — **ACTIVE**, used by both domains. **DO NOT TOUCH.**

### EMS-Specific Components

| Component | Location | Status |
|-----------|----------|--------|
| `PayrollSkeletons.tsx` | `components/payroll/` | **LEGACY EMS** |
| `LeaveForm.tsx` | `components/forms/` | **LEGACY EMS** |
| `AnalyticsOverview.tsx` | `components/dashboard/` | **LEGACY EMS** (HR analytics) |
| `UpdatesQuickAccess.tsx` | `components/dashboard/` | **LEGACY EMS** |
| `ApprovalsPanel.tsx` | `components/common/` | **UNKNOWN** — may be payroll approvals |

### ETMS Components

All under `frontend/src/modules/{ticketing,ticket-*,approval,knowledge,executive,notification}*/components/` — **ACTIVE**

### Duplicate / Overlapping UI

| Issue | Details |
|-------|---------|
| Dual notification UIs | `NotificationBell` (legacy) + `UnreadBadge` (7.8 center) — intentional parallel |
| Dual analytics | HR `Reports.tsx` page vs Executive Analytics module |
| Dashboard widgets | EMS stat cards + potential ETMS widgets not unified |
| "Approval Queue" nav | Payroll approvals vs Ticket Approval Workflow (7.5) — naming confusion |

---

## Dead / Hidden Screen Candidates

| Screen | Evidence | Classification |
|--------|----------|----------------|
| `Index.tsx` | Not in router (Landing used instead) | **DEAD** |
| `Workforce.tsx`, `Operations.tsx` etc. | Public marketing only | **ACTIVE** (marketing) |
| Ticketing routes when flag OFF | Empty route array | **HIDDEN** (by design) |
| ETMS pages with flag OFF | Not routed | **HIDDEN** (by design) |
| `work_items` UI | No page found | **DEAD** (if ever existed) |

---

## Hooks & Widgets

| Hook/Widget | Domain | Status |
|-------------|--------|--------|
| `useNotifications` | Legacy bell | **SHARED ACTIVE** |
| `useExecutiveAnalytics` | 7.7 | **ETMS ACTIVE** |
| `useNotificationCenter` | 7.8 | **ETMS ACTIVE** |
| `usePayroll` | Payroll module | **LEGACY EMS** |
| `useShortcuts` | Global | **SHARED** |
| `QuickActionLauncher` | Mixed actions | **SHARED** — may reference EMS actions |
| `GlobalSearch` | Cross-module search | **SHARED** — index scope unknown |

---

## UX Observations (No Changes Made)

1. **Sidebar overload** — ~35 EMS items vs ~15 ETMS items when all flags on
2. **Brand inconsistency** — ETMS (Ticketra) vs EMS (YVI EMS) in CORS/deployment refs
3. **Role visibility** — ETMS nav correctly role-gated; EMS payroll nav HR/ADMIN heavy
4. **Mobile nav** — Same sidebar structure; long scroll for EMS sections

---

## UI Statistics

| Metric | Count |
|--------|-------|
| Top-level pages | 32 |
| EMS-primary pages | ~18 |
| ETMS module pages | ~25 (across modules) |
| Shared pages | ~8 |
| Dead page candidates | 1–2 |
| Nav items (static EMS) | ~35 |
| Nav items (ETMS additive) | ~20 |

**No UI files modified.**
