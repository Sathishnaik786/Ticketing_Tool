# Route Coverage Report

## Coverage Matrix

| Route | Registered | Nav Entry | RBAC Nav | RouteGuard (Post-Fix) |
|-------|------------|-----------|----------|----------------------|
| /app/dashboard | ✅ | ✅ | All roles | — |
| /app/operator-dashboard | ✅ | ✅ | All roles | ✅ |
| /app/sla-dashboard | ✅ | ✅ | HR/Admin/Manager | ✅ |
| /app/tickets | ✅ | ✅ | Scoped | Scope utils |
| /app/admin/users | ✅ | ✅ | Admin | ✅ |
| /app/executive-dashboard | ✅ | ✅ | HR/Admin | ✅ |
| /app/department-analytics | ✅ | ✅ | Manager+ | ✅ |
| /app/business-unit-analytics | ✅ | ✅ | HR/Admin | ✅ |
| /app/analytics-reports | ✅ | ✅ | Manager+ | ✅ |
| /app/approvals | ✅ | ✅ | Flag | — |
| /app/approval-analytics | ✅ | ✅ | Flag | — |
| /app/knowledge-base | ✅ | ✅ | Flag | — |
| /app/kb-analytics | ✅ | ✅ | Manager+ | ✅ |
| /app/article-editor | ✅ | ✅ | Manager+ | ✅ |
| /app/notifications | ✅ | ✅ | Flag | — |
| /app/notification-analytics | ✅ | ✅ | Manager+ | ✅ |
| /app/payroll/** | ✅ | ✅ | Role-scoped | ✅ (per-path) |
| /app/payroll/governance/approvals | ✅ | ✅ (fixed href) | Admin/HR/Manager | ✅ |

## Orphan / Broken (Pre-Fix → Post-Fix)

- **Fixed:** `legacy-payroll-approvals` href → `/app/payroll/governance/approvals`
- **Known duplicate:** `payroll/my-payslips` in App.tsx and payroll.routes (intentional BC)

## GlobalSearch / CommandPalette

- Post-fix: all destinations from `buildSearchRegistry()` / `buildCommandRegistry()`
- `filterByNavMode()` prevents duplicate legacy/ETMS entries
