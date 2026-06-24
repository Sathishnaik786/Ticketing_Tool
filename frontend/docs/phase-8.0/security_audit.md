# Phase 8.0.7 — Security Audit (OWASP-Oriented)

**Date:** 2026-06-19  
**Mode:** Audit only — references `docs/auth-rbac/`, `docs/deployment-remediation/`

---

## Severity Legend

| Level | Definition |
|-------|------------|
| **Critical** | Exploitable now; data breach or total compromise |
| **High** | Significant risk; needs prompt remediation |
| **Medium** | Defense-in-depth gap |
| **Low** | Hardening opportunity |

---

## A01 — Broken Access Control

| Finding | Severity | Details |
|---------|----------|---------|
| Backend service role bypasses Supabase RLS | **Critical** | All authorization must be enforced in application layer |
| RBAC fragmentation (`user_roles` vs `employees.role`) | **Critical** | Documented in auth-rbac audits; role-resolution mitigates partially |
| `departmentId` not on `req.user` | **Medium** | Manager scoping in 7.7/7.8 relies on optional field |
| Payroll routes always mounted (no flag) | **High** | Large admin attack surface even if UI unused |
| Debug endpoints `/redis-test`, `/cache-stats` | **Medium** | SUPER_ADMIN gated but should be env-disabled in prod |

---

## A02 — Cryptographic Failures

| Finding | Severity | Details |
|---------|----------|---------|
| Auth tokens in `localStorage` | **Critical** | XSS can steal session tokens |
| `JWT_SECRET` bootstrap legacy | **Medium** | Supabase Auth is primary; verify JWT usage |
| Password returned in create-user API | **Critical** | Per deployment-remediation docs |
| HTTPS enforced (Netlify/Render) | ✓ Low risk | TLS at edge |

---

## A03 — Injection

| Finding | Severity | Details |
|---------|----------|---------|
| Supabase parameterized queries | ✓ Good | ORM-style client |
| Search filters (7.7, 7.8) | **Medium** | ILIKE string interpolation — verify sanitization |
| Excel bulk upload parsing | **Medium** | Payroll bulk — formula injection risk in spreadsheets |
| Zod validation on 7.x modules | ✓ Good | ETMS modules validated |

---

## A04 — Insecure Design

| Finding | Severity | Details |
|---------|----------|---------|
| No feature flags on EMS modules | **High** | Cannot disable EMS attack surface independently |
| Dual notification systems | **Low** | 7.8 parallel to legacy — by design |
| No API versioning | **Medium** | Breaking changes affect all consumers |
| Single-org schema (no tenant isolation) | **Low** | Acceptable for Aparna single-tenant |

---

## A05 — Security Misconfiguration

| Finding | Severity | Details |
|---------|----------|---------|
| Open public RLS policies (legacy `schema.sql`) | **Critical** | If applied to production Supabase |
| Phase 7.4 tables missing RLS migration | **Critical** | Direct client access risk |
| CORS includes legacy `yviems.netlify.app` | **Low** | Unnecessary origin |
| Verbose auth logging in production | **Medium** | Gate behind NODE_ENV |
| `ENABLE_DEBUG_ROUTES` | **Medium** | Must be false in prod |
| Helmet + rate limiting | ✓ Good | Configured in app.js |
| Netlify security headers | ✓ Good | In netlify.toml |

---

## A06 — Vulnerable Components

| Finding | Severity | Details |
|---------|----------|---------|
| Dependency audit not in CI | **High** | No automated `npm audit` pipeline |
| Node 20 pinned (.nvmrc) | ✓ Good | |
| Large frontend bundle (2.7MB) | **Low** | Supply chain exposure surface |

---

## A07 — Authentication Failures

| Finding | Severity | Details |
|---------|----------|---------|
| Supabase Auth primary | ✓ Good | |
| Auth rate limit (10/15min) | ✓ Good | |
| Session refresh flow | ✓ Good | Tested in auth-rbac-hardening |
| createUser missing `user_roles` insert | **Critical** | New users default EMPLOYEE |

---

## A08 — Software/Data Integrity

| Finding | Severity | Details |
|---------|----------|---------|
| No CI/CD pipeline | **Critical** | No automated test gate before deploy |
| No signed commits requirement | **Low** | |
| Pre-commit hooks | **Unknown** | Not verified in repo |

---

## A09 — Logging & Monitoring

| Finding | Severity | Details |
|---------|----------|---------|
| Structured logger (backend) | ✓ Good | |
| No Sentry/error aggregation | **Critical** | Per deployment-remediation |
| No audit log for ETMS ticket actions | **Medium** | Timeline exists; centralized audit incomplete |
| Morgan dev logging | **Low** | Dev only |

---

## A10 — SSRF / Uploads

| Finding | Severity | Details |
|---------|----------|---------|
| Ticket attachments upload | **Medium** | Verify file type/size limits |
| Payroll bulk Excel upload | **High** | Large file processing |
| Supabase storage policies | **Medium** | Profile image policies exist |

---

## Secrets & Environment

| Finding | Severity | Details |
|---------|----------|---------|
| `.env.example` placeholders | ✓ Good | |
| `SUPABASE_SERVICE_ROLE_KEY` on backend | **Critical** | Required but must never reach frontend |
| Secrets in render.yaml | ✓ Good | `sync: false` for secrets |
| Root scratch scripts | **Medium** | May contain hardcoded test credentials — review before removal |

---

## ETMS Module Security (7.1–7.8)

| Module | Auth | RBAC | Validation | Flag Gate |
|--------|------|------|------------|-----------|
| Ticketing | ✓ | ✓ | ✓ | ✓ |
| Feedback | ✓ | ✓ | ✓ | ✓ |
| Assignment | ✓ | ✓ | ✓ | ✓ |
| Communications | ✓ | ✓ | ✓ | ✓ |
| Approvals | ✓ | ✓ | ✓ | ✓ |
| Knowledge | ✓ | ✓ | ✓ | ✓ |
| Executive Analytics | ✓ | ✓ | ✓ | ✓ |
| Notification Center | ✓ | ✓ | ✓ | ✓ |

**ETMS modules follow consistent security patterns.** Legacy EMS modules less uniform.

---

## Security Score Summary

| Severity | Count |
|----------|-------|
| Critical | 8 |
| High | 6 |
| Medium | 12 |
| Low | 6 |

**No security fixes applied in Phase 8.0.**
