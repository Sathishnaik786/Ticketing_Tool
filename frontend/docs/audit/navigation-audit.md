# Navigation Audit

This document reviews the navigation structure of the Ticketra ETMS application, comparing the legacy EMS-first layout against the new ETMS-first configuration.

## 1. Current Nav Groups
Under the centralized navigation framework, routes are grouped into two main areas:
* **Primary ETMS Groups**:
  * **Dashboard**: Unified Command Center and Operator Dashboard.
  * **Tickets**: Submit new requests and view My/Team/All ticket lists.
  * **Assignments**: Operator queue and workload mapping.
  * **Approvals**: Pending catalog actions.
  * **Knowledge Base**: Self-service portal articles.
  * **Communications**: Timeline, discussions, and chat.
  * **Analytics**: Executive BI charts.
  * **Notifications**: Integrated alert center.
  * **Feedback**: Customer satisfaction (CSAT) metrics.
  * **Administration**: Global user and department controls.
* **Secondary Collapsed Group**:
  * **Legacy EMS**: Houses payroll, attendance, leaves, projects, updates, and legacy documents.

## 2. Duplicate Nav Items
* **Tickets List redundancy**: `tickets-legacy-list` (/app/tickets) exists alongside `tickets-all` (/app/tickets?scope=all) and `tickets-mine` (/app/tickets?scope=mine).
* **Dashboard overlap**: The standard `dashboard` (/app/dashboard) and `operator-dashboard` (/app/operator-dashboard) offer overlapping entry-point statistics.

## 3. Hidden or Broken Routes
* **Public routing conflict**: A critical redirect loop previously affected public endpoints (like `/login` and `/forgot-password`), which has been corrected by updating route resolution to bypass default authentication checks for public route paths.

## 4. EMS-First Navigation Issues
* **Old design**: Previously, EMS modules (leaves, attendance, payroll) dominated the main sidebar, which distracted from the ticketing and service desk workflows of the ETMS.
* **Solution**: Collapsing all legacy operations under a single `Legacy EMS` group (collapsed by default) aligns navigation with the ETMS transformation goal.
