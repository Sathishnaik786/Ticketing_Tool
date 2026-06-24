# Dead Code Report — Phase 9.2.5

This document lists orphaned files, unused components, and deprecated layout elements discovered during the read-only repository audit.

## Orphaned Layouts & Widgets

| Component Path | Status | Action | Notes |
|---|---|---|---|
| `components/common/FloatingOperationsPanel.tsx`| Unused | SAFE DELETE | Deprecated mesh dashboard panel; zero imports. |
| `pages/MyPayslips.tsx` | Unused | ARCHIVE | Duplicate payslip page. Consolidation uses `modules/payroll/pages/EmployeePayslips.tsx` instead. |
| `components/dashboard/UpdatesQuickAccess.tsx` | Obsolete | ARCHIVE | Links to deprecated daily updates pages. |
| `components/dashboard/AnalyticsOverview.tsx` | Obsolete | ARCHIVE | Old analytics widgets. |

## Obsolete Files in active tree (to be archived)
All files belonging to the following legacy HCM pages:
- `pages/Attendance.tsx`
- `pages/Leaves.tsx`
- `pages/Calendar.tsx`
- `pages/Meetups.tsx`
- `pages/Projects.tsx`
- `pages/MyProjects.tsx`
- `pages/ProjectDetail.tsx`

## Dependencies Marked for Safe Deletion
- `@fullcalendar/daygrid`
- `@fullcalendar/interaction`
- `@fullcalendar/react`
- `@fullcalendar/timegrid`

## Rollback / Cleanup Phase Gate
No deletions will be executed in this step. All of the above artifacts are safely moved to the `ems_backup/` directory or marked for future removal to preserve a 100% rollback pathway.
