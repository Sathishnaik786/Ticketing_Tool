# SQL Matrix — Phase 9.2.5

This document lists database tables found in Supabase and maps them to active or archived status. No tables are dropped in this phase to guarantee 100% rollback capability.

| Table Name | Consumer Module | Target Action | Description / Notes |
|---|---|---|---|
| `users` | Auth, Employees | KEEP | Identity mapping table; core relation |
| `employees` | Workforce, Tickets | KEEP | Employee records and profiles |
| `departments` | Workforce, Tickets | KEEP | Department structures |
| `roles` | Auth, RLS policies | KEEP | RBAC Roles dictionary |
| `user_roles` | Auth, RLS policies | KEEP | User to Role mappings |
| `tickets` | Ticketing, Queue | KEEP | Core ticket data |
| `ticket_comments` | Ticketing, Timeline | KEEP | Ticket comments log |
| `ticket_activities` | Ticketing, Timeline | KEEP | Ticket status and update history |
| `ticket_feedback` | CSAT Feedback | KEEP | CSAT ratings and customer logs |
| `ticket_assignments`| Ticket Assignment | KEEP | Ticket assignment queue history |
| `audit_logs` | Security Governance | KEEP | Immutable audit logs table |
| `attendance` | Attendance (EMS) | ARCHIVE | Legacy clock-in logs |
| `leaves` | Leaves (EMS) | ARCHIVE | Legacy time-off requests |
| `projects` | Projects (EMS) | ARCHIVE | Legacy projects and tasks |
| `meetups` | Meetups (EMS) | ARCHIVE | Legacy meeting links |
| `updates` | Updates (EMS) | ARCHIVE | Legacy daily standup logs |
| `meetup_audit_logs` | Meetups (EMS) | ARCHIVE | Meeting approvals history log |

## Database Retention Statement
To ensure absolute rollback capabilities, **no tables are dropped or modified** during this cleanup phase. Legacy tables remain in the database for runtime compatibility and historical auditing purposes.
