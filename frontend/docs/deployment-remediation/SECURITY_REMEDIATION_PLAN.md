# Security Remediation Plan

**Project:** Enterprise Ticketing Management System  
**Mode:** Plan Only — No Implementation  
**Date:** 2026-06-18

---

## Scope

Authentication, authorization, RBAC, JWT/Supabase tokens, RLS, storage, uploads, CORS, headers, rate limiting, sessions, secrets, OWASP Top 10.

For each issue: Current State → Desired State → Files Impacted → Migration? → Breaking? → Rollback?

---

## SEC-01 — localStorage Token Storage (OWASP A02)

| Field | Detail |
|-------|--------|
| **Current State** | Access/refresh tokens in `localStorage`; read on every API call |
| **Desired State** | HttpOnly Secure SameSite cookies **or** Supabase session with `@supabase/ssr` cookie pattern; no token in JS-accessible storage |
| **Files Impacted** | `frontend/src/services/authSession.ts`, `frontend/src/services/api.ts`, `frontend/src/contexts/AuthContext.tsx`, all direct `localStorage.getItem('token')` callers (~15 files), `backend/src/controllers/auth.controller.js` (login response shape if cookie-based) |
| **Migration Required?** | No DB migration |
| **Breaking Change?** | Yes — auth flow, CORS credentials, login/logout UX |
| **Rollback** | Revert to localStorage pattern; feature flag `AUTH_COOKIE_MODE=false` during transition |

---

## SEC-02 — Default Password in API Response (OWASP A04)

| Field | Detail |
|-------|--------|
| **Current State** | `TempPassword123!` set and returned in message |
| **Desired State** | Generate one-time invite link via Supabase Admin `inviteUserByEmail` or force password reset on first login; never return password in response |
| **Files Impacted** | `backend/src/controllers/auth.controller.js` (`createUser`) |
| **Migration Required?** | No |
| **Breaking Change?** | Yes — admin onboarding UX |
| **Rollback** | Restore previous createUser (not recommended for prod) |

---

## SEC-03 — Email Enumeration (OWASP A07)

| Field | Detail |
|-------|--------|
| **Current State** | `/auth/check-email` returns `exists: boolean`; demo emails hardcoded |
| **Desired State** | Uniform response for all emails; rate limit endpoint; remove demo email shortcut in production |
| **Files Impacted** | `backend/src/controllers/auth.controller.js`, `backend/src/routes/auth.routes.js`, frontend login form if it uses check-email |
| **Migration Required?** | No |
| **Breaking Change?** | Minor — login UX may lose pre-check |
| **Rollback** | Revert controller response shape |

---

## SEC-04 — Open Public RLS Policies (OWASP A05)

| Field | Detail |
|-------|--------|
| **Current State** | `schema.sql` defines `TO public` policies with `USING (true)` on RBAC and audit tables |
| **Desired State** | Production Supabase: authenticated-only or service-role-only policies; deny public on `user_roles`, `audit_logs`, `database_connections` |
| **Files Impacted** | New SQL: `backend/database/security/rls_hardening_production.sql` (additive); **do not re-run legacy `schema.sql`** |
| **Migration Required?** | Yes — Supabase SQL (additive policy changes) |
| **Breaking Change?** | Yes if any client relied on anon direct DB access |
| **Rollback** | `backend/database/security/rls_hardening_rollback.sql` restoring prior policies from snapshot |

---

## SEC-05 — Phase 7.4 Missing RLS (OWASP A01)

| Field | Detail |
|-------|--------|
| **Current State** | Four Phase 7.4 tables have no RLS |
| **Desired State** | RLS policies mirroring ticketing access helpers (`ticketing_can_view_ticket`) |
| **Files Impacted** | New SQL: `backend/database/enable_communication_tracking_rls.sql`; pattern from `enable_ticketing_rls.sql` |
| **Migration Required?** | Yes |
| **Breaking Change?** | No for API (service role); yes for direct Supabase client |
| **Rollback** | `ticket_communication_phase7_4_rollback.sql` (drops tables — **only for pre-prod**); prefer policy-only rollback script |

---

## SEC-06 — Service Role Bypasses All RLS (OWASP A01)

