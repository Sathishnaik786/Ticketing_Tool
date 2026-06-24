# Phase 7.7 — Database Design

**Migration:** `backend/database/executive_analytics_phase7_7.sql`  
**Rollback:** `backend/database/executive_analytics_phase7_7_rollback.sql`

Additive only — **no ALTER** on existing ETMS tables.

## New Tables

### analytics_snapshots

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | `gen_random_uuid()` |
| snapshot_type | VARCHAR(50) | EXECUTIVE, DEPARTMENT, BUSINESS_UNIT, CUSTOM |
| scope_key | VARCHAR(100) | Optional department/BU key |
| payload | JSONB | Serialized dashboard payload |
| captured_at | TIMESTAMPTZ | Default NOW |
| captured_by | UUID FK → employees | ON DELETE SET NULL |
| created_at | TIMESTAMPTZ | Default NOW |

**Index:** `(snapshot_type, captured_at DESC)`

### analytics_reports

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| name | VARCHAR(200) | Report title |
| report_type | VARCHAR(50) | EXECUTIVE, DEPARTMENT, BUSINESS_UNIT, SLA, CSAT, APPROVAL, KNOWLEDGE, TREND |
| format | VARCHAR(20) | JSON, CSV, XLSX, PDF |
| filters | JSONB | Applied filter set |
| payload | JSONB | Generated report data |
| created_by | UUID FK → employees | |
| created_at | TIMESTAMPTZ | |

**Index:** `(report_type, created_at DESC)`

### analytics_saved_filters

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| name | VARCHAR(150) | User-defined name |
| dashboard_type | VARCHAR(50) | executive, department, business_unit |
| filters | JSONB | Saved filter JSON |
| owner_id | UUID FK → employees | ON DELETE CASCADE |
| is_shared | BOOLEAN | Default false |
| created_at / updated_at | TIMESTAMPTZ | |

**Index:** `(owner_id)`

### analytics_dashboard_configs

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| dashboard_key | VARCHAR(100) UNIQUE | executive, department, business_unit |
| title | VARCHAR(200) | Display title |
| config | JSONB | Widget/scope configuration |
| is_active | BOOLEAN | Default true |
| created_at / updated_at | TIMESTAMPTZ | |

## Seed Data

Default dashboard configs for executive, department, and business unit views with Aparna BU and department lists.

## Read-Only Contract

The analytics repository **SELECTs** from ETMS source tables only. **INSERT/UPDATE** limited to the four `analytics_*` tables above.
