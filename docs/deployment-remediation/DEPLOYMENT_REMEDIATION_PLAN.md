# Deployment Remediation Plan

**Project:** Enterprise Ticketing Management System  
**Mode:** Plan Only — No Configs Created  
**Date:** 2026-06-18

---

## Target Architecture

```
GitHub → Netlify (frontend/dist) → Browser
              ↓ VITE_API_URL
         Render (Node/Express) → Supabase (PostgreSQL, Auth, Storage)
              ↓ optional
         Render Redis / Upstash Redis
```

---

## Netlify Readiness

### Current State

| Item | Status | Evidence |
|------|--------|----------|
| Build command | Documented | `frontend/package.json`: `"build": "vite build"` |
| Publish directory | Standard | `dist/` (Vite default) |
| SPA routing | ✅ | `frontend/public/_redirects`: `/* /index.html 200` |
| netlify.toml | ❌ Missing | — |
| Security headers | ❌ Missing | — |
| Env vars at build | Required | `VITE_*` flags baked at build time |
| Node version | Unpinned | — |

### Desired State (Planned Artifacts — Not Created)

**File:** `frontend/netlify.toml` (future)

```toml
# PLANNED — NOT CREATED YET
[build]
  base = "frontend"
  command = "npm ci && npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Netlify Environment Variables (Required)

| Variable | Build/Runtime | Required |
|----------|---------------|----------|
| `VITE_API_URL` | Build | Yes |
| `VITE_SUPABASE_URL` | Build | Yes |
| `VITE_SUPABASE_ANON_KEY` | Build | Yes |
| `VITE_ENABLE_TICKETING` | Build | Yes |
| `VITE_ENABLE_TICKET_FEEDBACK` | Build | Yes |
| `VITE_ENABLE_TICKET_ASSIGNMENTS` | Build | Yes |
| `VITE_ENABLE_COMMUNICATION_TRACKING` | Build | Yes |
| Other `VITE_ENABLE_*` | Build | As needed |

**Critical:** Rebuild required when any `VITE_*` flag changes.

---

## Render Readiness

### Current State

| Item | Status | Evidence |
|------|--------|----------|
| Start command | ✅ | `npm start` → `node src/server.js` |
| Port binding | ✅ | `0.0.0.0` in production (`server.js:164`) |
| Health check | ✅ | `/health/ping`, `/health` |
| render.yaml | ❌ Missing | — |
| Graceful shutdown | ❌ HTTP not handled | Redis SIGTERM only |
| Redis | Optional | `docker-compose.yml` local only |
| Log persistence | ❌ | Winston → local `logs/` |

### Desired State (Planned Artifacts — Not Created)

**File:** `render.yaml` (future, repo root or backend/)

```yaml
# PLANNED — NOT CREATED YET
services:
  - type: web
    name: etms-api
    runtime: node
    rootDir: backend
    buildCommand: npm ci
    startCommand: npm start
    healthCheckPath: /health/ping
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_ANON_KEY
        sync: false
      - key: SUPABASE_SERVICE_ROLE_KEY
        sync: false
      - key: FRONTEND_URL
        sync: false
      - key: ENABLE_TICKETING
        value: "true"
```

### Render Environment Variables (Required)

| Variable | Required | Notes |
|----------|----------|-------|
| `NODE_ENV` | Yes | `production` |
| `PORT` | Auto | Render injects |
| `SUPABASE_URL` | Yes | |
| `SUPABASE_ANON_KEY` | Yes | |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Secret |
| `FRONTEND_URL` | Yes | Netlify URL |
| `JWT_SECRET` | Yes (legacy) | Consider removing requirement |
| `ENABLE_TICKETING` | Yes | Must match product scope |
| `ENABLE_TICKET_FEEDBACK` | Yes | |
| `ENABLE_TICKET_ASSIGNMENTS` | Yes | |
| `ENABLE_COMMUNICATION_TRACKING` | Yes | |
| `ENABLE_REDIS` | Recommended | `true` for multi-instance |
| `REDIS_URL` or HOST/PORT | If Redis | Upstash or Render Redis |
| `ENABLE_SOCKET_REDIS` | Recommended | `true` with Redis |
| `LOG_LEVEL` | Optional | `warn` in prod |
| `CORS_ALLOWED_ORIGINS` | Planned | Replace hardcoded URL |

---

## Supabase Readiness

### Current State

- Client init requires service role (`supabase.js`)
- Manual SQL migrations in `backend/database/`
- No Supabase CLI migrations folder in repo
- RLS state unknown for production

### Desired State

1. **Supabase CLI project linked** with migration history
2. **Staging + Production** projects separated
3. **Policy audit** documented before go-live
4. **Storage buckets** defined: `ticket-attachments`, profile images, payslips
5. **Backup schedule** confirmed in Supabase dashboard (Pro plan PITR)

### Pre-Deploy Checklist (Manual)

- [ ] Confirm RLS enabled on all ticket tables
- [ ] Confirm Phase 7.4 RLS applied OR feature disabled
- [ ] Revoke public policies from legacy schema if present
- [ ] Rotate service role key if exposed in `.env.example` history
- [ ] Configure Auth redirect URLs for Netlify domain
- [ ] Configure SMTP in Supabase for password reset emails

---

## Build Process

### Frontend

```bash
cd frontend && npm ci && npm run build
# Output: frontend/dist
# Tests: npm run test && npm run test:e2e (before prod deploy)
```

### Backend

```bash
cd backend && npm ci
# No build step — ts-node runtime (remediation: precompile TS)
# Tests: npm test
```

**Planned improvement:** Add `npm run build` compiling TS to `dist/`; start with `node dist/server.js`.

---

## Health Checks

| Endpoint | Purpose | Render Use |
|----------|---------|------------|
| `GET /health/ping` | Liveness | Primary health check |
| `GET /health` | DB + Redis + cache | Deep check / monitoring |

**Note:** `/health` returns 503 if Redis down — may cause false failures if Redis optional. Consider separate liveness vs readiness.

---

## Monitoring (Deployment Layer)

| Capability | Current | Planned |
|------------|---------|---------|
| Render health checks | Manual config | render.yaml |
| Uptime monitoring | None | UptimeRobot / Render built-in |
| Log drain | None | Render log stream → observability vendor |
| Alerts | None | Sentry + Render notifications |

---

## Backups & Recovery

| Asset | Strategy |
|-------|----------|
| PostgreSQL | Supabase automated backups + PITR (plan dependent) |
| Storage buckets | Supabase storage replication; export script (planned) |
| Env config | Document in secure vault; not in git |
| Code | GitHub tags per release |

### Recovery Runbook (Planned Document)

1. Identify failure (DB / API / Frontend)
2. Rollback Render deploy to previous image
3. Rollback Netlify deploy via dashboard
4. If DB migration failed: run rollback SQL or Supabase PITR
5. Disable feature flags (Level 1 rollback)

---

## Deployment Risks

| Risk | Mitigation |
|------|------------|
| Feature flag mismatch | Deploy checklist comparing FE build env vs BE env |
| CORS failure | Set FRONTEND_URL before first prod traffic |
| Health check flaps | Use `/health/ping` only for Render |
| ts-node OOM/slow boot | Precompile in build step |
| Puppeteer OOM | Disable payroll on Render or use worker service |
| Ephemeral logs | Stream to external service |

---

## Deployment Readiness Targets

| Platform | Current | After Remediation |
|----------|---------|-------------------|
| Netlify | 65% | 90% |
| Render | 60% | 85% |
| Supabase | 55% | 85% |

---

*No configuration files created. Await approval for netlify.toml and render.yaml.*
