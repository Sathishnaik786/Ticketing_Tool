# Component Matrix — Phase 9.2.5

This document inventories generic and layout components in `components/` and checks their dependencies.

| Component Path | Imports Count | Target Status | Classification | Purpose / Status Notes |
|---|---|---|---|---|
| `components/NavLink.tsx` | 8 | Active | KEEP | Navigation link utility |
| `components/ProtectedRoute.tsx` | 3 | Active | KEEP | RBAC Route security wrapper |
| `components/layout/AppLayout.tsx` | 2 | Active | KEEP | Core ETMS shell layout component |
| `components/layout/Sidebar.tsx` | 2 | Active | KEEP | Registry-driven sidebar |
| `components/layout/Header.tsx` | 2 | Active | KEEP | Header with notifications and settings |
| `components/common/AppBootstrap.tsx` | 1 | Active | KEEP | App loading and telemetry init |
| `components/common/RouteErrorBoundary.tsx` | 1 | Active | KEEP | Global route crash safety boundary |
| `components/common/Skeletons.tsx` | 20 | Active | KEEP | Loading skeletons for data queries |
| `components/routing/LazyPage.tsx` | 5 | Active | KEEP | Dynamic code splitting router helper |
| `components/common/FloatingOperationsPanel.tsx`| 0 | Orphaned | DELETE | Legacy mesh control panel; redundant |
| `components/dashboard/UpdatesQuickAccess.tsx` | 0 | Obsolete | ARCHIVE | Legacy updates links; moved to ems_backup |
| `components/dashboard/AnalyticsOverview.tsx` | 1 | Legacy | ARCHIVE | Legacy HCM dashboard charts |
| `components/dashboard/StatCard.tsx` | 5 | Active | KEEP | General stats cards widget |
| `components/dashboard/AnalyticsStatCard.tsx` | 3 | Active | KEEP | Reusable metric visualizer |

## Purification Decisions
- **FloatingOperationsPanel.tsx**: Fully deprecated. Removed from imports during Phase 8.4; safe to delete permanently.
- **UpdatesQuickAccess.tsx**: Extract to `ems_backup/frontend/components/dashboard/` since the Updates module is archived.
