# Phase 7.5 — RBAC Matrix

## Roles

| Action | EMPLOYEE | MANAGER | HR | FINANCE | ADMIN | SUPER_ADMIN |
|--------|----------|---------|-----|---------|-------|-------------|
| View service catalog | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Submit / start approval on ticket | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Track own submissions (`/my-approvals`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Approve MANAGER steps | — | ✓ | — | — | ✓ | ✓ |
| Approve HR steps | — | — | ✓ | — | ✓ | ✓ |
| Approve FINANCE steps | — | — | — | ✓ | ✓ | ✓ |
| View pending queue (role-filtered) | — | ✓* | ✓* | ✓* | ✓ | ✓ |
| View approval analytics | — | ✓ | ✓ | — | ✓ | ✓ |
| Create / update workflows | — | — | — | — | ✓ | ✓ |

\* Only when current step matches role or specific `approver_employee_id`.

## Step-Level Authorization

`canApproveStep(user, step)` grants access when:
1. User role is ADMIN or SUPER_ADMIN, OR
2. `step.approver_employee_id === user.employeeId`, OR
3. `step.approver_role === user.role`

## Workflow Admin

Only `ADMIN` and `SUPER_ADMIN` may create or update workflows via `POST/PUT /workflow`.

## Employee Profile Requirement

Starting approvals, approving, rejecting, and viewing own submissions require `user.employeeId`.

## Feature Flag

When `ENABLE_APPROVAL_ENGINE !== 'true'`, all endpoints return **503** — no RBAC evaluation occurs.
