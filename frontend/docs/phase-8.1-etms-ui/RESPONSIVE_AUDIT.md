# Responsive Audit — ETMS UI Transformation

**Date:** 2026-06-19  
**Breakpoints:** Desktop ≥1024px · Tablet 768–1023px · Mobile <768px

---

## Sidebar

| Breakpoint | Behavior | Status |
|------------|----------|--------|
| Desktop | Sticky, 260px expanded / 64px collapsed | Implemented |
| Tablet | Drawer overlay (same as mobile) | Implemented via existing mobile drawer |
| Mobile | Full-screen drawer + backdrop | Implemented |

**Improvement vs prior:** ETMS mode reduces default expanded groups → less scroll on mobile when flags on.

---

## Header

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Global Search | Icon/compact | Compact | Full bar |
| Create Ticket | Hidden sm | Visible | Visible |
| Department selector | Hidden | Hidden md+ | Visible |
| Theme toggle | Hidden sm | Visible | Visible |
| Profile | Visible | Visible | Visible |

---

## Dashboard (ETMS Command)

| Component | Layout |
|-----------|--------|
| KPI Grid | 1 col → 2 col sm → 3 col xl |
| Status + Dept charts | 1 col → 2 col lg |
| Activity feed | Full width |

---

## Ticket List

| Feature | Responsive |
|---------|------------|
| Table | Horizontal scroll on small screens (existing) |
| Filters | Stack on mobile (existing) |
| Pagination | Touch-friendly buttons |

---

## Ticket Detail

| Status | Notes |
|--------|-------|
| Pending | 3-column layout not yet implemented — current single column stacks on mobile |

---

## Notification Center Tabs

| Breakpoint | Layout |
|------------|--------|
| Mobile | 2-column tab grid |
| md+ | 5-column tab grid |

---

## Validation Checklist

- [x] Sidebar drawer closes on nav click (mobile)
- [x] Skip link visible on focus
- [x] Header height 56px (h-14) in ETMS shell
- [ ] Tablet default collapsed sidebar (future: media query in SidebarContext)
- [ ] Ticket detail responsive 3-column stack

**Responsive readiness:** 80%
