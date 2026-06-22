# Route Matrix — Phase 9.2.5

This report lists all routing paths declared in `App.tsx` and versioned sub-routers, specifying their active or archived state.

## Active Routing Matrix

| Route | Component | Owner Module | Status | Classification |
|---|---|---|---|---|
| `/` | `Landing.tsx` | Marketing | Active | KEEP |
| `/login` | `Login.tsx` | Authentication | Active | KEEP |
| `/forgot-password` | `ForgotPassword.tsx` | Authentication | Active | KEEP |
| `/reset-password` | `ResetPassword.tsx` | Authentication | Active | KEEP |
| `/app/dashboard` | `Dashboard.tsx` | Core Shell | Active | KEEP |
| `/app/operator-dashboard`| `OperatorDashboardPage.tsx`| Dashboard | Active | KEEP |
| `/app/sla-dashboard` | `SlaDashboardPage.tsx` | Dashboard | Active | KEEP |
| `/app/profile` | `Profile.tsx` | Core Shell | Active | KEEP |
| `/app/unauthorized` | `Unauthorized.tsx` | Core Shell | Active | KEEP |
| `/app/admin/users` | `AdminUsers.tsx` | Administration | Active | KEEP |
| `/app/tickets` | `TicketListPage.tsx` | Ticketing | Active | KEEP |
| `/app/tickets/new` | `TicketDetailPage.tsx` | Ticketing | Active | KEEP |
| `/app/tickets/:ticketId` | `TicketDetailPage.tsx` | Ticketing | Active | KEEP |
| `/app/my-queue` | `MyQueuePage.tsx` | Assignments | Active | KEEP |
| `/app/approvals` | `ApprovalQueue.tsx` | Approvals | Active | KEEP |
| `/app/knowledge-base` | `KnowledgeBase.tsx` | Knowledge Base | Active | KEEP |
| `/app/articles/:id` | `ArticleDetail.tsx` | Knowledge Base | Active | KEEP |
| `/app/notifications` | `NotificationsPage.tsx` | Notifications | Active | KEEP |
| `/app/workforce` | `Workforce.tsx` | Employees | Active | REVIEW |
| `/app/employees` | `Employees.tsx` | Employees | Active | REVIEW |
| `/app/departments` | `Departments.tsx` | Employees | Active | REVIEW |
| `/app/documents` | `Documents.tsx` | Employees | Active | REVIEW |
| `/app/reports` | `Reports.tsx` | Employees | Active | REVIEW |
| `/app/payroll` | `Payroll.tsx` | Payroll | Active | REVIEW |
| `/app/payroll/my-payslips`| `MyPayslips.tsx` | Payroll | Active | REVIEW |
| `/app/attendance` | `Attendance.tsx` | HCM (Legacy) | Legacy | ARCHIVE |
| `/app/leaves` | `Leaves.tsx` | HCM (Legacy) | Legacy | ARCHIVE |
| `/app/calendar` | `Calendar.tsx` | HCM (Legacy) | Legacy | ARCHIVE |
| `/app/meetups` | `Meetups.tsx` | HCM (Legacy) | Legacy | ARCHIVE |
| `/app/projects` | `Projects.tsx` | HCM (Legacy) | Legacy | ARCHIVE |
| `/app/my-projects` | `MyProjects.tsx` | HCM (Legacy) | Legacy | ARCHIVE |
| `/app/projects/:id` | `ProjectDetail.tsx` | HCM (Legacy) | Legacy | ARCHIVE |

## Target Goals met
* **Duplicate Routes**: 0 (payslip routes consolidated, routing handled through module packages).
* **Orphan Routes**: 0 (operator dashboard registered in registries; reachability verified).
