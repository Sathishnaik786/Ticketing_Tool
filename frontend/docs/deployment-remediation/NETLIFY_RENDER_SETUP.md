# Netlify + Render Deployment Setup

Quick reference for deploying this monorepo.

| Layer    | Platform | Config file              |
|----------|----------|--------------------------|
| Frontend | Netlify  | `frontend/netlify.toml`  |
| Backend  | Render   | `render.yaml`            |

---

## 1. Render (Backend) — First

Deploy the API first so you have the URL for the frontend build.

### Option A — Blueprint (recommended)

1. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
2. Connect GitHub repo `Ticketing_Tool`
3. Render reads `render.yaml` from repo root
4. Set secret env vars when prompted (see table below)

### Option B — Manual Web Service

| Setting            | Value              |
|--------------------|--------------------|
| Root Directory     | `backend`          |
| Build Command      | `npm ci --omit=dev` |
| Start Command      | `npm start`        |
| Health Check Path  | `/health/ping`     |
| Instance Type      | Starter (512 MB+)  |

### Render environment variables

| Variable | Required | Example / notes |
|----------|----------|-----------------|
| `NODE_ENV` | Yes | `production` |
| `PORT` | Auto | Render sets `10000`; keep in sync |
| `SUPABASE_URL` | Yes | `https://xxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | **Secret** — never expose to frontend |
| `JWT_SECRET` | Yes | Long random string (64+ chars) |
| `FRONTEND_URL` | Yes | `https://your-app.netlify.app` (no trailing slash) |
| `ENABLE_TICKETING` | Yes | `true` to expose ticketing API |
| `ENABLE_TICKET_FEEDBACK` | Yes | `true` |
| `ENABLE_TICKET_ASSIGNMENTS` | Yes | `true` |
| `ENABLE_COMMUNICATION_TRACKING` | Yes | `true` |
| `ENABLE_REDIS` | No | `false` until Redis add-on is provisioned |
| `ENABLE_SOCKET_REDIS` | No | `false` without Redis |
| `ENABLE_CACHE` | No | `false` without Redis |
| `LOG_LEVEL` | No | `warn` |
| `ENABLE_DEBUG_ROUTES` | No | `false` in production |

**API base URL after deploy:**

```text
https://etms-api.onrender.com/api
```

(Replace `etms-api` with your Render service name.)

---

## 2. Netlify (Frontend)

1. [Netlify Dashboard](https://app.netlify.com) → **Add new site** → **Import from Git**
2. Select the same GitHub repo
3. Netlify auto-detects `frontend/netlify.toml` when **Base directory** is empty (config sets `base = "frontend"`)
   - If prompted manually: Base = `frontend`, Build = `npm ci && npm run build`, Publish = `dist`

### Netlify environment variables

Set under **Site configuration → Environment variables → Production** (and Deploy previews if needed).

| Variable | Required | Example |
|----------|----------|---------|
| `VITE_API_URL` | Yes | `https://etms-api.onrender.com/api` |
| `VITE_SUPABASE_URL` | Yes | Same as backend `SUPABASE_URL` |
| `VITE_SUPABASE_ANON_KEY` | Yes | Same as backend anon key |
| `VITE_ENABLE_TICKETING` | Yes | `true` |
| `VITE_ENABLE_TICKET_FEEDBACK` | Yes | `true` |
| `VITE_ENABLE_TICKET_ASSIGNMENTS` | Yes | `true` |
| `VITE_ENABLE_COMMUNICATION_TRACKING` | Yes | `true` |
| `VITE_APP_NAME` | No | `Enterprise Ticketing System` |
| `VITE_ENABLE_DAILY_UPDATES` | No | `false` |
| `VITE_ENABLE_WEEKLY_UPDATES` | No | `false` |

**Important:** `VITE_*` vars are baked in at **build time**. After changing them, trigger **Clear cache and deploy site**.

---

## 3. Supabase (Auth redirects)

In Supabase → **Authentication → URL Configuration**:

| Setting | Value |
|---------|-------|
| Site URL | `https://your-app.netlify.app` |
| Redirect URLs | `https://your-app.netlify.app/**`, `https://your-app.netlify.app/reset-password` |

---

## 4. CORS alignment

Backend allows origins from:

- `FRONTEND_URL` env var
- Hardcoded fallback `https://yviems.netlify.app` (legacy)

Set `FRONTEND_URL` on Render to your **exact** Netlify URL:

```text
https://your-app.netlify.app
```

No trailing slash.

---

## 5. Feature flag sync checklist

Backend (Render) and frontend (Netlify) flags must match:

| Backend (Render) | Frontend (Netlify) |
|------------------|-------------------|
| `ENABLE_TICKETING=true` | `VITE_ENABLE_TICKETING=true` |
| `ENABLE_TICKET_FEEDBACK=true` | `VITE_ENABLE_TICKET_FEEDBACK=true` |
| `ENABLE_TICKET_ASSIGNMENTS=true` | `VITE_ENABLE_TICKET_ASSIGNMENTS=true` |
| `ENABLE_COMMUNICATION_TRACKING=true` | `VITE_ENABLE_COMMUNICATION_TRACKING=true` |

---

## 6. Post-deploy smoke test

```text
1. GET  https://etms-api.onrender.com/health/ping     → { "status": "ok" }
2. Open https://your-app.netlify.app/login
3. Login with a user that has employees + user_roles rows
4. Navigate to /app/tickets (if ticketing enabled)
5. Create a test ticket
```

---

## 7. Optional — Redis on Render

When you need real-time chat across multiple instances:

1. Uncomment Redis service in `render.yaml` or add Render Redis manually
2. On `etms-api` service set:
   - `ENABLE_REDIS=true`
   - `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD` from Redis instance
   - `ENABLE_SOCKET_REDIS=true`
   - `ENABLE_CACHE=true`

---

## 8. Troubleshooting

| Symptom | Fix |
|---------|-----|
| CORS error in browser | Set `FRONTEND_URL` on Render; redeploy backend |
| 503 on `/api/tickets` | Set `ENABLE_TICKETING=true` on Render |
| Ticketing UI missing | Set `VITE_ENABLE_TICKETING=true` on Netlify; rebuild |
| 401 on all API calls | Check Supabase keys; verify user has employee record |
| Render cold start slow | Normal on free/starter; upgrade plan or use uptime ping |
| Render build fails on `npm ci` | Commit `backend/package-lock.json` (must not be gitignored); push and redeploy |