| Field | Detail |
|-------|--------|
| **Current State** | All backend DB ops use `supabaseAdmin` |
| **Desired State** | Short term: enforce authorization in every controller/service (audit complete). Long term: use user-scoped client where feasible for reads |
| **Files Impacted** | All repositories/services using `supabaseAdmin`; priority: ticketing, communication, payroll, employee |
| **Migration Required?** | No (architectural) |
| **Breaking Change?** | Possible if over-tightening access |
| **Rollback** | Revert to admin client per module |

---

## SEC-07 — RBAC Fragmentation (OWASP A01)

| Field | Detail |
|-------|--------|
| **Current State** | `user_roles`, `employees.role`, static PERMISSIONS maps coexist |
| **Desired State** | Single runtime authority — see `RBAC_CONSOLIDATION_PLAN.md` |
| **Files Impacted** | See RBAC plan |
| **Migration Required?** | Yes — data sync |
| **Breaking Change?** | Yes if roles mis-mapped |
| **Rollback** | Dual-read fallback period |

---

## SEC-08 — createUser Skips user_roles Insert

| Field | Detail |
|-------|--------|
| **Current State** | New users get `employees.role` / `users.role` only; login resolves from empty `user_roles` → fallback EMPLOYEE |
| **Desired State** | Atomic insert into `user_roles` on user creation; backfill script for existing users |
| **Files Impacted** | `backend/src/controllers/auth.controller.js`; new `backend/scripts/backfill-user-roles.js` |
| **Migration Required?** | Yes — data backfill SQL |
| **Breaking Change?** | Yes — users may gain/lose effective permissions |
| **Rollback** | Restore fallback to `employees.role` in `role-resolution.service.js` (temporary) |

---

## SEC-09 — CORS Hardcoded Origin (OWASP A05)

| Field | Detail |
|-------|--------|
| **Current State** | `https://yviems.netlify.app` hardcoded alongside `FRONTEND_URL` |
| **Desired State** | `FRONTEND_URL` + optional `CORS_ALLOWED_ORIGINS` comma-separated env |
| **Files Impacted** | `backend/src/app.js`, `backend/src/server.js`, `backend/src/config/index.js`, `backend/.env.example` |
| **Migration Required?** | No |
| **Breaking Change?** | Yes if env not set correctly in prod |
| **Rollback** | Re-add hardcoded URL |

---

## SEC-10 — Missing Frontend Security Headers (OWASP A05)

| Field | Detail |
|-------|--------|
| **Current State** | No `netlify.toml` or `_headers`; Helmet on backend only |
| **Desired State** | CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy on Netlify |
| **Files Impacted** | New `frontend/netlify.toml` or `frontend/public/_headers` |
| **Migration Required?** | No |
| **Breaking Change?** | Possible CSP breaks inline scripts — test thoroughly |
| **Rollback** | Remove headers file |

---

## SEC-11 — Verbose Auth Logging (OWASP A09)

| Field | Detail |
|-------|-------|
| **Current State** | Token length, email, URL logged on every auth request |
| **Desired State** | Structured logger; no token/PII in logs; debug level only in development |
| **Files Impacted** | `backend/src/middlewares/auth.middleware.js`, `frontend/src/services/api.ts` |
| **Migration Required?** | No |
| **Breaking Change?** | No |
| **Rollback** | Re-enable console logs |

---

## SEC-12 — Rate Limiting Gaps (OWASP A07)

| Field | Detail |
|-------|-------|
| **Current State** | Auth: 10/15min; general: 100; no per-user limits |
| **Desired State** | Per-user rate limits on sensitive endpoints; stricter limits on check-email, forgot-password |
| **Files Impacted** | `backend/src/app.js`, new rate limit middleware |
| **Migration Required?** | No |
| **Breaking Change?** | No for normal users |
| **Rollback** | Remove additional limiters |

---

## SEC-13 — File Upload Security

| Field | Detail |
|-------|-------|
| **Current State** | MIME whitelist, 4MB limit, memory storage — good baseline |
| **Desired State** | Add magic-byte validation; virus scan hook (future); store in Supabase Storage with signed URLs only |
| **Files Impacted** | `backend/src/modules/ticketing/middleware/upload.middleware.js`, attachment service |
| **Migration Required?** | No |
| **Breaking Change?** | Minor — stricter validation may reject spoofed MIME |
| **Rollback** | Revert fileFilter |

---

## SEC-14 — Storage Bucket Policies

