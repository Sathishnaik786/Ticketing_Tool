# PHASE 5 DISCOVERY REPORT
# Enterprise Service Management Platform — Discovery Audit

---

## 1. Existing Assets

### Backend (Express.js)
* **Application Boot & Entry:** `app.js` and `server.js` orchestrate Express routing, middleware pipelines (body parsing, CORS, logging), and database connections.
* **Core API Modules:** Fully functional APIs exist for approvals (`approval-management`), notifications (`notification-center`), ticketing (`ticketing`), feedback (`ticket-feedback`), updates (`updates`), and payroll analytics (`payroll-analytics`).
* **Websocket Integration:** `socketHandlers.js` handles real-time updates for notifications, chats, and ticketing updates.
* **Role-Based Access Control:** Pre-configured RBAC rules checked using middleware (`rbac_schema.sql`).

### Frontend (React 18 + TS)
* **App Routing & Shell:** React Router v6 setup in `App.tsx` with code-splitting (`lazyPage`), lazy route grouping, and protected layouts.
* **Feature Flag Schema:** Configuration files (`src/config/features.ts`) toggle state for ETMS dashboards, Executive Analytics, and ticketing modules.
* **Design Token Integration:** Custom layouts implemented with standard styling in `index.css` and a central tailwind utility design system.

### Database (PostgreSQL / Supabase)
* **Pre-existing Tables:** Core operational tables for ticketing (`tickets`, `ticket_comments`), HR/EMS (`employees`, `departments`, `attendance`), approvals (`approvals`), and notifications (`notifications`).
* **RLS & Security Policies:** Suppressed public write/read permissions, managed via Supabase RLS and policy configurations (`enable_ticketing_rls.sql`).
* **Custom Functions & Views:** Helper databases views (e.g., `create_department_details_view`) and automatic trigger procedures.

---

## 2. Reusable Components & Primitives

### Component Primitives (`src/components/ui/`)
* **`EnterpriseCard` & `GlassCard`:** Sleek card containers matching the layout aesthetic (dark-mode semantic styling, soft borders).
* **`PremiumButton`:** Custom interactive action button with micro-animations and loading triggers.
* **`rich-text-editor` & `rich-text-display`:** Tiptap-based rich text integrations, ideal for service catalog item descriptions and workflow description fields.
* **Standard Primitives:** `dialog.tsx`, `sheet.tsx`, `scroll-area.tsx`, `switch.tsx`, `select.tsx`, and `table.tsx` for lists and builder modals.

### Common Utilities (`src/components/common/`)
* **`ComponentErrorBoundary`:** Captures layout/rendering crashes in nested sections (e.g., individual charts, widgets).
* **`EmptyState` & `StatusBadge`:** Generic styling helpers used for lists, categories, and badges.

---

## 3. Missing Components (To Be Built)

### Phase 5.0 (Foundation)
* **`WorkflowCanvas`:** A node-based interactive builder (or list-based rule sequencer) allowing administrators to drag, drop, and connect workflow steps (approvals, notifications, task generation).
* **`SlaTimerWidget`:** Real-time countdown timer showing resolution/response metrics on ticket detail panels.

### Phase 5.1 (Catalog & Automation)
* **`ServiceCatalogBuilder`:** Form designer to create inputs (text, dropdowns, files) for a catalog item.
* **`CatalogRequestForm`:** Dynamic form generator displaying input fields defined on the catalog item.
* **`AutomationRuleBuilder`:** Visual trigger-condition-action builder panel.

### Phase 5.2 (Executive Analytics)
* **KPI Widgets Grid:** Visual telemetry displaying MTTR (Mean Time to Resolution), first-response SLA success, and capacity load.
* **Telemetry Charts:** Recharts components optimized for historical trends, service health status, and agent workload distribution.
* **Report Exporter:** Modal dialog to trigger PDF/CSV exports for reports with date ranges and categories.

---

## 4. Technical Debt & Refactoring Opportunities

* **Profile & Employee Mapping:** Supplying profile imagery or info relies on mapping user credentials to the employees table. A cleaner, direct cache or join view would simplify references.
* **Inconsistent Input Validation:** Validation rules are spread across controller definitions. Standardizing with `zod` schemas or middleware would prevent payload injection.
* **Card and Panel Wrappers:** Consolidation is needed for the multiple customized panel layouts across older features, ensuring uniform theme and spacing behavior.
* **Redis Execution Path:** Pre-verifying Redis availability before scheduling BullMQ jobs, with clean fallbacks if Redis fails or runs in a limited sandbox environment.

---

## 5. Risk Areas & Mitigations

* **Supabase Client Leakage:** Suppress global supabase keys in public frontends. Ensure Supabase calls execute via Supabase client wrappers utilizing JWT-based authenticated credentials.
* **Workflow Loop Escalation:** Infinite loops in workflows (e.g., step A triggers B, which triggers A) could consume database performance. *Mitigation:* Implement a max-depth execution parameter (limit to 10 sequential steps).
* **Breach Evaluation Load:** Running cron checks for breaches on every single ticket could degrade DB performance under scale. *Mitigation:* Limit query evaluation to active, unresolved tickets with active SLA timers.
* **RLS Complexity:** Designing workflows that cross department lines requires careful handling of RLS. Ensure service workers bypass RLS (using Supabase service keys) strictly within secure backend transaction blocks.
