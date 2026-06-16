# Phase 7.4 — Database Design

## New tables

### ticket_communications

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| ticket_id | UUID FK → tickets | CASCADE delete |
| communication_type | VARCHAR(30) | COMMENT, CHAT, EMAIL, PHONE_CALL, MEETING, SYSTEM_NOTE |
| direction | VARCHAR(20) | INBOUND, OUTBOUND, INTERNAL |
| subject | VARCHAR(500) | nullable |
| message | TEXT | required |
| created_by | UUID FK → employees | |
| visibility | VARCHAR(20) | PUBLIC, INTERNAL |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | trigger: `update_updated_at_column` |

### ticket_call_logs

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| ticket_id | UUID FK → tickets | |
| employee_id | UUID FK → employees | agent who logged call |
| customer_name | VARCHAR(200) | nullable |
| phone_number | VARCHAR(50) | nullable |
| call_start_at | TIMESTAMPTZ | required |
| call_end_at | TIMESTAMPTZ | nullable |
| duration_seconds | INT | nullable, auto-computed from start/end |
| call_summary | TEXT | nullable |
| outcome | VARCHAR(30) | NO_ANSWER, CONNECTED, RESOLVED, FOLLOWUP_REQUIRED |
| created_at | TIMESTAMPTZ | |

### ticket_email_logs

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| ticket_id | UUID FK → tickets | |
| sender | VARCHAR(255) | |
| recipient | VARCHAR(255) | |
| cc | VARCHAR(500) | nullable |
| subject | VARCHAR(500) | |
| body | TEXT | |
| status | VARCHAR(20) | SENT, FAILED, RECEIVED |
| created_at | TIMESTAMPTZ | |

### ticket_activity_timeline

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| ticket_id | UUID FK → tickets | |
| event_type | VARCHAR(50) | See enum in migration SQL |
| event_data | JSONB | default `{}` |
| created_by | UUID FK → employees | nullable |
| created_at | TIMESTAMPTZ | |

## Indexes

- `ticket_communications(ticket_id, created_at DESC)`
- `ticket_call_logs(ticket_id, call_start_at DESC)`
- `ticket_email_logs(ticket_id, created_at DESC)`
- `ticket_activity_timeline(ticket_id, created_at DESC)`

## Unchanged tables

- `ticket_comments` (ETMS Phase 1)
- `ticket_activities` (ETMS Phase 1)
- All Phase 7.1–7.3 tables

## Migration files

- Apply: `backend/database/ticket_communication_phase7_4.sql`
- Rollback: `backend/database/ticket_communication_phase7_4_rollback.sql`
