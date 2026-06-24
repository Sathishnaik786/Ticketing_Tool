# Phase 7.5 — API Reference

Base path: `/api/approvals`  
Requires: `Authorization: Bearer <token>`  
Feature flag: `ENABLE_APPROVAL_ENGINE=true` (503 when off)

## Service Catalog

### GET /catalog

Returns active service catalogs with nested items.

**Response**
```json
{ "success": true, "data": [{ "id": "...", "name": "IT Services", "category": "IT", "items": [] }] }
```

## Workflow Management (Admin)

### POST /workflow

Create approval workflow with steps.

**Body**
```json
{
  "name": "Purchase Request",
  "approval_type": "MULTI",
  "steps": [
    { "step_order": 1, "step_name": "Manager Approval", "approver_role": "MANAGER" },
    { "step_order": 2, "step_name": "Finance Approval", "approver_role": "FINANCE" }
  ]
}
```

### PUT /workflow/:id

Update workflow (partial). Replace steps when `steps` array provided.

### GET /workflow/:id

Returns `{ workflow, steps }`.

## Ticket Approval Lifecycle

### POST /ticket/:ticketId/start

Start approval on ticket.

**Body:** `{ "workflow_id": "<uuid>", "comments": "optional" }`

### POST /ticket/:ticketId/approve

Approve current step. Advances to next step or completes workflow.

**Body:** `{ "comments": "optional" }`

### POST /ticket/:ticketId/reject

Reject at current step. Sets status `REJECTED`.

### GET /ticket/:ticketId/state

Returns active approval, workflow steps, history, and `can_act` for current user.

## Queues & Analytics

### GET /my-approvals

Approvals started by current employee.

### GET /pending

Pending approvals where current user can act on current step.

### GET /analytics

Status counts and pending total. Requires MANAGER, HR, ADMIN, or SUPER_ADMIN.

## Status Codes

| Code | Meaning |
|------|---------|
| 201 | Workflow/approval created |
| 400 | Validation error |
| 403 | RBAC denied |
| 404 | Ticket/approval not found |
| 409 | Active approval already exists |
| 503 | Module disabled |
