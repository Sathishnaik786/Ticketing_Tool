# Phase 0 — Full Frontend Codebase Audit

**Date:** 2026-06-19  
**Scope:** `/frontend/src` — ETMS UI transformation baseline  
**Status:** Complete — no code modified during audit

---

## Executive Summary

The frontend uses a **dual navigation architecture**: nine inline EMS nav groups in `AppLayout.tsx` (~28 items, 20 payroll-related) plus eight feature-flagged module `*.nav.ts` files (~21 items). ETMS modules are appended last, making EMS the default experience. Route-level RBAC is a single four-role gate on `/app/*`; most ETMS pages have no page-level guards. Two notification systems, mock global search, and inconsistent feature-flag semantics create high-priority remediation targets.

| Metric | Value |
|--------|-------|
| Inline EMS nav groups | 9 |
| Inline nav items | 28 |
| Module nav items (all flags on) | 21 |
| Total sidebar items (max) | ~49 |
| Routed pages missing from sidebar | ≥15 |
| Dead UI components in app shell | 2 (MegaMenu trigger, FloatingOperationsPanel overlap) |

---

## 1. Existing Architecture

### 1.1 Application Shell

```
App.tsx (RouterProvider)
  └── ProtectedRoute (4 roles: ADMIN, HR, MANAGER, EMPLOYEE)
        └── AppLayout (monolithic — sidebar + header + main)
              └── <Outlet /> (page content)
```

**Key files:**
- `frontend/src/App.tsx` — route registry
- `frontend/src/components/ProtectedRoute.tsx` — auth + role gate
- `frontend/src/components/layout/AppLayout.tsx` — 614 lines, sidebar + header inline

### 1.2 Navigation Composition

```typescript
// AppLayout.tsx lines 87–169
const navGroups = [
  /* 9 inline EMS groups */,
  ...ticketingNavGroups,
  ...ticketFeedbackNavGroups,
  ...ticketAssignmentNavGroups,
  ...communicationTrackingNavGroups,
  ...approvalManagementNavGroups,
  ...knowledgeManagementNavGroups,
  ...executiveAnalyticsNavGroups,
  ...notificationCenterNavGroups,
];
```

**No central registry.** Sidebar, CommandPalette, and GlobalSearch each maintain independent destination lists.

### 1.3 Feature Flags

**File:** `frontend/src/config/features.ts`

All Phase 7 modules use opt-in: `import.meta.env.VITE_ENABLE_* === 'true'`.

Updates module (`updates.routes.tsx`) uses opt-out: `!== 'false'`.

**.env.example** sets all flags `false` → ETMS off, updates on (inverted).

**Missing flags (required by transformation plan):**
- `VITE_ENABLE_ETMS_UI_V2`
- `VITE_ENABLE_ETMS_NAVIGATION`
- `VITE_ENABLE_ETMS_DASHBOARD`
- `VITE_ENABLE_ETMS_NOTIFICATIONS`

### 1.4 Theme System

- `ThemeProvider` in `App.tsx` (`next-themes`, default light)
- `ThemeToggle` only on public/auth pages — **not in AppLayout**
- Tokens: `design-tokens.css` + `index.css` (dual layer)
- AppLayout hardcodes `#c1e1ec`, cyan/teal accents, 2.5rem radii

### 1.5 Dashboard

**File:** `frontend/src/pages/Dashboard.tsx`

| Section | Domain |
|---------|--------|
| Executive Hub header | EMS framing |
| UpdatesQuickAccess | Legacy EMS (not in sidebar) |
| ETMS quick widgets | Ticketing, feedback, comms |
| Real-time Metrics | HR stats (workforce, leaves, attendance) |
| Workforce Intelligence | HR analytics API |

---

## 2. Risks

| ID | Risk | Severity | Impact |
|----|------|----------|--------|
| R1 | Nav-only RBAC — direct URL bypass | Critical | Admin/projects/analytics reachable |
| R2 | FINANCE / SUPER_ADMIN in nav but not in `Role` type | High | Finance nav never matches; SUPER_ADMIN items dead |
| R3 | Phase 7 routes lack page-level guards | High | Any authenticated user hits URL if flag on |
| R4 | 15+ routed pages undiscoverable | High | Projects, calendar, admin users, updates |
| R5 | Payroll approval nav href mismatch | High | `/app/payroll/approvals` vs `/app/payroll/governance/approvals` |
| R6 | Dual notification systems | High | Bell + UnreadBadge, two APIs |
| R7 | Inconsistent feature-flag semantics | High | Updates vs Phase 7 |
| R8 | Mock GlobalSearch | Medium | Misleading enterprise UX |
| R9 | FAB overlap (QuickActionLauncher + FloatingOperationsPanel) | Medium | UX clutter |
| R10 | `/` shortcut conflict | Medium | Search vs CommandPalette |
| R11 | Hardcoded colors bypass tokens | Medium | Theme inconsistency |
| R12 | Monolithic AppLayout | Medium | Refactor risk, test difficulty |

---

## 3. Duplications

| Area | Duplication | Files |
|------|-------------|-------|
| Navigation definitions | Inline AppLayout + 8 module nav files + CommandPalette + GlobalSearch mock | Multiple |
| Group label | "Service Management" ×2 when ticketing + feedback enabled | `ticketing.nav.ts`, `ticket-feedback.nav.ts` |
| Notifications | NotificationBell + UnreadBadge | `NotificationBell.tsx`, `UnreadBadge.tsx` |
| Payslip route | `/app/payroll/my-payslips` in App.tsx and payroll.routes | Two components |
| CommandPalette mount | AppLayout renders; App.tsx imports unused | Dead import |
| Mesh backgrounds | AppLayout root + main content | Inline duplicates |

