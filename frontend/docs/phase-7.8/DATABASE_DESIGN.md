# Phase 7.8 — Database Design

**Migration:** `backend/database/notification_center_phase7_8.sql`  
**Rollback:** `backend/database/notification_center_phase7_8_rollback.sql`

Additive only — **no ALTER** on existing ETMS tables.

## New Tables

### notification_templates

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| code | VARCHAR(80) UNIQUE | e.g. TICKET_ASSIGNED |
| name | VARCHAR(150) | Display name |
| type | VARCHAR(50) | TICKET, SLA, APPROVAL, etc. |
| subject | VARCHAR(255) | Template subject |
| message_template | TEXT | Supports `{{var}}` placeholders |
| is_active | BOOLEAN | Default true |
| created_at / updated_at | TIMESTAMPTZ | |

### notification_preferences

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| employee_id | UUID UNIQUE FK → employees | ON DELETE CASCADE |
| email_enabled | BOOLEAN | Default true |
| in_app_enabled | BOOLEAN | Default true |
| sms_enabled | BOOLEAN | Default false |
| push_enabled | BOOLEAN | Default false |
| created_at / updated_at | TIMESTAMPTZ | |

### notification_center_events

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| employee_id | UUID FK → employees | Recipient |
| event_type | VARCHAR(50) | 17 supported types |
| title | VARCHAR(255) | |
| message | TEXT | |
| source_module | VARCHAR(50) | ticketing, sla, approval, etc. |
| source_id | VARCHAR(100) | Source record ID |
| priority | VARCHAR(20) | LOW, NORMAL, HIGH, CRITICAL |
| status | VARCHAR(20) | ACTIVE, ARCHIVED |
| is_read | BOOLEAN | Default false |
| created_at | TIMESTAMPTZ | |

**Unique:** `(employee_id, event_type, source_module, source_id)` — deduplication  
**Indexes:** employee+read, module, priority

### notification_delivery_log

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| event_id | UUID FK → notification_center_events | ON DELETE CASCADE |
| channel | VARCHAR(20) | IN_APP, EMAIL, SMS, PUSH |
| delivery_status | VARCHAR(20) | PENDING, SENT, FAILED, SKIPPED |
| attempted_at | TIMESTAMPTZ | |

## Seed Data

17 default notification templates matching all event types.

## Isolation Contract

No writes to existing `notifications` table or any Phase 7.1–7.7 module tables.
