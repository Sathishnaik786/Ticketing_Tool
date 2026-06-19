# Phase 7.5 — UAT Checklist

## Prerequisites
- [ ] Run `approval_engine_phase7_5.sql` on staging Supabase
- [ ] Set `ENABLE_APPROVAL_ENGINE=true` (backend)
- [ ] Set `VITE_ENABLE_APPROVAL_ENGINE=true` (frontend)
- [ ] Redeploy Render + Netlify

## Service Catalog
- [ ] Approval Dashboard shows IT, HR, Finance, Procurement, Facility, Administration catalogs
- [ ] Catalog items display (Laptop Request, Purchase Request, etc.)
- [ ] GET `/api/approvals/catalog` returns seeded data

## Workflow Administration (Admin)
- [ ] Admin can create multi-step workflow via API
- [ ] Admin can update workflow steps
- [ ] Non-admin receives 403 on workflow create

## Ticket Approval Lifecycle
- [ ] Employee can start approval on ticket (`POST /ticket/:id/start`)
- [ ] Duplicate start returns 409
- [ ] Manager approves step 1 → advances to step 2
- [ ] Finance approves final step → status APPROVED
- [ ] Reject at any step → status REJECTED
- [ ] Approval Workflow tab visible on ticket detail
- [ ] Audit trail shows SUBMITTED, APPROVED/REJECTED entries

## Queues
- [ ] `/my-approvals` shows employee submissions
- [ ] `/pending` shows only steps user can act on
- [ ] Pending Approvals widget on dashboard

## Analytics
- [ ] Manager/Admin can view Approval Analytics page
- [ ] Employee cannot access analytics (403)
- [ ] Status counts match database

## RBAC
- [ ] HR can approve HR steps only
- [ ] Finance can approve Finance steps only
- [ ] Employee cannot approve manager steps

## Feature Flag Off
- [ ] Set flags to `false`, redeploy
- [ ] No approval nav/routes
- [ ] No Approval Workflow tab
- [ ] APIs return 503 or unmounted

## Regression
- [ ] Login / auth works
- [ ] Ticket create/list/detail unchanged
- [ ] Feedback, Assignment, SLA, Communication tabs unchanged
- [ ] Dashboards unchanged
