# Landing & Login Discovery Audit — Phase 6.6

**Date:** 2026-06-16  
**Mode:** Read-only discovery (pre-implementation)

---

## Landing Page Files

| File | Purpose | Safe to edit text? | Risk |
|------|---------|-------------------|------|
| `frontend/src/pages/Landing.tsx` | Main marketing landing page (975 lines) | ✅ Yes — text/alt only | Low |
| `frontend/src/components/landing/SectionHeading.tsx` | Reusable section headings | ⚠️ Shared component — avoid unless needed | Low |
| `frontend/src/components/landing/AnimatedContainer.tsx` | Animation wrapper | ❌ No content | None |
| `frontend/src/components/layout/MegaMenu.tsx` | Nav mega menu (lazy) | ❌ Out of scope (not landing body) | Medium |
| `frontend/src/App.tsx` | Route `/` → `<Landing />` | ❌ Do not change routes | None |

## Login Page Files

| File | Purpose | Safe to edit text? | Risk |
|------|---------|-------------------|------|
| `frontend/src/pages/Login.tsx` | Login page shell + auth handler | ❌ Auth logic — text N/A | High if touched |
| `frontend/src/components/auth/GlassLoginLayout.tsx` | Split layout, footer, logo watermark | ✅ Footer + alt text | Low |
| `frontend/src/components/auth/LoginGlassCard.tsx` | Card header title/subtitle/logo | ✅ Yes | Low |
| `frontend/src/components/auth/LoginForm.tsx` | Form fields + submit | ⚠️ Labels/placeholders only | Medium |
| `frontend/src/components/auth/TestimonialCard.tsx` | Login sidebar quotes | ✅ Yes | Low |
| `frontend/src/components/auth/TrustBadge.tsx` | SOC2 badge | ✅ Optional text | Low |
| `frontend/src/components/auth/LoginInput.tsx` | Input UI | ❌ Structure only | None |
| `frontend/src/components/auth/LoginButton.tsx` | Button UI | ❌ Keep "Login" label OK | None |

## SEO & Global

| File | Purpose | Safe to edit? | Risk |
|------|---------|--------------|------|
| `frontend/index.html` | Document title, meta, OG tags | ✅ Yes | Low |
| `frontend/public/robots.txt` | Crawler rules | ❌ No content change needed | None |
| `frontend/public/favicon.ico` | Favicon | ⚠️ Asset replace only | Low |
| `frontend/.env.example` | `VITE_APP_NAME` | ⚠️ Optional — not runtime landing | Low |

## Tests

| File | Notes |
|------|-------|
| `frontend/src/pages/__tests__/Landing.test.tsx` | Property tests on focus rings, alt text, landmarks — content changes must preserve classes/structure |

## Out of Scope (Do Not Edit)

- `AppLayout.tsx`, `Dashboard.tsx`, EMS/ETMS modules, auth/RBAC backend
- Route definitions, ProtectedRoute, AuthContext
