# Ticketra ETMS — Sidebar Restructure Plan

**Prepared by:** UX Architect & Senior Frontend Engineer  
**Status:** Complete  
**Date:** June 20, 2026

---

## 1. Visual Restructuring

The sidebar is restructured to prioritize ticket management and operations, moving legacy EMS systems (Payroll, Attendance, Leaves, etc.) into a collapsible drawer at the bottom of the navigation stream.

```
+-----------------------------+
|  TICKETRA                   |  <- System Brand Logo & Header
+-----------------------------+
|                             |
|  [-] SERVICES               |  <- Group header (Primary)
|   [#] Dashboard             |  <- Ticketra Command Center
|   [o] Tickets               |  <- Multi-level: My, Team, Create, All
|   [x] Assignments           |  <- Work Queues
|   [v] Approvals             |  <- Pending & History logs
|                             |
|  [-] UTILITIES              |  <- Group header
|   [?] Knowledge Base        |  <- Self-service KB
|   [@] Communications        |  <- Chat & Announcements
|   [*] Analytics             |  <- Executive & SLA BI
|                             |
|  [-] CONFIGURATION          |  <- Administration
|   [s] System Settings       |
|                             |
|  [+] Legacy EMS (Collapsed) |  <- Collapsible container (Default Closed)
|                             |
+-----------------------------+
```

---

## 2. Interaction Design

### A. Collapsible Behavior
- Clicking on a group header collapses or expands its respective items dynamically.
- The sidebar can be collapsed to a slim icon-only bar (`isSidebarCollapsed: true`), expanding automatically when hovered over to preserve screen space.
- Legacy EMS remains closed by default in local storage to prevent navigation clutter.

### B. Responsive Grid Layout
- **Desktop (>= 1024px)**: Sidebar remains docked on the left margin, occupying a fixed width of `280px` (`80px` in collapsed state).
- **Tablet (768px - 1023px)**: Automatically switches to collapsed state, keeping only the icons visible.
- **Mobile (< 768px)**: Hidden off-screen by default. Replaced with a slide-out drawer (sheet component) triggered from the top navbar.

---

## 3. Style Tokens & Dark Mode Compatibility

Sidebar styling utilizes standard variables to match modern SaaS aesthetics (e.g., Jira, Zendesk):

```css
.sidebar-container {
  background-color: hsl(var(--card));
  border-right: 1px solid hsl(var(--border));
  color: hsl(var(--foreground));
  transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-item-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--muted-foreground));
  transition: all 0.15s ease;
}

.sidebar-item-link:hover {
  background-color: hsl(var(--primary) / 0.08);
  color: hsl(var(--primary));
}

.sidebar-item-link.active {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

/* Legacy Section Styles */
.legacy-group-header {
  border-top: 1px solid hsl(var(--border));
  margin-top: 16px;
  padding-top: 16px;
  opacity: 0.85;
}
```

---

## 4. Navigation Links Mapping

Each menu option resolves to a distinct icon indicator to support visual navigation:

| Menu Item | Target Path | Lucide Icon | Roles Scope |
|---|---|---|---|
| Dashboard | `/app/dashboard` | `LayoutDashboard` | ALL |
| Tickets | `/app/tickets` | `Ticket` | ALL |
| Assignments | `/app/assignments` | `ClipboardList` | MANAGER, ADMIN |
| Approvals | `/app/approvals` | `CheckSquare` | ALL |
| Knowledge Base | `/app/knowledge-base`| `BookOpen` | ALL |
| Communications | `/app/communications`| `MessageSquare` | ALL |
| Analytics | `/app/analytics` | `BarChart3` | MANAGER, HR, ADMIN |
| Legacy EMS | `/app/legacy-ems` | `Archive` | ALL |
