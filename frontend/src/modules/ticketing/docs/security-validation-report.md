# ETMS Security Validation Report — Phase 6.5

**Date:** 2026-06-15  
**Auditor role:** Security review (ETMS module scope)

---

## Summary

No **critical** findings in ETMS module code. Several **medium/low** operational items documented for production.

**Verdict:** No critical findings blocking go-live with documented mitigations.

---

## Audit Results

### 1. IDOR (Insecure Direct Object Reference)

| Check | Result |
|-------|--------|
| Ticket access via `ticket-access.helper` + RBAC | Pass |
| Attachment/signed URL scoped to ticketId + attachmentId | Pass |
| Comment list filters internal by role | Pass (backend authoritative) |

### 2. XSS

| Check | Result |
|-------|--------|
| `dangerouslySetInnerHTML` in ETMS | **Not used** |
| Comment rendering | Plain text + character sanitization (`<>` stripped) |
| Recommendation | Consider DOMPurify if rich text added later |

### 3. Upload Abuse

| Check | Result |
|-------|--------|
| 4MB limit (client + server) | Pass |
| MIME whitelist | Pass |
| Blocked extensions | Pass |
| Storage path generation | Server-side UUID path |

### 4. Role Escalation

| Check | Result |
|-------|--------|
| UI hides assign/internal actions | Pass (cosmetic only) |
| Backend `assertPermission` on all mutations | Pass |
| Client role not stored in localStorage for ETMS | Pass |

### 5. Route Bypass

| Check | Result |
|-------|--------|
| Frontend routes gated by `VITE_ENABLE_TICKETING === 'true'` | Pass |
| Backend routes gated by `ENABLE_TICKETING === 'true'` | Pass |
| Feature flag middleware returns 503 when disabled | Pass |

### 6. Feature Flag Bypass

| Check | Result |
|-------|--------|
| Strict `=== 'true'` comparison (frontend) | Pass |
| API unreachable when backend flag off | Pass |

### 7. Signed URL Abuse

| Check | Result |
|-------|--------|
| URLs not persisted in client state | Pass |
| Generated only after access check | Pass |
| Expiry parameter supported | Pass |

---

## Medium Risks (Documented, Not ETMS-Only Fixes)

| Risk | Notes |
|------|-------|
| Notification insert via shared ChatService/RLS | EMS-wide pattern; monitor in production |
| Legacy tickets with category in description | No security impact |

---

## Recommendations

1. Run penetration test on `/api/tickets/*` in staging.
2. Enable Supabase RLS audit for `ticket_attachments` bucket.
3. Add rate limit monitoring for attachment uploads.
