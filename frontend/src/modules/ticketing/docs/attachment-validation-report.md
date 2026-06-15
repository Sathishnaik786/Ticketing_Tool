# ETMS Attachment Validation Report — Phase 6.5

**Date:** 2026-06-15

---

## Pipeline

```
TicketAttachmentUpload (react-dropzone, 4MB client check)
  → POST /api/tickets/:id/attachments (multipart, field: file)
  → upload.middleware.js (multer, MIME whitelist, 4MB)
  → AttachmentService.createAttachment
  → Supabase Storage bucket: ticket-attachments
  → ticket_attachments metadata row
  → GET .../attachments/:id/url → signed URL
  → Browser download (no direct URL exposure in UI state)
```

---

## Validated Controls

| Control | Layer | Status |
|---------|-------|--------|
| Max 4MB | Frontend dropzone + backend multer + service | Pass |
| MIME whitelist | Backend ALLOWED_ATTACHMENT_MIME_TYPES | Pass |
| Blocked extensions | isBlockedAttachment (.exe, .bat, etc.) | Pass |
| Auth + ticket access | assertCanView before upload/download | Pass |
| Signed URL expiry | expiresIn query param (default 3600s) | Pass |
| Upload failure | AppError + Sonner toast | Pass |
| No raw URL storage in frontend | URL fetched on download click only | Pass |

---

## Supported File Types

| Type | MIME | Client Accept | Server Accept |
|------|------|---------------|---------------|
| PDF | application/pdf | Yes | Yes |
| DOC | application/msword | Yes | Yes |
| DOCX | application/vnd.openxmlformats-officedocument.wordprocessingml.document | Yes | Yes |
| XLS | application/vnd.ms-excel | Yes | Yes |
| XLSX | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet | Yes | Yes |
| PNG | image/png | Yes | Yes |
| JPG/JPEG | image/jpeg | Yes | Yes |
| ZIP | application/zip | Yes | Yes |

---

## Operational Prerequisites

1. Supabase bucket `ticket-attachments` must exist with appropriate RLS policies.
2. `ENABLE_TICKETING=true` on backend.
3. Storage credentials configured in backend Supabase admin client.

---

## Expired / Unauthorized Download

- Expired signed URLs: Supabase returns error → service throws AppError → toast displayed.
- Unauthorized user: ticket access check fails before URL generation (403).

---

## Success Criteria

- [x] Size and MIME enforced at all layers
- [x] Supported types documented and aligned
- [x] Download uses ephemeral signed URLs
- [ ] Live storage integration test requires UAT environment with bucket provisioned