| Field | Detail |
|-------|-------|
| **Current State** | `profile_image_storage_policies.sql` allows public read; ticket attachments bucket referenced |
| **Desired State** | Private buckets; signed URL access only; authenticated upload policies |
| **Files Impacted** | `backend/database/profile_image_storage_policies.sql`, ticketing storage service |
| **Migration Required?** | Yes — Supabase storage policy SQL |
| **Breaking Change?** | Yes — public profile image URLs may break |
| **Rollback** | Restore public read policy |

---

## SEC-15 — Secrets in .env.example

| Field | Detail |
|-------|-------|
| **Current State** | Real-looking Supabase URL/key prefix in `backend/.env.example` |
| **Desired State** | Placeholder URLs only; document rotation if ever committed live |
| **Files Impacted** | `backend/.env.example` |
| **Migration Required?** | No |
| **Breaking Change?** | No |
| **Rollback** | N/A |

---

## SEC-16 — JWT_SECRET Legacy Requirement

| Field | Detail |
|-------|-------|
| **Current State** | Boot fails audit log if missing; not used in primary auth path |
| **Desired State** | Remove from required list OR document single purpose (internal signing if any) |
| **Files Impacted** | `backend/src/server.js`, `backend/src/config/index.js` |
| **Migration Required?** | No |
| **Breaking Change?** | No |
| **Rollback** | Re-add to required list |

---

## SEC-17 — SUPER_ADMIN Frontend Lockout

| Field | Detail |
|-------|-------|
| **Current State** | SUPER_ADMIN users hit `/app/unauthorized` |
| **Desired State** | Extend `Role` type and ProtectedRoute to include SUPER_ADMIN |
| **Files Impacted** | `frontend/src/types/index.ts`, `frontend/src/App.tsx`, `ProtectedRoute.tsx` |
| **Migration Required?** | No |
| **Breaking Change?** | No |
| **Rollback** | Revert type union |

---

## SEC-18 — CSRF (OWASP - Low Current Risk)

| Field | Detail |
|-------|-------|
| **Current State** | Bearer token in Authorization header — CSRF not applicable |
| **Desired State** | If moving to cookies: implement CSRF tokens + SameSite=Strict |
| **Files Impacted** | Tied to SEC-01 |
| **Migration Required?** | No |
| **Breaking Change?** | Only with cookie auth |
| **Rollback** | Bearer-only auth |

---

## SEC-19 — XSS via Rich Text (OWASP A03)

| Field | Detail |
|-------|-------|
| **Current State** | TipTap used in updates module |
| **Desired State** | Server-side sanitization on save; DOMPurify on render |
| **Files Impacted** | Updates comment/editor components, backend updates service |
| **Migration Required?** | No |
| **Breaking Change?** | Minor — some HTML stripped |
| **Rollback** | Remove sanitizer |

---

## SEC-20 — Debug Endpoints

| Field | Detail |
|-------|-------|
| **Current State** | `/redis-test`, `/cache-stats` protected by SUPER_ADMIN |
| **Desired State** | Disable in production via env `ENABLE_DEBUG_ROUTES=false` |
| **Files Impacted** | `backend/src/app.js` |
| **Migration Required?** | No |
| **Breaking Change?** | No |
| **Rollback** | Re-enable flag |

---

## OWASP Top 10 Summary Matrix

| OWASP | Priority Issues | Wave |
|-------|-----------------|------|
| A01 Broken Access Control | SEC-04,05,06,07,08 | 1–2 |
| A02 Cryptographic Failures | SEC-01 | 1 |
| A03 Injection | SEC-19, upload validation | 2 |
| A04 Insecure Design | SEC-02,07 | 1 |
| A05 Misconfiguration | SEC-04,09,10,15 | 1 |
| A07 Auth Failures | SEC-03,12 | 1 |
| A09 Logging Failures | SEC-11 | 2 |
| A10 SSRF | No immediate action | — |

---

## Implementation Order (Security Only)

1. SEC-04 — Audit live Supabase policies (read-only query first)
2. SEC-02, SEC-03 — Auth controller hardening
3. SEC-08 — user_roles on createUser + backfill
4. SEC-05 — Phase 7.4 RLS SQL (review only, then apply in staging)
5. SEC-09, SEC-10 — CORS + headers
6. SEC-01 — Token storage (requires coordinated FE/BE deploy)
7. SEC-11, SEC-12 — Logging and rate limits

---

*No implementation performed. Await wave approval.*
