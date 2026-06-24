# EVENT STORE ARCHITECTURE
# Enterprise Event Logging, Versioning, and State Replay Engine

This document defines the schema, lifecycle, version control, and replay strategy for the system event store.

---

## 1. Event Store Schema (SQL)

The `event_store` table acts as the source of truth for all transactional changes, capturing state changes for replay and audit compliance:

```sql
-- Central Event Ledger
CREATE TABLE event_store (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    aggregate_type VARCHAR(100) NOT NULL, -- e.g., 'TICKET', 'APPROVAL'
    aggregate_id UUID NOT NULL,            -- e.g., ticket_id, approval_id
    event_type VARCHAR(100) NOT NULL,     -- e.g., 'ticket.created', 'sla.breached'
    event_version INTEGER NOT NULL DEFAULT 1,
    
    -- Payload Configuration
    payload JSONB NOT NULL,                -- complete state metadata
    meta_data JSONB DEFAULT '{}'::jsonb,   -- caller IP, browser user agent, transaction ID
    
    actor_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for lookup speed and replay traversal
CREATE INDEX idx_es_aggregate ON event_store(tenant_id, aggregate_type, aggregate_id);
CREATE INDEX idx_es_type_time ON event_store(event_type, created_at DESC);
```

---

## 2. Event Lifecycle & Versioning

```
[ Event Occurs ] ──► [ Validate Schema ] ──► [ Write Event Store ] ──► [ Dispatch to BullMQ ]
                         (Version check)        (Postgres Ledger)        (Asynchronous Workers)
```

1. **Generation:** When a state change occurs, a new event payload is generated.
2. **Versioning:** The schema matches the `event_version` registration. If the payload model changes, the version is incremented (e.g., v2 payload has new billing fields). The backend supports version-specific parsers to maintain backward compatibility.
3. **Persistence:** The event record is written to the `event_store` table.
4. **Queue Dispatch:** The database commit trigger enqueues the event payload to the matching BullMQ queues for asynchronous consumption.

---

## 3. BullMQ Integration & Processing

* Workers listen to event channels via BullMQ queues (`workflow-queue`, `sla-queue`, `notify-queue`).
* Jobs are created in Redis using a unique id string: `event:tenant_id:aggregate_id:created_at`. This prevents processing duplicate events (idempotency).

---

## 4. Replay Strategy & System Recovery

### Replay Strategy
To rebuild the state of an aggregate (e.g., reconstructing a ticket's status history after a crash):
1. Query all historical events for the target aggregate, sorted chronologically:
   ```sql
   SELECT event_type, payload FROM event_store
   WHERE tenant_id = :tenant_id AND aggregate_type = 'TICKET' AND aggregate_id = :ticket_id
   ORDER BY created_at ASC;
   ```
2. Feed these events sequentially to a reducer function:
   $$\text{State}_{n+1} = \text{Reduce}(\text{State}_n, \text{Event}_{n+1})$$
3. This recalculates the current state, validating transaction consistency.

### Disaster Recovery
If the primary transactional database is corrupted, the system can rebuild operational states by running a full replay of the event store log up to the timestamp of the last database backup.

---

## 5. Retention & Archiving Policy

* **Hot Data Storage (Postgres):** Events are kept in the primary database for 90 days.
* **Warm Data Storage (Partitions):** Events older than 90 days are partitioned into monthly tables.
* **Cold Storage Archiving:** A background cron job runs every month, exports partitions older than 365 days to compressed gzip formats, uploads them to secure S3 bucket storage, and drops the Postgres partition to free up database storage.
* **Audit & Analytics Integrations:** The reporting cron reads records directly from the event store to build performance matrices, avoiding direct queries to active ticket transactional tables.
