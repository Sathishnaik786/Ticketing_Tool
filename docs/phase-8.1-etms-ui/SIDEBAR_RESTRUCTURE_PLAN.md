# Sidebar Restructure Plan — Ticketra ETMS

**Date:** 2026-06-19  
**Version:** 1.0  
**Target file:** `frontend/src/components/layout/AppLayout.tsx` (+ new nav config)

---

## Objective

Replace the monolithic 9-group EMS-first `navGroups` array with a **composable ETMS-primary navigation system** that:

1. Surfaces ETMS modules first (10 top-level groups)
2. Tucks all EMS items under **Legacy EMS** (collapsed by default)
3. Preserves all routes and RBAC
4. Matches modern SaaS sidebar patterns (Jira/Freshservice)

---

## Current vs Target Structure

### Current (AppLayout.tsx lines 87–169)

```
[9 EMS groups — ~35 items, expanded by default]
+ ticketingNavGroups
+ ticketFeedbackNavGroups
+ ticketAssignmentNavGroups
+ ... (8 module spreads, appended last)
```

### Target

```
[ETMS Primary — 10 groups]
+ [Legacy EMS — 1 collapsible mega-group, collapsed by default]
```

---

## Implementation Architecture

### Step 1 — Central Nav Config

Create `frontend/src/config/navigation.ts`:

```typescript
export interface NavItem {
  title: string;
  href: string;
  icon: ElementType;
  roles?: string[];
  badge?: 'count' | 'dot';
}

export interface NavGroup {
  label: string;
  icon?: ElementType;
  items: NavItem[];
  defaultExpanded?: boolean;
  featureFlag?: () => boolean;
  isLegacy?: boolean;
}

export const etmsNavGroups: NavGroup[] = [ /* primary */ ];
export const legacyEmsNavGroups: NavGroup[] = [ /* legacy */ ];
export const allNavGroups: NavGroup[] = [ ...etmsNavGroups, ...legacyEmsNavGroups ];
```

### Step 2 — Refactor Module Nav Files

Each `*.nav.ts` exports items only; parent group defined in central config:

| File | Change |
|------|--------|
| `ticketing.nav.ts` | Export `ticketingNavItems[]` not groups |
| `ticket-assignment.nav.ts` | Export items for Assignments group |
| `approval-management.nav.ts` | Export items for Approvals group |
| etc. | Same pattern |

**Alternative (lower risk):** Keep module nav files; `navigation.ts` imports and re-groups them without changing module exports initially.

### Step 3 — Legacy EMS Group

Single sidebar section:

```typescript
{
  label: 'Legacy EMS',
  icon: Archive,
  defaultExpanded: false,
  isLegacy: true,
  items: [
    { title: 'Payroll', href: '/app/payroll', icon: CreditCard, roles: ['ADMIN', 'HR'] },
    { title: 'Attendance', href: '/app/attendance', icon: Clock },
    { title: 'Leaves', href: '/app/leaves', icon: Calendar },
    { title: 'Projects', href: '/app/projects', icon: FolderKanban },
    { title: 'Meetups', href: '/app/meetups', icon: Users2 },
    { title: 'Updates', href: '/app/updates/daily', icon: Sparkles },
    // Calendar optional: /app/calendar
  ],
}
```

**Payroll deep links:** Do NOT flatten 20+ payroll routes into Legacy EMS. Payroll nav item lands on `/app/payroll` which uses existing payroll module sub-nav/layout.

**Consolidated EMS groups mapping:**

| Old AppLayout Groups | Legacy Destination |
|---------------------|-------------------|
| Workforce Intelligence | Payroll module |
| Operational Cycles | Payroll module |
| Governance & Compliance | Payroll module |
| Financial Orchestration | Payroll module |
| Predictive Analytics | Payroll module |
| Personalized Portal (payslips) | Payroll module / profile |
| Human Capital (attendance, leaves) | Legacy top-level items |
| Strategic Assets (documents, reports) | Legacy or Administration |
| Executive Overview (meetups) | Legacy → Meetups |

### Step 4 — ETMS Primary Groups

```typescript
const etmsNavGroups: NavGroup[] = [
  {
    label: 'Dashboard',
    defaultExpanded: true,
    items: [
      { title: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Tickets',
    defaultExpanded: true,
    featureFlag: isTicketingEnabled,
    items: [
      { title: 'My Tickets', href: '/app/tickets?scope=mine', icon: Ticket },
      { title: 'Team Tickets', href: '/app/tickets?scope=team', icon: Users },
      { title: 'All Tickets', href: '/app/tickets?scope=all', icon: Layers },
      { title: 'Create Ticket', href: '/app/tickets/new', icon: PlusCircle },
    ],
  },
  // Assignments, Approvals, Knowledge Base, Communications, Analytics, Notifications, Administration
];
```

### Step 5 — Default Expanded State

Update `localStorage` key to `ticketra_sidebar_sections`:

