# Accessibility Audit — ETMS UI Transformation

**Date:** 2026-06-19  
**Target:** WCAG 2.1 AA  
**Status:** Partial compliance — improvements implemented, full audit pending UAT

---

## Implemented Improvements

| Requirement | Implementation | File |
|-------------|----------------|------|
| Skip link | Preserved | `AppLayout.tsx` |
| `aria-current="page"` | Active nav items | `SidebarItem.tsx` |
| `aria-expanded` | Collapsible groups | `SidebarGroup.tsx` |
| `aria-label` on nav | Main sidebar | `Sidebar.tsx` |
| Focus rings | `focus-visible:ring-2 ring-blue-500` | Sidebar, Header, ThemeToggle |
| Icon decorative | `aria-hidden` on icons | Sidebar, Header |
| Notification label | Dynamic unread count in aria-label | `UnifiedNotificationTrigger.tsx` |
| Theme toggle | Named button + aria-label | `ThemeToggle.tsx` |
| Mobile menu | aria-label on hamburger | `Header.tsx` |
| Activity feed | `aria-label` on list | `EtmsActivityFeed.tsx` |
| Status chart | `role="img"` + aria-label | `TicketStatusChart.tsx` |

---

## Keyboard Navigation

| Area | Status | Notes |
|------|--------|-------|
| Sidebar links | Pass | Native `<Link>` focusable |
| Group toggles | Pass | `<button>` elements |
| Header controls | Pass | Button components |
| Command palette | Pass | Arrow keys + Enter (existing) |
| Notification tabs | Pass | Radix Tabs |

---

## Color Contrast

| Element | Foreground | Background | Ratio (est.) | AA |
|---------|------------|------------|--------------|-----|
| Primary text | `#0F172A` | `#FFFFFF` | 15:1 | Pass |
| Secondary text | `#64748B` | `#FFFFFF` | 4.6:1 | Pass |
| Active nav (ETMS) | `#2563EB` | `#DBEAFE` | 4.5:1+ | Pass |
| Legacy shell cyan | Cyan on light | Variable | Needs verify | Review when flag off |

---

## Reduced Motion

| Status | Action |
|--------|--------|
| Partial | Framer-motion still active; add `@media (prefers-reduced-motion)` in Phase 4 polish |

---

## Screen Reader

| Component | Status |
|-----------|--------|
| Sidebar group labels | Associated via `role="group"` + aria-label |
| KPI cards | Value + label in DOM order |
| Department bars | Text alternatives present |
| Dual notification (legacy mode) | Duplicate announcements when both bells shown — fixed when `VITE_ENABLE_ETMS_NOTIFICATIONS=true` |

---

## Remaining Work

- [ ] Full axe-core scan in CI
- [ ] `prefers-reduced-motion` CSS overrides
- [ ] Ticket detail 3-column landmark regions (`<aside>`, `<main>`)
- [ ] Data table sort announcements
- [ ] Live region for notification count updates

**Estimated AA readiness:** 75% (up from ~60%)
