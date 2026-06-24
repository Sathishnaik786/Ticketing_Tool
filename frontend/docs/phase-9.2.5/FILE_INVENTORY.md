# File Inventory — Phase 9.2.5

This document lists and classifies all major files in the repository to separate legacy EMS code from the active ETMS platform.

## Classifications:
* **KEEP**: Active ETMS modules, pages, or components.
* **ARCHIVE**: Legacy EMS artifacts to be moved to `ems_backup/`.
* **DELETE**: Unused components or dead code.
* **REVIEW**: Critical payroll/employee items kept in active repo but targeted for cleanup.

---

## 🖥️ Frontend Files

### Pages (`frontend/src/pages/`)
| File | Purpose | Classification |
|---|---|---|
| `Landing.tsx` | Public Landing Page | KEEP |
| `Login.tsx` | User Login Screen | KEEP |
| `ForgotPassword.tsx` | Password Recovery | KEEP |
| `ResetPassword.tsx` | Password Update | KEEP |
| `Dashboard.tsx` | Command Center Dashboard | KEEP |
| `Profile.tsx` | User Settings Profile | KEEP |
| `Unauthorized.tsx` | RBAC Access Restriction Page | KEEP |
| `NotFound.tsx` | 404 Page | KEEP |
| `AdminUsers.tsx` | Admin panel - User list | KEEP |
| `Workforce.tsx` | Employees / Team Directory | REVIEW |
| `Employees.tsx` | Employee Profile Manager | REVIEW |
| `Departments.tsx` | Department Organization | REVIEW |
| `Documents.tsx` | Document Management | REVIEW |
| `Reports.tsx` | HCM Legacy Reports | REVIEW |
| `Payroll.tsx` | Payroll Cycle Panel | REVIEW |
| `MyPayslips.tsx` | Self-Service Employee Payslips | REVIEW |
| `Governance.tsx` | Payroll Governance Approval | REVIEW |
| `Operations.tsx` | Payroll Cycle Operations | REVIEW |
| `Attendance.tsx` | HCM Attendance Calendar | ARCHIVE |
| `Leaves.tsx` | Leaves Booking Manager | ARCHIVE |
| `Calendar.tsx` | Legacy Calendar Scheduler | ARCHIVE |
| `Meetups.tsx` | Legacy Meetups Hub | ARCHIVE |
| `Projects.tsx` | Legacy Projects Tracker | ARCHIVE |
| `MyProjects.tsx` | User's Assigned Projects List | ARCHIVE |
| `ProjectDetail.tsx` | Legacy Project Workspace | ARCHIVE |

### Modules (`frontend/src/modules/`)
| Module Folder | Classification | Destination / Active status |
|---|---|---|
| `ticketing/` | KEEP | Active ETMS module |
| `ticket-assignment/` | KEEP | Active ETMS module |
| `ticket-feedback/` | KEEP | Active ETMS module |
| `communication-tracking/` | KEEP | Active ETMS module |
| `approval-management/` | KEEP | Active ETMS module |
| `knowledge-management/` | KEEP | Active ETMS module |
| `executive-analytics/` | KEEP | Active ETMS module |
| `notification-center/` | KEEP | Active ETMS module |
| `dashboard/` | KEEP | Active ETMS module |
| `payroll/` | REVIEW | HCM Core Module |
| `payroll-bulk-processing/` | REVIEW | HCM Bulk processing |
| `payroll-analytics/` | REVIEW | HCM Analytics |
| `payroll-treasury/` | REVIEW | HCM Treasury |
| `payroll-compliance/` | REVIEW | HCM Compliance |
| `payroll-finance/` | REVIEW | HCM Finance |
| `updates/` | ARCHIVE | To be moved to `ems_backup/` |

---

## ⚙️ Backend Files

### Routes (`backend/src/routes/`)
| Route File | Purpose | Classification |
|---|---|---|
| `auth.routes.js` | Session & User Auth | KEEP |
| `dashboard.routes.js` | Operator Stats | KEEP |
| `employee.routes.js` | Employee API | REVIEW |
| `department.routes.js` | Department API | REVIEW |
| `document.routes.js` | Document Upload API | REVIEW |
| `report.routes.js` | PDF / Excel Reports API | REVIEW |
| `health.routes.js` | Server Health API | KEEP |
| `attendance.routes.js` | Attendance Clock-in API | ARCHIVE |
| `leave.routes.js` | Leaves Request API | ARCHIVE |
| `calendar.routes.js` | Calendar Booking API | ARCHIVE |
| `meetup.routes.js` | Meetups Scheduler API | ARCHIVE |
| `project.routes.js` | Projects Workspace API | ARCHIVE |
| `chat.routes.js` | Legacy Chat API | ARCHIVE |
