# Phase 7.6 — RBAC Matrix

Uses existing ETMS roles only (no RBAC changes).

| Action | EMPLOYEE | MANAGER | HR | ADMIN | SUPER_ADMIN |
|--------|----------|---------|-----|-------|-------------|
| View published articles | ✓ | ✓ | ✓ | ✓ | ✓ |
| Search articles | ✓ | ✓ | ✓ | ✓ | ✓ |
| Rate articles | ✓ | ✓ | ✓ | ✓ | ✓ |
| Submit feedback | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create articles (draft) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Edit own drafts/reviews | ✓ | ✓ | ✓ | ✓ | ✓ |
| Edit any article | — | ✓ | — | ✓ | ✓ |
| Publish / Archive | — | ✓ | — | ✓ | ✓ |
| View analytics | — | ✓ | ✓ | ✓ | ✓ |

## Notes

- Support Agent maps to EMPLOYEE role with article creation privileges
- Employees cannot view non-published articles unless author/admin/manager
- Category management via admin article CRUD (no separate category API mutations in v1)