---

## 4. Dead Code

| Item | Location | Evidence |
|------|----------|----------|
| MegaMenu trigger | AppLayout | `isMegaMenuOpen` never set `true` |
| App.tsx imports | App.tsx | `CommandPalette`, `QuickActionLauncher`, `Routes`, `Route`, `Navigate` unused |
| `registerCommand` | CommandContext | Never called elsewhere |
| Unused lucide imports | AppLayout | LayoutGrid, Sparkles, Briefcase, etc. |
| Hardcoded chat badge | AppLayout | `unreadChatCount = 2` |
| FloatingOperationsPanel | AppLayout | Mock tabs, overlaps QuickActionLauncher |

---

## 5. Missing Routes (Nav Discovery)

| Route | Page | Target IA |
|-------|------|-----------|
| `/app/calendar` | CalendarPage | Legacy EMS |
| `/app/admin/users` | AdminUsers | Administration |
| `/app/projects`, `/app/my-projects` | Projects | Legacy EMS |
| `/app/updates/*` | Updates module | Legacy EMS |
| Bulk processing routes | Various | Payroll sub-nav |
| `/app/reports` | Reports | Legacy EMS |
| `/app/documents` | Documents | Legacy EMS |

---

## 6. Missing RBAC

### Route-level

Only parent gate: `allowedRoles={['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']}`.

### Page-level (sparse)

| Page | Guard |
|------|-------|
| AdminUsers | ADMIN only ✓ |
| Employees | Blocks EMPLOYEE ✓ |
| Most ETMS pages | None ✗ |
| Projects, Calendar | None ✗ |

### Nav-level invalid roles

| Role in nav | In `Role` type? |
|-------------|-----------------|
| FINANCE | No |
| SUPER_ADMIN | No |

**Preservation rule:** Do not weaken existing guards. Nav registry must copy exact `roles` arrays from current items.

---

## 7. Technical Debt

| Item | Recommendation |
|------|----------------|
| Monolithic AppLayout (614 lines) | Split into Sidebar + Header components |
| No nav registry | Create `config/navigation.ts` single source of truth |
| `yvi_sidebar_sections` localStorage | Migrate to `ticketra_sidebar_sections` |
| Dual notification stack | Unify behind `VITE_ENABLE_ETMS_NOTIFICATIONS` |
| Mock GlobalSearch | Wire to nav registry + API later |
| Feature flag split | Centralize in `features.ts` |
| Invalid FINANCE/SUPER_ADMIN roles | Map FINANCE → ADMIN; keep SUPER_ADMIN as ADMIN alias in filter |
| Broken payroll approvals href | Fix in legacy registry only when migrating |
| No ETMS dashboard module | Create `modules/dashboard/` |
| Cyan glow / glass-heavy UI | Replace with semantic tokens per DESIGN_SYSTEM.md |

---

## 8. Refactor Recommendations

### Priority 0 (Foundation)

1. Add feature flags: `ETMS_UI_V2`, `ETMS_NAVIGATION`, `ETMS_DASHBOARD`, `ETMS_NOTIFICATIONS`
2. Create `navigation.ts` + `navigation.utils.ts`
3. Migrate localStorage key with one-time read of legacy keys

### Priority 1 (Shell)

1. Extract `components/layout/sidebar/*` and `Header.tsx`
2. Wire AppLayout to use registry when `VITE_ENABLE_ETMS_NAVIGATION=true`
3. Legacy path: keep existing inline nav when flag false
4. Rebrand shell: Ticketra ETMS

### Priority 2 (Experience)

1. Command Dashboard refactor
2. Operator + SLA dashboard pages
3. Ticket list/detail upgrades
4. Unified notification center

### Priority 3 (Quality)

1. RBAC validation report + preserve all existing role arrays
2. Accessibility audit (aria-current, focus, contrast)
3. Responsive audit (sidebar drawer, tables)
4. Test coverage for nav order, flags, persistence

---

## 9. File Inventory

| Category | Paths |
|----------|-------|
| Layout | `components/layout/AppLayout.tsx`, `MegaMenu.tsx` |
| Nav modules | `modules/*/*.nav.ts` (8 files) |
| Search/Commands | `GlobalSearch.tsx`, `CommandPalette.tsx`, `QuickActionLauncher.tsx` |
| Notifications | `NotificationBell.tsx`, `notification-center/components/UnreadBadge.tsx` |
| Config | `config/features.ts`, `.env.example` |
| Tokens | `styles/design-tokens.css`, `index.css`, `tailwind.config.ts` |
| Dashboard | `pages/Dashboard.tsx`, `components/dashboard/*` |
| Auth/RBAC | `ProtectedRoute.tsx`, `contexts/AuthContext.tsx`, `types/index.ts` |

---

## 10. Phase 0 Exit Criteria

- [x] Architecture documented
- [x] Risks catalogued
- [x] Duplications identified
- [x] Dead code listed
- [x] Missing routes mapped
- [x] RBAC gaps noted (preserve existing behavior)
- [x] Refactor plan aligned with IMPLEMENTATION_ROADMAP.md

**Next:** Phase 1 — `navigation.ts` registry implementation.

---

**Related:** [RBAC_VALIDATION_REPORT.md](./RBAC_VALIDATION_REPORT.md), [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md)
