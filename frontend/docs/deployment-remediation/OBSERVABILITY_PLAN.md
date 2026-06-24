# Observability Plan

**Project:** Enterprise Ticketing Management System  
**Mode:** Plan Only — No Implementation  
**Date:** 2026-06-18

---

## Current State Assessment

| Capability | Status | Evidence |
|------------|--------|----------|
| Structured logging | Partial | `backend/src/lib/logger.js` — Winston JSON, daily rotate files |
| Console logging | Excessive | Auth middleware, frontend api.ts |
| HTTP access logs | Dev only | Morgan in development (`app.js:107-109`) |
| Audit logs (DB) | Partial | `ticket_activities`, `ticket_activity_timeline`; legacy open RLS risk |
| Error tracking | None | No Sentry/etc. |
| Metrics | None | No Prometheus/statsd |
| Tracing | None | No OpenTelemetry |
| Request correlation IDs | None | — |
| Frontend error boundaries | Yes | `RouteErrorBoundary.tsx` — no external reporting |
| Log aggregation | None | Local files only — lost on Render restart |

**Observability Maturity Score: 25/100**

---

## Target Observability Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Browser   │────▶│   Sentry     │     │    Datadog /    │
│  (React)    │     │  (FE errors) │     │    Grafana      │
└─────────────┘     └──────────────┘     └────────▲────────┘
                                                    │
┌─────────────┐     ┌──────────────┐               │
│   Render    │────▶│   Sentry     │───────────────┤
│  (Express)  │     │  (BE errors) │               │
└──────┬──────┘     └──────────────┘               │
       │                                            │
       ▼                                            │
┌──────────────┐     ┌──────────────┐               │
│   Logtail /  │────▶│  Dashboards  │───────────────┘
│   Datadog    │     │   & Alerts   │
│   Logs       │     └──────────────┘
└──────────────┘

Optional: OpenTelemetry → Collector → Tempo/Jaeger
```

---

## Phase O1 — Error Tracking (Sentry)

### Current State
Unhandled errors logged to Winston/console only. Frontend errors lost unless user reports.

### Desired State
- `@sentry/node` in Express error middleware
- `@sentry/react` in frontend with ErrorBoundary integration
- Source maps uploaded on Netlify build
- PII scrubbing (email, token) in beforeSend hook

### Files Impacted (Future)
- `backend/src/app.js` — Sentry init + error handler
- `backend/src/server.js` — init before bootstrap
- `frontend/src/main.tsx` — Sentry init
- `frontend/vite.config.ts` — sourcemap + sentry plugin
- `frontend/netlify.toml` — SENTRY_AUTH_TOKEN build env

### Migration Required? No
### Breaking Change? No
### Rollback: Remove Sentry init; unset DSN env vars

**Env vars:**
- `SENTRY_DSN` (backend)
- `VITE_SENTRY_DSN` (frontend)
- `SENTRY_ENVIRONMENT` (staging/production)

---

## Phase O2 — Log Aggregation (Logtail / Datadog)

### Current State
Winston writes to `logs/error-*.log`, `logs/combined-*.log` — ephemeral on Render.

### Desired State
- Winston transport → HTTP/syslog to Logtail or Datadog
- Render log stream integration
- JSON structured logs with standard fields:

```json
{
  "timestamp": "...",
  "level": "info",
  "service": "etms-api",
  "requestId": "uuid",
  "userId": "uuid",
  "method": "GET",
  "path": "/api/tickets",
  "statusCode": 200,
  "durationMs": 45
}
```

### Files Impacted (Future)
- `backend/src/lib/logger.js` — add remote transport
- `backend/src/middlewares/logger.middleware.js` — request ID injection
- New `backend/src/middlewares/request-id.middleware.js`

### Migration Required? No
### Breaking Change? No
### Rollback: Remove remote transport; file-only logging

---

## Phase O3 — Metrics (Datadog / Grafana Cloud)

### Current State
No metrics.

### Desired State (Minimum Viable)
- Request rate, latency p95, error rate per route
- Health check status gauge
- Redis connection status
- Feature flag status gauge
- Ticket operations counter (created, closed, SLA breached)

### Implementation Options

| Option | Effort | Cost |
|--------|--------|------|
| Datadog APM | Medium | $$ |
| Prometheus + Grafana Cloud | Medium | $ |
| Render built-in metrics | Low | Included |

### Files Impacted (Future)
- `backend/src/middlewares/metrics.middleware.js` (NEW)
- Optional: `prom-client` dependency

### Migration Required? No
### Breaking Change? No

---

## Phase O4 — Distributed Tracing (OpenTelemetry)

### Current State
None.

### Desired State (Phase 2 observability)
- `@opentelemetry/sdk-node` auto-instrument Express, HTTP, pg
- Trace context propagated via `traceparent` header
- Frontend_Apache correlation with frontend Sentry transactions

### Priority: Lower — implement after O1/O2 stable

### Files Impacted
- `backend/src/server.js` — OTel init before Express
- `backend/package.json` — OTel dependencies

### Migration Required? No
### Breaking Change? No

---

## Audit Log Strategy

### Application Audit (Business Events)
**Existing:** `ticket_activities`, `ticket_activity_timeline`, meetup audit logs

**Gaps:**
- No unified enterprise audit table consumed by all modules
- Legacy `audit_logs` table has open public RLS in schema.sql

**Plan:**
1. Harden `audit_logs` RLS (see DATABASE_REMEDIATION_PLAN)
2. Standardize audit write helper: `AuditService.log({ actorId, action, resource, metadata })`
3. Never log passwords, tokens, full request bodies

### Security Audit
- Log auth failures (without password)
- Log permission denials (ownership.middleware already warns)
- Log admin actions (user create, role change)

---

## Alerting Rules (Planned)

| Alert | Condition | Channel |
|-------|-----------|---------|
| API error spike | 5xx rate > 1% for 5min | PagerDuty/Slack |
| Health check fail | /health/ping down 2min | PagerDuty |
| Auth failure spike | 401 rate > baseline 3x | Slack |
| SLA job failure | If Phase 7.3 enabled | Slack |
| Redis disconnect | health degraded | Slack |

---

## Frontend Observability

| Item | Plan |
|------|------|
| Error boundary → Sentry | Integrate captureException |
| API failure toast | Already via sonner — add Sentry breadcrumb |
| Web Vitals | Optional — Netlify Analytics or Sentry performance |
| User session replay | Optional — Sentry replay (privacy review required) |

---

## Readiness by Vendor

| Vendor | Readiness | Notes |
|--------|-----------|-------|
| **Sentry** | High — drop-in for Node + React | Recommended first |
| **Logtail** | High — Winston transport available | Cost-effective logs |
| **Datadog** | Medium — full stack but heavier setup | Good if already licensed |
| **Grafana** | Medium — needs Prometheus metrics source | Pair with OTel |
| **OpenTelemetry** | Low current — plan for Wave 7 | After basics stable |

---

## Implementation Order

1. Request ID middleware + structured log fields
2. Sentry backend + frontend
3. Log drain (Logtail or Render → Datadog)
4. Basic metrics (request duration histogram)
5. OpenTelemetry (optional)
6. Audit service standardization

---

## Success Criteria

- [ ] 100% unhandled exceptions captured in Sentry
- [ ] Logs searchable by requestId and userId
- [ ] < 5 min MTTD for production 5xx errors
- [ ] Dashboard showing API latency p95, error rate, uptime
- [ ] Zero tokens/passwords in log streams (automated scan)

---

*No observability tools installed. Await Wave 7 approval.*
