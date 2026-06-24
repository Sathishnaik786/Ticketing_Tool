# SYSTEM SETTINGS REGISTRY
# Dynamic Configuration Registry and Performance Settings

This document outlines the database design, caching architecture, and admin controls for the centralized system settings registry.

---

## 1. Registry Database Schema (SQL)

```sql
-- Centralized Configurations Registry
CREATE TABLE system_settings (
    key VARCHAR(100) PRIMARY KEY,       -- e.g., 'workflow.max_depth', 'sla.check_interval'
    value VARCHAR(255) NOT NULL,        -- stringified value, typed in application code
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('WORKFLOW', 'SLA', 'CACHE', 'AUDIT', 'NOTIFICATION', 'SECURITY')),
    validation_regex VARCHAR(255),      -- regex validation check rule for updates
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Registry Configs
INSERT INTO system_settings (key, value, description, category, validation_regex) VALUES
('workflow.max_depth', '10', 'Maximum circular step hops allowed in single ticket execution path', 'WORKFLOW', '^[1-9][0-9]?$'),
('sla.check_interval', '60', 'Interval in seconds to check for SLA breaches', 'SLA', '^[1-9][0-9]*$'),
('dashboard.cache_ttl', '300', 'Cache duration in seconds for executive dashboards data', 'CACHE', '^[0-9]+$'),
('audit.retention_days', '365', 'Retention time in days for audit log records before cold archive', 'AUDIT', '^[1-9][0-9]*$'),
('notification.retry_count', '3', 'Maximum retries for failed email/SMS delivery notifications', 'NOTIFICATION', '^[0-9]$');
```

---

## 2. Caching Strategy (Redis & Memory)

To prevent querying the database on every configuration lookup, settings are cached in Redis:

```
[ Application Service ]
         │
         ├──► 1. Check Local Node In-Memory Cache (5s TTL)
         │         (Found? Return value)
         │
         ├──► 2. Check Redis Registry Cache `cache:settings:<key>`
         │         (Found? Set Local Node Cache, Return value)
         │
         └──► 3. Query Postgres Database `system_settings`
                   (Found? Set Redis Cache, Set Local Cache, Return value)
```

### Cache Invalidation
When an administrator modifies a setting via the dashboard, the application:
1. Performs validation checks (validating data type against `validation_regex`).
2. Writes the new value to the database `system_settings` table.
3. Publishes an invalidation channel message via Redis Pub/Sub (`invalidation:settings:<key>`).
4. Connected application nodes subscribe to this channel and immediately clear their local caches, ensuring updates apply globally within seconds.

---

## 3. Administrative Interface (Admin UI)

The configurations page is accessible under the Admin menu (`/app/admin/settings`). It organizes settings into tab groups:
* **Workflows:** Configure loops limits and active thresholds.
* **SLAs:** Manage check schedules and notification boundaries.
* **Cache & Logs:** Adjust data eviction retention times and page render caching lifetimes.
* **Notifications:** Setup default retry configurations and rate limits.

Each configuration entry displays its description, current value input box (validated against the configuration regex before submit), and last modified timestamp with the operator username.

---

## 4. RBAC Permission Rules

| Setting Access Level | ADMIN | MANAGER | HR | EMPLOYEE |
|---|---|---|---|---|
| **Read Settings** | Allowed | Allowed | Denied | Denied |
| **Modify WORKFLOW/SLA/SECURITY** | Allowed | Denied | Denied | Denied |
| **Modify CACHE/AUDIT/NOTIFICATION** | Allowed | Denied | Denied | Denied |
| **View Audit Trail** | Allowed | Allowed | Denied | Denied |
