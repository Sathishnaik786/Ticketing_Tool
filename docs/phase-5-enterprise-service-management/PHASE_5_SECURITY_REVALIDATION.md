# PHASE 5 SECURITY REVALIDATION
# Enterprise Security Gate Validation & Threat Modeling

This document details the security revalidation checks, threats model, and defensive safeguards required for Phase 5.

---

## 1. Security Verification Checklist

| Security Requirement | Status | Verification Criteria |
|---|---|---|
| **Supabase RLS** | **VERIFIED** | All newly created ESM schemas use active row-level policy definitions. Direct database queries bypass is locked for non-admins. |
| **RBAC Integration** | **VERIFIED** | Middleware check functions (`requireRole`) restrict administrative setup routes to `ADMIN` or `MANAGER` profiles. |
| **SSRF Webhook Guard** | **VERIFIED** | Webhook automation workers resolve targets using DNS verification to block access to private/internal subnets. |
| **Webhook Hash Signatures**| **VERIFIED** | Outbound/inbound payloads are signed using SHA256 HMAC tokens with a 5-minute timeout window. |
| **Approval Forgery block**| **VERIFIED** | Approval controller asserts the active caller's JWT ID matches the assigned actor ID before writing results. |
| **Workflow Loop Breaker** | **VERIFIED** | DAG compilers check workflows before publish. Run logs trace depth levels and drop jobs exceeding 10 steps. |
| **Audit Logs Immutability**| **VERIFIED** | Database triggers block updates and deletions on the `system_audit_logs` table. |
| **Redis Network Security** | **VERIFIED** | Redis is bound to localhost loops and VPC subnets, using strong AUTH security passwords. |
| **BullMQ Payload Safety** | **VERIFIED** | Queue parameters enforce max sizes and sanitize payloads to prevent serialization injections. |

---

## 2. Dynamic Threat Models & Protections

### 1. Webhook SSRF Attack Vector
* **Attack Scenario:** A malicious administrator creates an automation rule: `WHEN Ticket Created THEN POST webhook TO http://169.254.169.254/latest/meta-data/`.
* **Guard Pattern:**
```javascript
const dns = require('dns').promises;
const ipaddr = require('ipaddr.js');

async function validateWebhookUrl(targetUrl) {
  const url = new URL(targetUrl);
  const addresses = await dns.resolve(url.hostname);
  
  for (const addr of addresses) {
    const ip = ipaddr.parse(addr);
    if (ip.range() !== 'unicast') {
      throw new Error('SSRF Blocked: URL target points to a non-unicast range.');
    }
  }
}
```

### 2. Approval Forgery Prevention
* **Attack Scenario:** User A captures a POST payload for an approval assignment step (`/api/v1/approvals/action`) and updates the `assignment_id` to User B's pending assignment ID.
* **Guard Pattern:**
```javascript
const assignment = await db.query(
  'SELECT * FROM approval_assignments WHERE id = $1', [assignmentId]
);

if (assignment.assigned_user_id !== req.user.id && !req.user.roles.includes(assignment.assigned_role)) {
  return res.status(403).json({ error: 'Forgery Blocked: Approver profile mismatch.' });
}
```

### 3. Workflow Depth Loop Protection
* **Attack Scenario:** An admin configures a loop: Step A (Notification) transitions to Step B, which transitions back to Step A.
* **Guard Pattern:**
```javascript
async function advanceWorkflow(ticketId, stepId, depth = 0) {
  if (depth > 10) {
    await db.query(
      'UPDATE ticket_workflow_state SET state_status = $1 WHERE ticket_id = $2',
      ['SUSPENDED', ticketId]
    );
    throw new Error('Workflow execution suspended: Loop threshold exceeded.');
  }
  // Proceed with advancement...
}
```

---

## 3. Database Audit Immutability Trigger (SQL)

```sql
CREATE OR REPLACE FUNCTION make_audit_logs_immutable()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Immutable Block: System audit logs cannot be updated or deleted.';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_immutable_audit
BEFORE UPDATE OR DELETE ON system_audit_logs
FOR EACH ROW
EXECUTE FUNCTION make_audit_logs_immutable();
```
