# Ticketra ETMS — Screen Inventory

**Prepared by:** Senior Frontend Engineer & UX Architect  
**Status:** Complete  
**Date:** June 20, 2026

---

## 1. Authentication Screens

### A. Sign In Page (`/login`)
- **Components**: Email lookup input, password field, remembered credentials option, links to password recovery, secondary branding elements.
- **Accessibility**: ARIA labels on email formatting triggers; sequential keyboard focus.

### B. Forgot Password (`/forgot-password`)
- **Components**: Recovery email input, submission confirmations, security warnings.
- **Accessibility**: Status messages announced to screen readers upon sending recovery links.

### C. Reset Password (`/reset-password`)
- **Components**: Verification code matching fields, password criteria check (strength indicators).
- **Accessibility**: Inline alerts tracking password complexity validation requirements.

---

## 2. Core Workspace Structure

### A. Top Navigation Bar
- **Components**: Global search input, unified notifications bell with unread badges, quick create button, user avatar dropdown, dark/light theme switch, and department selector.

### B. Navigation Sidebar
- **Components**: Brand section logo, collapsible group categories, and the Legacy EMS collapsible group.

---

## 3. Ticketing Management Screens

### A. Ticket List Page (`/app/tickets`)
- **Components**: 
  - Standardized enterprise grid/table listing Ticket ID, Title, Priority, Status, Department, Assigned Agent, and Due Date.
  - Controls for inline sorting, multi-column filters, and full-text search.
  - Action tray for bulk operations (triage, close, reassign, export to CSV/XLSX).

### B. Ticket Creation Form (`/app/tickets/new`)
- **Components**: Text title field, rich-text description area, priority select dropdown, department routing selectors, and drag-and-drop attachment zones.

### C. Ticket Details Page (`/app/tickets/:id`)
- **Three-Column Interface**:
  - *Left (Metadata)*: Detailed ticket fields (Assignee, watch list, created timestamps).
  - *Center (Communications)*: Interactive chronological feed for chat messages, system activities, and files history.
  - *Right (SLA & Status)*: Resolution time SLA timers, approval state indicators, and escalation records.

---

## 4. Workflows & Approvals

### A. Approvals Hub (`/app/approvals`)
- **Sub-Views**:
  - *Pending*: Active approval requests requiring action.
  - *Approved*: History log of authorized actions.
  - *Rejected*: History log of rejected requests.

### B. Workflow Designer
- **Components**: Drag-and-drop transition pathways (limited to Admin role) to map ticket lifecycles.

---

## 5. Knowledge Base

### A. Articles Browser (`/app/knowledge-base`)
- **Components**: Search input field, category tags grid, and highlighted articles feed.

### B. Category Index (`/app/knowledge-base/categories`)
- **Components**: Folder list categorizing guides (e.g. IT, HR, Finance, Facilities).

### C. Authoring Portal (`/app/knowledge-base/manage`)
- **Components**: WYSIWYG editor panel, tag assignments inputs, and article statistics trackers.

---

## 6. Unified Notification Center

### A. Notification Feeds (`/app/notifications`)
- **Target Tabs**:
  - *Unread*: All active, unaddressed notifications.
  - *Mentions*: User tagging events inside threads.
  - *Approvals*: Alerts for signature actions.
  - *System*: Server warnings, backups, and security events.
  - *Announcements*: Broadcast events.

---

## 7. Legacy EMS Modules

All legacy components are mounted under `/app/legacy-ems/*` inside a collapsed folder:

- **Payroll Portal**: Published payslips history list, cycle statements summary, and salary master sheets.
- **Attendance Monitor**: Monthly calendar of hours worked and clock-in/out records.
- **Leave Request Hub**: Leave balances trackers and request history list.
- **Projects Board**: Project dashboards and task boards.
- **Meetups Tracker**: Corporate event calendars and meetup request forms.
- **Updates Center**: Employee daily/weekly progress summary logs.
