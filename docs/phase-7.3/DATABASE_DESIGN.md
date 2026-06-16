# Phase 7.3 Database Design

## Principles

- **New tables only** — no ALTER on existing tables
- **No changes** to `ticket_sla_rules`, `ticket_escalations`, `tickets.sla_*`
- Rollback drops **only** Phase 7.3 objects

---

## Entity Relationship

```
business_units
     │
     ├──< sla_policies >──┐
     │                    │
departments ───────────────┤
     │                    │
ticket_categories ─────────┤
                           │
tickets ──< ticket_sla >───┘
     │
     └──< ticket_sla_escalation_events
```

---

## Tables

### business_units (NEW)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| code | VARCHAR(50) UNIQUE | e.g. `APARNA_REALTY` |
| name | VARCHAR(150) | e.g. `Aparna Realty` |
| is_active | BOOLEAN | default true |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**Seed values:** Aparna Realty, Aparna RMC, Aparna Tiles, Venster, Alteza, Rollform, Unispace, Externa, Corporate Services.

---

### department_business_unit_map (NEW, optional)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| department_id | UUID FK → departments | |
| business_unit_id | UUID FK → business_units | |
| created_at | TIMESTAMPTZ | |

UNIQUE(department_id, business_unit_id)

---

### sla_policies (NEW)

Replaces **conceptual** role of `ticket_sla_rules` for Phase 7.3 engine only.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| name | VARCHAR(150) | |
| business_unit_id | UUID FK nullable | |
| department_id | UUID FK nullable | |
| category_id | UUID FK nullable → ticket_categories | |
| priority | VARCHAR(20) | LOW, MEDIUM, HIGH, CRITICAL |
| response_time_minutes | INT | > 0 |
| resolution_time_minutes | INT | > 0 |
| is_active | BOOLEAN | default true |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**Indexes:**

- `(priority, is_active)`
- `(business_unit_id, department_id, category_id, priority)` partial where is_active
- `(department_id, priority)` where is_active

**Default seed (global policies):**

| Priority | Response | Resolution |
|----------|----------|------------|
| LOW | 480 min (8h) | 4320 min (72h) |
| MEDIUM | 240 min (4h) | 1440 min (24h) |
| HIGH | 60 min (1h) | 480 min (8h) |
| CRITICAL | 15 min | 240 min (4h) |

---

### ticket_sla (NEW)

Runtime SLA tracking — **one row per ticket** (UNIQUE ticket_id).

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| ticket_id | UUID FK → tickets UNIQUE | |
| sla_policy_id | UUID FK → sla_policies | |
| response_due_at | TIMESTAMPTZ | |
| resolution_due_at | TIMESTAMPTZ | |
| first_response_at | TIMESTAMPTZ nullable | |
| resolved_at | TIMESTAMPTZ nullable | |
| response_breached | BOOLEAN | default false |
| resolution_breached | BOOLEAN | default false |
| last_warning_at | TIMESTAMPTZ nullable | idempotency helper |
| last_escalation_level | INT nullable | idempotency helper |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**Indexes:**

- `(ticket_id)` UNIQUE
- `(response_due_at)` WHERE NOT response_breached
- `(resolution_due_at)` WHERE NOT resolution_breached
- `(sla_policy_id)`

---

### ticket_sla_escalation_events (NEW)

**Not** `ticket_escalations` — that name is reserved by Phase 1 schema.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| ticket_id | UUID FK → tickets | |
| escalation_level | INT | 1=warning, 2=manager, 3=breach |
| escalation_type | VARCHAR(50) | RESPONSE_WARNING, RESOLUTION_WARNING, RESPONSE_BREACH, RESOLUTION_BREACH, MANAGER_ESCALATION, ADMIN_ESCALATION |
| triggered_at | TIMESTAMPTZ | |
| triggered_by_system | BOOLEAN | default true |
| assigned_to_employee_id | UUID FK nullable | suggested notify target |
| notes | TEXT nullable | |
| created_at | TIMESTAMPTZ | immutable |

**Indexes:**

- `(ticket_id, triggered_at DESC)`
- `(escalation_type, triggered_at DESC)`

No UPDATE/DELETE in application layer.

---

## Migration Files

| File | Purpose |
|------|---------|
| `backend/database/ticket_sla_phase7_3.sql` | Create all tables, indexes, triggers, seeds |
| `backend/database/ticket_sla_phase7_3_rollback.sql` | Drop Phase 7.3 tables only |

### Rollback order

1. `ticket_sla_escalation_events`
2. `ticket_sla`
3. `sla_policies`
4. `department_business_unit_map`
5. `business_units`

**Does NOT drop:** `ticket_sla_rules`, Phase 1 `ticket_escalations`, or any EMS tables.

---

## Coexistence with Phase 1 SLA

| Phase 1 | Phase 7.3 | When flag OFF | When flag ON |
|---------|-----------|---------------|--------------|
| `tickets.sla_*` | `ticket_sla` | Legacy tab uses tickets columns | Legacy tab unchanged; Engine uses ticket_sla |
| `ticket_sla_rules` | `sla_policies` | sla.service.js uses rules | Engine uses policies; rules untouched |
| `ticket_escalations` | `ticket_sla_escalation_events` | Unused | Engine writes events table only |

---

## RLS Consideration

Phase 7.3 tables follow same pattern as Phase 7.1/7.2: backend uses `supabaseAdmin` (service role). Optional future file: `enable_sla_engine_rls.sql` — out of scope for v1 unless required by security audit.