```typescript
const DEFAULT_EXPANDED: Record<string, boolean> = {
  'Dashboard': true,
  'Tickets': true,
  'Assignments': true,
  'Approvals': false,
  'Knowledge Base': false,
  'Communications': false,
  'Analytics': false,
  'Notifications': false,
  'Administration': false,
  'Legacy EMS': false,  // CRITICAL — collapsed by default
};
```

Migrate old key on first load.

---

## Visual Redesign (Sidebar)

### Brand Header

```
[Logo] Ticketra
       Enterprise Ticket Management
```

Replace `EmtsWordmark` + "Enterprise OS" subtitle.

### Sidebar Container

| Property | Current | Target |
|----------|---------|--------|
| Background | white/90 + glass | `--color-surface` |
| Width expanded | 280px | 260px |
| Width collapsed | 88px | 64px |
| Border radius | 2.5rem | 0 (flush) or 12px on mobile drawer |
| Active indicator | Cyan glow capsule | Left 3px primary border + muted bg |
| Group labels | 9px uppercase cyan | 12px label, text-secondary |

### Legacy EMS Styling

- Muted stone/gray group label
- `Archive` icon on group header
- Optional "(Legacy)" suffix in collapsed tooltip
- No cyan accent on legacy active states — use `--color-legacy`

### Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| Desktop (≥1024px) | Sticky sidebar, collapsible |
| Tablet (768–1023px) | Collapsed by default, overlay on expand |
| Mobile (<768px) | Drawer overlay, ETMS groups only in first scroll viewport |

---

## AppLayout Code Changes

### Remove

- Inline 9-group `navGroups` array (lines 87–160)
- Inline `#c1e1ec` background style
- Cyan-heavy mesh backgrounds (optional reduce)
- Duplicate module group spreads at bottom

### Add

```typescript
import { allNavGroups } from '@/config/navigation';
import { filterNavGroups } from '@/config/navigation.utils';
```

```typescript
const visibleGroups = filterNavGroups(allNavGroups, user, featureFlags);
```

### Active Route Matching

Enhance for query params:

```typescript
const isActive = (item: NavItem) => {
  const [path, query] = item.href.split('?');
  if (query) {
    return location.pathname === path && location.search.includes(query.split('=')[1]);
  }
  return location.pathname === path || location.pathname.startsWith(path + '/');
};
```

---

## Top Navbar Additions (Same PR or Follow-up)

| Element | Component | Location |
|---------|-----------|----------|
| Quick Create Ticket | `QuickCreateTicketButton` | Header right, before notifications |
| Theme Switch | `ThemeToggle` from auth | Header right |
| Department Selector | `DepartmentSelector` | Header right |

---

## Administration Group

Consolidate admin functions:

```typescript
{
  label: 'Administration',
  roles: ['ADMIN', 'HR'],
  items: [
    { title: 'Users', href: '/app/admin/users', icon: Users, roles: ['ADMIN'] },
    { title: 'Departments', href: '/app/departments', icon: Building2 },
    { title: 'Roles', href: '/app/admin/roles', icon: ShieldCheck, roles: ['ADMIN'] },
    { title: 'Settings', href: '/app/payroll/settings', icon: Settings, roles: ['ADMIN'] },
  ],
}
```

---

## Command Palette & Global Search Updates

Update `CommandPalette` and `GlobalSearch` indices to prioritize ETMS destinations:

1. Create Ticket
2. My Tickets
3. My Queue
4. Notifications
5. Knowledge Base Search
6. Legacy EMS items (lower rank)

---

## Migration Checklist

- [ ] Create `navigation.ts` + utils
- [ ] Map all 35 EMS items to Legacy EMS or Administration
- [ ] Reorder module nav imports
- [ ] Update `localStorage` defaults + migration
- [ ] Rebrand sidebar header
- [ ] Apply design tokens (surface, radius, primary accent)
- [ ] Update expanded section persistence tests
- [ ] Update nav snapshot tests in module test files
- [ ] Verify RBAC filtering unchanged
- [ ] Verify all payroll deep links still reachable via `/app/payroll`
- [ ] Mobile QA — Legacy EMS collapsed reduces scroll by ~80%

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Users lose payroll shortcuts | Payroll landing retains full sub-nav |
| Bookmark breakage | No URL changes |
| Feature flag off hides ETMS | Legacy EMS still works; show empty state on dashboard |
| localStorage conflicts | Migrate key with one-time read |

---

## Files Touched (Estimated)

| File | Change Type |
|------|-------------|
| `frontend/src/config/navigation.ts` | New |
| `frontend/src/config/navigation.utils.ts` | New |
| `frontend/src/components/layout/AppLayout.tsx` | Major refactor |
| `frontend/src/modules/*/ *.nav.ts` | Relabel/regroup (8 files) |
| `frontend/src/components/common/CommandPalette.tsx` | Update index |
| `frontend/src/components/common/GlobalSearch.tsx` | Update index |
| Tests | Nav order, legacy collapsed default |

---

**Related:** [INFORMATION_ARCHITECTURE.md](./INFORMATION_ARCHITECTURE.md), [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
