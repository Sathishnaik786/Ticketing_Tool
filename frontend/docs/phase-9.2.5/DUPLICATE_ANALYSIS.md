# Duplicate Analysis — Phase 9.2.5

This document analyzes and details the duplication check conducted across routes, pages, modules, services, and components in the repository, outlining the consolidation decisions.

## 1. Route Duplications & Consolidation

### Duplicated Routes Identified
* **Route**: `/app/payroll/my-payslips` vs `/app/my-payslips`
  * **Status**: Consolidated.
  * **Active Component**: `modules/payroll/pages/EmployeePayslips.tsx` (retained inside the `payroll` module, configured in the dynamic module router).
  * **Legacy Component**: `pages/MyPayslips.tsx` (redundant, marked for ARCHIVE).
  * **Resolution**: The routing configurations inside `App.tsx` now point to the single unified `/app/payroll/my-payslips` route mapped in `payrollRoutes`.

### Target Verification
* **Target Duplicate Routes**: 0
* **Target Orphan Routes**: 0 (all routes now map cleanly to existing, registered pages).

---

## 2. Page & Component Duplications

### Duplicate Pages
| Legacy/Duplicate Page | Active Replacements | Action |
|---|---|---|
| `pages/MyPayslips.tsx` | `modules/payroll/pages/EmployeePayslips.tsx` | Moved to `ems_backup/frontend/pages/` |
| `pages/Attendance.tsx` | `modules/ticketing/` (replaces HCM Attendance check-ins) | Moved to `ems_backup/frontend/pages/` |

### Duplicate / Legacy Components
| Component Path | Usage | Replacement / Target | Action |
|---|---|---|---|
| `components/common/FloatingOperationsPanel.tsx` | Unused | None (Fully Deprecated) | Replaced in Phase 8.4; marked for final UAT removal |
| `components/dashboard/UpdatesQuickAccess.tsx` | Obsolete links | None | Moved to `ems_backup/frontend/components/` |
| `components/dashboard/AnalyticsOverview.tsx` | Legacy HCM metrics | `modules/executive-analytics/` dashboards | Moved to `ems_backup/frontend/components/` |
| `components/common/MeetupCard.tsx` | Legacy Meetups widget | None | Moved to `ems_backup/frontend/components/` |
| `components/common/ProjectCard.tsx` | Legacy Projects widget | None | Moved to `ems_backup/frontend/components/` |
| `components/common/ProjectStatusBadge.tsx` | Legacy Projects status indicator | None | Moved to `ems_backup/frontend/components/` |

---

## 3. Services Duplications

No duplication of services exists. Legacy API connectors for attendance, calendar, projects, and meetups inside `services/api.ts` have been cataloged. To maintain backward compatibility while separating code:
* The active `services/api.ts` retains generic base features but has deprecated functions isolated.
* Legacy-specific `services/chatService.ts` is moved entirely to `ems_backup/frontend/services/`.

---

## 4. Backend Routing & Controller Isolation

The backend contains legacy EMS routes and controllers that duplicate responsibilities or serve deprecated modules.
* **Legacy routes**: `attendance.routes.js`, `leave.routes.js`, `calendar.routes.js`, `meetup.routes.js`, `project.routes.js`, `chat.routes.js`
* **Legacy controllers/services**: `attendance.controller.js`, `calendar.controller.js`, `chat.controller.js`, `chat.service.js`, `leave.controller.js`, `meetup.controller.js`, `meetup.service.js`, `project.controller.js`, `project.service.js`.

These routes are moved to `ems_backup/backend/routes/` and `ems_backup/backend/controllers/` respectively.
Their routes are unmounted from the versioned base router (`backend/src/routes/v1/index.js`) to keep the primary route namespace pure.

---

## 5. Rollback and UAT Verification
To roll back any consolidation, copy the files back from `ems_backup/` and restore their imports/routes declarations.
