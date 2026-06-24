# Module Matrix — Phase 9.2.5

This document registers and classifies all folders under `frontend/src/modules/` and maps their extraction status.

| Module | Status | Dependencies | Replacement Module | Risk / Rollback Strategy |
|---|---|---|---|---|
| `ticketing` | KEEP | Query, lucide-react | None | None (Active ETMS module) |
| `ticket-assignment` | KEEP | ticketing, shadcn ui | None | None (Active ETMS module) |
| `ticket-feedback` | KEEP | ticketing, recharts | None | None (Active ETMS module) |
| `approval-management` | KEEP | ticketing | None | None (Active ETMS module) |
| `knowledge-management` | KEEP | shadcn, tip-tap | None | None (Active ETMS module) |
| `communication-tracking`| KEEP | ticketing | None | None (Active ETMS module) |
| `executive-analytics` | KEEP | recharts | None | None (Active ETMS module) |
| `notification-center` | KEEP | socket.io-client | None | None (Active ETMS module) |
| `dashboard` | KEEP | executive-analytics | None | None (Active ETMS module) |
| `payroll` | REVIEW | employees, supabase | None | High (Maintains legacy payroll logic; to be cleaned in future phases) |
| `payroll-bulk-processing`| REVIEW | payroll, exceljs | None | Medium (Processes uploads; remains in active review status) |
| `payroll-analytics` | REVIEW | payroll, recharts | None | Low (Graph metrics for payroll) |
| `payroll-treasury` | REVIEW | payroll | None | Medium (Reconciliation processes) |
| `payroll-compliance` | REVIEW | payroll | None | Low (PF limits rule validations) |
| `payroll-finance` | REVIEW | payroll | None | Low (Journal export helpers) |
| `updates` | ARCHIVE | supabase | None | Low (Legacy Updates system; isolated to ems_backup/) |

## Isolation Risk Mitigation
The `updates` module will be completely extracted to `ems_backup/frontend/modules/updates`. Its routing mappings inside `App.tsx` and sidebar options will be commented out. To roll back, simply restore files and uncomment imports.
