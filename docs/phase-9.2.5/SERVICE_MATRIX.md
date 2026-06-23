# Service Matrix — Phase 9.2.5

This document maps application services from frontend and backend, listing their API clients and isolation risks.

## Frontend Services

| Service | Consumers | Status | Isolation Risk / Strategy |
|---|---|---|---|
| `services/api.ts` | All pages, modules | REVIEW | High. Contains merged endpoints (auth, employees, departments). Leave in place but remove calendarApi. |
| `services/authSession.ts` | AuthContext, App.tsx | KEEP | None. Handles JWT session persistence. |
| `services/chatService.ts` | Chat components | ARCHIVE | Low. Chat feature is deprecated. Move to ems_backup/. |
| `services/notificationService.ts` | AppLayout, Header | KEEP | None. Interacts with new Notification Center. |
| `services/featureFlagTelemetry.service.ts` | AppBootstrap | KEEP | None. Captures telemetry for analytics. |
| `services/observability/` | AppBootstrap, queryClient | KEEP | None. Facade provider for Sentry integration. |

## Backend Services

| Service | Consumers | Status | Isolation Risk / Strategy |
|---|---|---|---|
| `services/cache.service.js` | Controllers, app.js | KEEP | None. Redis/in-memory cache wrapper. |
| `services/redis-health.service.js` | server.js | KEEP | None. Redis connectivity monitoring. |
| `services/telemetry/` | app.js, health.routes | KEEP | None. Tracks request count, duration, DB queries. |
| `services/audit/` | app.js, middlewares | KEEP | None. Async queue processor. |
| `services/role-resolution.service.js` | auth.middleware, controllers | KEEP | None. Resolves roles via database tables. |
| `services/role-sync.service.js` | Auth webhook / sync | REVIEW | Low. Syncs roles between Auth and public schema. |
