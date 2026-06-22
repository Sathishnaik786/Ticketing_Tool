# Dependency Matrix — Phase 9.2.5

This document details the packages declared in `package.json` files for both frontend and backend, indicating packages targeted for removal.

## Frontend Dependencies (`frontend/package.json`)

| Package | Version | Usage | Classification | Target Action |
|---|---|---|---|---|
| `@fullcalendar/daygrid` | `^6.1.20` | Attendance/Calendar views | Legacy EMS | REMOVE (post-UAT) |
| `@fullcalendar/interaction`| `^6.1.20` | Interaction logic for calendar| Legacy EMS | REMOVE (post-UAT) |
| `@fullcalendar/react` | `^6.1.20` | Calendar React bindings | Legacy EMS | REMOVE (post-UAT) |
| `@fullcalendar/timegrid` | `^6.1.20` | Week/Day schedule views | Legacy EMS | REMOVE (post-UAT) |
| `recharts` | `^2.15.4` | Analytics, CSAT, SLAs charts | Active ETMS | KEEP |
| `@supabase/supabase-js` | `^2.89.0` | Client direct DB connections | Active ETMS | KEEP |
| `@tanstack/react-query` | `^5.83.0` | Server state management | Active ETMS | KEEP |
| `socket.io-client` | `^4.8.3` | Realtime notification socket | Active ETMS | KEEP |
| `framer-motion` | `^12.23.26`| Premium micro-animations | Active ETMS | KEEP |
| `web-vitals` | `^4.2.4` | Telemetry performance checks | Active ETMS | KEEP |
| `axe-core` | `^4.10.3` | Accessibility testing engine | Dev | KEEP |

## Backend Dependencies (`backend/package.json`)

| Package | Version | Usage | Classification | Target Action |
|---|---|---|---|---|
| `@socket.io/redis-adapter`| `^8.2.1` | Socket cluster pubsub | Active ETMS | KEEP |
| `ioredis` | `^5.3.2` | Primary Redis client connector| Active ETMS | KEEP |
| `exceljs` | `^4.4.0` | Payroll bulk uploading Excel | Active HCM | KEEP |
| `xlsx` | `^0.18.5` | Payroll bulk spreadsheets parser| Active HCM | KEEP |
| `puppeteer` | `^22.6.0` | PDF payslip renderer | Active HCM | KEEP |
| `pg` | `^8.16.3` | Raw database connection pool | Active ETMS | KEEP |
| `winston` | `^3.11.0` | Telemetry structured logging | Active ETMS | KEEP |
| `zod` | `^4.4.3` | Payload shape schema validation| Active ETMS | KEEP |

## Cleanup Target
We target removing `@fullcalendar/*` packages from `frontend/package.json` in a future phase when UAT is complete and code deletion is officially approved.
